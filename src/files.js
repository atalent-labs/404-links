const fs = require('fs')
const path = require('path')

function File(config) {

  const search = function (file) {
    if (path.parse(file).dir.match(/node_modules/)) return
    let content = fs.readFileSync(file).toString('utf-8')
    let urls = content.match(/\(((https|http){1}.*?)\)/gm)
    if (!urls) return 
    urls.forEach(url => {
      url = url.replace('(', '').replace(')', '')
      config.event.emit('/url/', {file, url})
    })
  }

  return {
    search
  }
}

module.exports = File
