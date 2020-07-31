const { execAsync } = require('./../exec-async')

module.exports = async () => execAsync('[ -d scandipwa-base ] || (git clone https://github.com/scandipwa/scandipwa-base.git)')
