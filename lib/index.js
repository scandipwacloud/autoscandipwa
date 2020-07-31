require('dotenv').config()
const colors = require('colors')
const portCheck = require('./steps/port-check')
const instanceDownload = require('./steps/instance-download')
const installationFile = require('./steps/installation')
const { aliases, mode } = require('./steps/user-setup')
const { setupComposer } = require('./steps/get-composer-data')
const generator = require('./steps/cert-generator')
const configEdit = require('./steps/config-edit')
const runStep = require('./steps/run')

async function main () {
  await aliases()
  await setupComposer()

  await Promise.all([
    portCheck(),
    installationFile()
  ])

  await instanceDownload()

  await Promise.all([
    configEdit(),
    generator()
  ])
  await runStep(mode)
}

main().then().catch()
