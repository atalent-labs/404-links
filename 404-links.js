const $404 = require('./src')
const path = require('path')
const minimist = require('minimist')

const argv = minimist(process.argv.slice(2), {
  default: { 
    'ignore-url': [],
    'ignore-files': []
  }
});

let options = {
  log: console.log,
  folder: argv.folder,
  ignore: {
    urls: argv['ignore-url'],
    files: argv['ignore-files']
  }
}

if (!Array.isArray(options.ignore.urls)) {
  options.ignore.urls = [options.ignore.urls]
}

options.ignore.urls.push('https://')
options.ignore.urls.push('http://')

if (!Array.isArray(options.ignore.files)) {
  options.ignore.files = [options.ignore.files]
}

let stream = new $404(options)


stream
  .on('data', (chunk) => {
   const { status, passed, url } = JSON.parse(chunk.toString())
   options.log(`> ${passed ? '✅':'❌'} - [${status}] - ${url}`)
  })
  .on('end', function() {
    options.log('=====================================================')
    const errors = this.errors
    if (this.errors.length) {
      options.log(`${this.errors.length} Errors:`)
      errors.forEach(err => {
        options.log(`${err.status} - ${err.url}`)
      })
    } else {
      options.log('> All links are reachable 🥳')
    }
    process.exit(errors.length ? 1 : 0)
  })

  
