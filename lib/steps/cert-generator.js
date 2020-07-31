const { execAsync } = require('../exec-async')
const OS = process.platform

module.exports = async () => {
  const runned = process.env.RUNNED
  let generated = false

  if (!runned) {
    console.log('SSL CERTIFICATE GENERATION PHASE'.magenta)

    // Linux or MacOS
    const currentDir = (await execAsync('pwd')).trim()
    const uid = (await execAsync('id -u')).trim()
    const gid = (await execAsync('id -g')).trim()
    const certsExists = (await execAsync('([ -f scandipwa-base/opt/cert/scandipwa-ca.key ] && [ -f scandipwa-base/opt/cert/server_key.pem ] && [ -f scandipwa-base/opt/cert/scandipwa-fullchain.pem ]) && echo 2 || (sudo rm -rf scandipwa-base/opt && echo 0) ')).trim()

    if (certsExists !== '2') {
      try {
        await execAsync('mkdir -p scandipwa-base/opt/cert')
      } catch (e) {
        console.log('Something went wrong!\n')
      }
      try {
        await execAsync(
          `docker run -t --rm --init \
-e UID=${uid} -e GID=${gid} \
-w='/cert' \
--mount type=bind,source=${currentDir}/scandipwa-base/deploy/shared/conf/local-ssl,target=/cert_config/ \
--mount type=bind,source=${currentDir}/scandipwa-base/opt/cert,target=/cert \
--mount type=bind,source=${currentDir}/scandipwa-base/deploy/create_certificates.sh,target=/usr/local/bin/create_certificates \
alpine:latest create_certificates`
        )
        generated = true
      } catch (e) {
        console.log(e)
        console.log('SSL certificates are not generated'.red)
      }
    } else {
      generated = true
    }

    if (generated) {
      if (OS === 'linux') {
	try {
          await execAsync(
            '([ -f /usr/share/ca-certificates/scandipwa-ca.pem ] && echo 1) || (sudo cp scandipwa-base/opt/cert/scandipwa-ca.pem /usr/share/ca-certificates/scandipwa-ca.pem && sudo update-ca-certificates)'
          )
	} catch (e) {
	  console.log("Something is wrong with SSL certs! Please add them to trusted manually!".red)
	}
      } else if (OS === 'darwin') {
        await execAsync(
          'sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain scandipwa-base/opt/cert/scandipwa-ca.pem'
        )
      }
      console.log('SSL Certificates generated!'.green)
    }
  }
}
