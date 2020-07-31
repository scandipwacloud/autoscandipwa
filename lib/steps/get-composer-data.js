const fs = require('fs')
const readlineSync = require('readline-sync')
const { execAsync } = require('./../exec-async')
const OS = process.platform

// Alias level
const aliasFile = (OS === 'darwin' ? `/Users/${process.env.USER}/.zsh` : `/home/${process.env.USER}/.bash_aliases`)

async function checkFile (file, searchString) {
  const data = await fs.promises.readFile(file, 'utf8')
  return data.includes(searchString)
}

async function setupComposer () {
  // Script variables
  let composerAuth = process.env.COMPOSER_AUTH
  console.log('COMPOSER_AUTH check'.yellow)

  if (!composerAuth) {
    const composerAuthUsername = readlineSync.question('\nPlease provide COMPOSER_AUTH USERNAME\n'.blue)
    const composerAuthPass = readlineSync.question('\nPlease provide COMPOSER_AUTH PASSWORD\n'.blue)

    if (!composerAuthUsername || composerAuthUsername.length !== 32 || !composerAuthPass || composerAuthPass.length !== 32) {
      console.log('Please check composer data!\n'.red)
      process.exit()
    }

    // Write COMPOSER_AUTH to .env
    composerAuth = JSON.stringify(JSON.parse(`{"http-basic":{"repo.magento.com": {"username": "${composerAuthUsername}", "password": "${composerAuthPass}"}}}`))
  }

  await execAsync(`touch ${aliasFile}`)
  await execAsync('touch .env')

  await Promise.all([
    // Write composer credentials to .env
    checkFile('.env', 'COMPOSER_AUTH').then(exists => {
      if (!exists) return fs.promises.appendFile('.env', `COMPOSER_AUTH='${composerAuth}'\n`)
    }),

    // Write composer credentials to aliases
    checkFile(aliasFile, 'export COMPOSER_AUTH').then(exists => {
      if (!exists) return fs.promises.appendFile(aliasFile, `export COMPOSER_AUTH='${composerAuth}'\n`)
    })
  ])

  console.log('COMPOSER STEP done'.green)
}

module.exports = { setupComposer, aliasFile }
