import { execa } from 'execa';
import emoji from 'node-emoji'
import chalk from 'chalk'

const firstLog = `${emoji.get('fast_forward')} ${chalk.yellow('Building...')}`
const secondLog = `${emoji.get('fast_forward')} ${chalk.yellow('Pushing...')}`
const thirdLog = `${emoji.get('rocket')} ${chalk.green('Your app successfully deployed')} ${emoji.get('rocket')}`

;(async () => {
  try {
    const { stdout: currentBranch } = await execa('git', ['branch', '--show-current'])
    await execa('git', ['checkout', '--orphan', 'gh-pages'])
    console.log(firstLog)
    await execa('yarn', ['build'], { stdio: 'inherit' })

    // Idée de https://stackoverflow.com/questions/48521177/404-when-reloading-a-vue-website-published-to-github-pages
    await execa('cp', ['dist/index.html', 'dist/404.html'])

    // Idée de https://stackoverflow.com/questions/66311145/github-pages-custom-domain-settings-gets-reset-during-new-commit
    // Afin de garder le domaine réseau-constellation.ca dans le déploiement Github
    await execa('touch', ['dist/CNAME'])
    await execa('echo', ['"xn--rseau-constellation-bzb.ca" > dist/CNAME'], { stdio: 'inherit', shell: true })
    await execa('ls', ['dist'], { stdio: 'inherit' })
    await execa('cat', ['dist/CNAME'], { stdio: 'inherit' })

    await execa('git', ['--work-tree', 'dist', 'add', '--all'])
    await execa('git', ['--work-tree', 'dist', 'commit', '-m', '"gh-pages"'])
    console.log(secondLog)

    await execa('git', ['push', 'origin', 'HEAD:gh-pages', '--force'], { stdio: 'inherit' })
    await execa('rm', ['-r', 'dist'])
    await execa('git', ['checkout', '-f', currentBranch])
    await execa('git', ['branch', '-D', 'gh-pages'])
    console.log(thirdLog)

  } catch (e) {
    console.log(e.message)
    process.exit(1)
  }
})()
