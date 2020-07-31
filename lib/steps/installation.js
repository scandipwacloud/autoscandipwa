const OS = process.platform
const { execAsync } = require('../exec-async')
const runned = process.env.RUNNED

async function dockerCompose () {
  try {
    await execAsync('docker-compose -v')
    console.log('Docker-compose installed!'.green)
  } catch (e) {
    console.log('Installing docker-compose'.yellow)
    if (OS === 'linux') {
      try {
        await execAsync('yes | sudo pacman -Syu docker-compose')
      } catch (e) {
        await execAsync('sudo curl -fsSL "https://github.com/docker/compose/releases/download/1.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose && sudo chmod +x /usr/local/bin/docker-compose\n')
      }
    } else {
      await execAsync('brew install docker-compose')
    }
  }
}

async function gitInstall () {
  try {
    await execAsync('git --version')
    console.log('Git installed!'.green)
  } catch (e) {
    console.log('Installing git'.yellow)
    if (OS === 'linux') {
      try {
        await execAsync('yes | sudo pacman -Syu git')
      } catch (e) {
        await execAsync('sudo apt-get install -y git')
      }
    } else {
      await execAsync('brew install git')
    }
  }
}

async function dockerInstall () {
  try {
    await execAsync('docker -v')
    console.log('Docker installed!'.green)
  } catch (e) {
    console.log('Installing Docker'.yellow)
    try {
      await execAsync('yes | sudo pacman -S docker')
    } catch (e) {
      try {
        await execAsync('sudo apt-get install -y docker-ce docker-ce-cli containerd.io')
      } catch (e) {
        console.log('Please install docker manually.'.red)
        process.exit()
      }
    }
    // Permissions
    try {
      await execAsync('sudo usermod -aG docker $USER')
    } catch (e) {
      await execAsync('sudo usermod -aG docker $(logname)')
    }

    // Check if docker works
    try {
      await execAsync('docker ps')
    } catch (e) {
      try {
        await execAsync('sudo service docker start')
      } catch (e) {
        try {
          await execAsync('sudo systemctl start docker')
        } catch (e) {
          console.log('Something is wrong with docker/docker installation!'.red)
          process.exit()
        }
        await execAsync('sudo chmod 666 /var/run/docker.sock')
      }
    }
  }
}

async function mutagenInstall () {
  try {
    await execAsync('mutagen version')
    console.log('Mutagen installed!'.green)
  } catch (e) {
    console.log('Installing mutagen'.yellow)
    await execAsync('brew install mutagen-io/mutagen/mutagen')
  }
}

module.exports = async () => {
  await console.log('\nTools installation'.yellow)
  if (!runned) {
    if (OS === 'linux') {
      await Promise.all([
        dockerInstall(),
        dockerCompose(),
        gitInstall()
      ])
    } else {
      await Promise.all([
        dockerCompose(),
        gitInstall(),
        mutagenInstall()
      ])
    }
  }
  await console.log('Everything installed'.green)
}
