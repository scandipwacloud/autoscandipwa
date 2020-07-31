const { exec, spawn } = require('child_process')

const execAsync = (command, options) =>
  new Promise((resolve, reject) => {
    exec(command, options, (err, stdout) =>
      err ? reject(err) : resolve(stdout)
    )
  })

const execAsyncStream = (command, options = {}, callback = () => {}) =>
  new Promise((resolve, reject) => {
    const [cmd, ...args] = command.split(' ').filter(Boolean)
    const stream = spawn(
      cmd,
      args,
      {
        ...options,
        stdio: ['inherit']
      }
    )
    stream.stderr.on('data', data => callback(data.toString()))
    stream.stdout.on('data', data => callback(data.toString()))
    stream.on('error', e => {
      console.log(e)
      reject(e)
    })
    stream.on('close', code => {
      if (code !== 0) reject(new Error(`Process exited with ${code}`))
      else resolve(false)
    })
  })

const execAsyncBool = async (command, options) => {
  const result = await execAsync(command, options)
  if (result.toString().trim() === '1') {
    throw new Error('')
  }
}

module.exports = {
  execAsync,
  execAsyncBool,
  execAsyncStream
}
