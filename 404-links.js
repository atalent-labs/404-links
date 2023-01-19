const $404 = require('./src')
const path = require('path')
const fs = require('fs')
const YAML = require('yaml')
const chalk = require('chalk')


let options = {
  configFile: path.resolve(process.cwd(), '.404-links.yml'),
  log: console.log,
  folder: process.cwd(),
  delay: {},
  ignore: {
    urls: [],
    files: []
  }
}


options.log(`\n`)
options.log(`😁  I'm so thrilled to be here an support you on this task.`)
options.log(`Let's take a look at the different links from your markdown files real quick!`)

if (true === fs.existsSync(options.configFile)) {
  const yaml = YAML.parse(fs.readFileSync(options.configFile).toString('utf-8'))
  options = Object.assign(options, yaml)
} else {
  options.log(`> No config file has been found on the folder ${path.dirname(options.configFile)}`)
}

options.log('=====================================================')
options.log(`> Folder to parse: ${options.folder}`)
options.ignore.urls && options.log(`> Url to ignore: ${options.ignore.urls.length}`)
options.ignore.files && options.log(`> File to ignore: ${options.ignore.files.length}`)
options.log('=====================================================')


options.ignore.urls.push('https://')
options.ignore.urls.push('http://')

const stream = new $404(options)
stream
  .on('data', (chunk) => {
     const { status, passed, url} = JSON.parse(chunk.toString())
     options.log(`> ${passed ? '✅':'❌'} - [${status}] - ${url}`)
  })
  .on('end', function() {
    options.log('=====================================================')
    const errors = this.errors
    if (this.errors.length) {
      options.log(`> ${this.errors.length} Errors:`)
      errors.forEach(err => {
        options.log(`   * ${chalk.red(err.status)} - ${chalk.underline(err.url)} in the file ${chalk.yellow(err.file)}`)
      })
    } else {
      options.log('> All the links are reachable 🥳')
    }
    options.log(`If you have any issue do not hesitate to open an issue on ${chalk.green('https://github.com/restqa/404-links')}`)
    process.exit(errors.length ? 1 : 0)
  })

  
