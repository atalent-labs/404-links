const fs = require('fs')

function search(file) {
  let content = fs.readFileSync(file).toString('utf-8')
  let urls = content.match(/\(((https|http){1}.*?)\)/gm)
  if (!urls) return 
  urls.forEach(url => {
    url = url.replace('(', '').replace(')', '')
    $.event.emit('/url/', {file, url})
  })
}

module.exports = {
  search
}
