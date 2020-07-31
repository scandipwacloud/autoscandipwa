const { execAsync } = require('./../exec-async')
const readlineSync = require('readline-sync')
const OS = process.platform

// Alias level
const aliasFile = (OS === 'darwin' ? `/Users/${process.env.USER}/.zsh` : `/home/${process.env.USER}/.bash_aliases`)
const alias = [
  `alias localtheme='"mutagen project -f mutagen.local.yml"'`,
  `alias front='"mutagen project -f mutagen.frontend.yml"'`,
  `alias dc='"docker-compose -f docker-compose.yml -f docker-compose.local.yml -f docker-compose.ssl.yml"'`,
  `alias dcf='"docker-compose -f docker-compose.yml -f docker-compose.local.yml -f docker-compose.ssl.yml -f docker-compose.frontend.yml"'`,
  `alias inapp='"docker-compose -f docker-compose.yml -f docker-compose.local.yml -f docker-compose.ssl.yml -f docker-compose.frontend.yml exec -u user app"'`,
  `alias infront='"docker-compose -f docker-compose.yml -f docker-compose.local.yml -f docker-compose.ssl.yml -f docker-compose.frontend.yml exec -w /var/www/public/app/design/frontend/Scandiweb/pwa/ frontend"'`,
  `alias applogs='"docker-compose logs -f --tail=100 app"'`,
  `alias frontlogs='"docker-compose -f docker-compose.yml -f docker-compose.local.yml -f docker-compose.ssl.yml -f docker-compose.frontend.yml logs -f --tail=100 frontend"'`,
]

// Mode of instance
console.log('\nIf you run instance for the first time - please choose prod mode!'.red)
const mode = readlineSync.question(
  'Which deploy mode you want to have? dev or prod (default)\n'.blue,
  { defaultInput: 'prod', limit: ['dev', 'prod'] }
)

async function aliases () {
  await console.log('Please enter your password\n'.yellow)
  await execAsync('sudo echo "test"')
  await console.log('Password entered\n'.green)

  const aliasesExists = (await execAsync("if grep -wq 'alias localtheme' " + aliasFile + "; then echo 1; fi;")).toString().trim()
  await execAsync(`touch ${aliasFile}`)
  await execAsync(`touch .env`)

  // If aliases doesn't exist
  if (aliasesExists !== '1') {
    // If user wants to have aliases
    const aliasWanted = readlineSync.question(
      'Do you want to bind aliases? | 1/Y - Yes (default), 0/N - No\n'.blue,
      {
        defaultInput: 1,
        trueValue: ['Y', 'y', 1],
        falseValue: ['N', 'n', 0],
        limit: [0, 1, 'Y', 'y', 'N', 'n']
      }
    )

    if (aliasWanted === true) {
      await Promise.all(
        alias.map((oneAlias) =>
          execAsync(`sudo echo ${oneAlias} >> ${aliasFile}`)
        )
      )
      console.log('Aliases added\n'.green)
    }
  }
}

module.exports = { aliases, mode }
