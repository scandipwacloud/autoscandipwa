const { execAsyncBool } = require('../exec-async')
// Port checker
console.log('\nChecking ports'.blue)

const ports = [
  '80',
  '443',
  '8090',
  '3031',
  '9000',
  '5601',
  '6081',
  '6082',
  '8080',
  '3307',
  '9200',
  '9300',
  '8083',
  '25',
  '1080',
  '6379'
]

module.exports = () =>
  Promise.all(
    ports.map((port) =>
      execAsyncBool(
        `if sudo lsof -i -P -n | grep -qw "*:${port} (LISTEN)"; then echo 1; fi;`
      ).catch(() => {
        console.log('Port '.red + port + ' is used. Please turn off everything what can use it and try again!\n'.red)
        process.exit()
      })
    )
  )
