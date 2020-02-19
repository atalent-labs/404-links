const request = require('request')
const $async = require('async')

function Url (config) {
  const result = []

  const q = $async.queue(function (item, callback) {
    if (config.ignore.includes(item.url)) {
      config.i++
      config.log('(' + config.i + '/' + config.count + ') [IGNORED] ' + item.url)
      return callback()
    }
    request.get(item.url, (err, response) => {
      config.i++
      const statusCode = (err && err.code) || response.statusCode
      config.log('(' + config.i + '/' + config.count + ') [' + statusCode + '] ' + item.url)
      let result
      if (statusCode.toString()[0] !== '2') {
        result = Object.assign({
          statusCode,
          message: 'Error [' + statusCode + '] An issue occured on the url ' + item.url + ' in the file : ' + item.file
        }, item)
      }
      callback(result)
    })
  }, 5)

  // assign a callback
  q.drain(function () {
    config.event.emit('end', result)
    config.log('all items have been processed')
  })

  // assign an error callback
  q.error(function (err) {
    result.push(err)
    config.log(result.length, 'error(s)')
  })

  function check (item) {
    config.count++
    q.push(item)
  }

  return {
    check
  }
}

module.exports = Url
