const { spawn, exec, execSync } = require('child_process')
const { execAsync, execAsyncBool, execAsyncStream } = require('../exec-async')
const fs = require('fs')
const OS = process.platform

async function checkFile (file, searchString) {
  const data = await fs.promises.readFile(file, 'utf8')
  return data.includes(searchString)
}

function dockerCheck (command, options = {}) {
  return new Promise((resolve, reject) => {
    const [cmd, ...args] = command.split(' ').filter(Boolean)
    const dockerLogs = spawn(
      cmd,
      args,
      { ...options, stdio: ['inherit'] }
    )
    dockerLogs.stderr.on('data', data => console.log(data.toString()))
    dockerLogs.stdout.on('data', (data) => {
      console.log(data.toString())
      if (data.toString().includes('Staring php fpm, ready to rock')) {
        dockerLogs.kill('SIGKILL')
        resolve(true)
      }
    })
    dockerLogs.on('close', code => {
      if (code !== 0) reject(new Error(`Docker exited with ${code}`))
      else resolve(false)
    })
    dockerLogs.on('error', reject)
  })
}

function openInstance () {
  if (OS === 'linux') {
    try {
      exec("sudo -u $USER xdg-open 'https://scandipwa.local'")
    } catch (e) {
      exec("sudo -u $(logname) xdg-open 'https://scandipwa.local'")
    }
  } else {
    exec('open https://scandipwa.local')
  }
  process.exit()
}

module.exports = async (mode) => {
  let instanceReady = false
  console.log('\nRUNNING PHASE'.magenta)
  execSync('cd scandipwa-base && docker-compose -f docker-compose.yml -f docker-compose.local.yml -f docker-compose.ssl.yml -f docker-compose.frontend.yml pull', { stdio: 'inherit' })

  // On each OS container name is different
  const container = OS === 'darwin' ? 'mutagen-powered-app' : 'scandipwa-base_app_1'

  // Linux
  if (OS === 'linux') {
    // Elasticsearch fix by default
    await execAsync('sudo sysctl -w vm.max_map_count=262144')

    // Clear all the existing docker logs
    await execAsync('sudo find /var/lib/docker/containers/ -type f -name "*.log" -delete')

    if (mode === 'dev') {
      await execAsyncStream('docker-compose -f docker-compose.yml -f docker-compose.local.yml -f docker-compose.ssl.yml -f docker-compose.frontend.yml up -d --remove-orphans --force-recreate',
        { cwd: 'scandipwa-base' }, console.log)
    } else {
      await execAsyncStream(
        'docker-compose -f docker-compose.yml -f docker-compose.local.yml -f docker-compose.ssl.yml up -d --remove-orphans --force-recreate',
        { cwd: 'scandipwa-base' }, console.log)
    }
    // Logs of app container
    instanceReady = await dockerCheck(`docker logs -f ${container}`)
  }

  // MacOS
  else if (OS === 'darwin') {
    if (mode === 'dev') {
      instanceReady = await dockerCheck('mutagen project mutagen.frontend.yml start',
        { cwd: 'scandipwa-base' })
    } else {
      instanceReady = await dockerCheck('mutagen project -f mutagen.local.yml start',
        { cwd: 'scandipwa-base' })
    }
  }

  if (instanceReady) {
    const runned = await checkFile('.env', 'RUNNED=')
    if (!runned) {
      // Write to .env that we runned the instance to skip setup
      await fs.promises.appendFile('.env', 'RUNNED=1\n')

      // Import demo for the first time only
      await execAsyncStream(`docker exec -u user ${container} composer require scandipwa/sample-data`,
        { cwd: 'scandipwa-base' },
        console.log)
      await execAsyncStream(`docker exec -u user ${container} php bin/magento setup:upgrade`,
        { cwd: 'scandipwa-base' },
        console.log)
    }

    let ready = false
    try {
      await execAsyncBool('curl -ILs https://scandipwa.local | grep -wq "HTTP/1.1 200 OK" && echo 0')
        .then(ready = true)
    } catch (e) {
      ready = false
    }

    if (ready) {
      openInstance()
    } else {
      // Varnish + 503 Error fix
      await execAsync('cd scandipwa-base && docker-compose -f docker-compose.yml -f docker-compose.local.yml -f docker-compose.ssl.yml restart nginx ssl-term')
      await execAsync('cd scandipwa-base && docker-compose -f docker-compose.yml -f docker-compose.local.yml -f docker-compose.ssl.yml restart varnish')
      openInstance()
    }
  }
}
