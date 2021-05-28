const execa = require('execa')
const emoji = require('node-emoji')
const chalk = require('chalk')

const firstLog = `${emoji.get('fast_forward')} ${chalk.yellow('Building...')}`
const secondLog = `${emoji.get('fast_forward')} ${chalk.yellow('Pushing...')}`
const thirdLog = `${emoji.get('rocket')} ${chalk.green('Your app successfully deployed')} ${emoji.get('rocket')}`

;(async () => {
  try {
    const { stdout: currentBranch } = await execa.command('git branch --show-current')
    await execa.command('git checkout --orphan gh-pages')
    console.log(firstLog)
    await execa.command('yarn build', { stdio: 'inherit' })

    // Idée de https://stackoverflow.com/questions/48521177/404-when-reloading-a-vue-website-published-to-github-pages
    await execa.command('cd dist && cp index.html 404.html && cd ..')

    await execa.command('git --work-tree dist add --all')
    await execa.command('git --work-tree dist commit -m "gh-pages"')
    console.log(secondLog)
    await execa.command('git push origin HEAD:gh-pages --force', { stdio: 'inherit' })
    await execa.command('rm -r dist')
    await execa.command(`git checkout -f ${currentBranch}`)
    await execa.command('git branch -D gh-pages')
    console.log(thirdLog)
  } catch (e) {
    console.log(e.message)
    process.exit(1)
  }
})()
