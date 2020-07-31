const { execAsync } = require('./../exec-async')
const runned = process.env.RUNNED

module.exports = async () => {
  if (!runned) {
    console.log('\nConfig PHASE'.yellow)

    // Linux or MacOS
    try {
      const tobeAdded = '127.0.0.1 scandipwa.local'
      await execAsync(
        "sudo grep -q 'scandipwa.local' /etc/hosts; [ $? -eq 0 ] || sudo bash -c 'echo -e " +
        tobeAdded +
        " >> /etc/hosts'"
      )
    } catch (e) {}

    console.log('Configs are edited!'.green)
  }
}
