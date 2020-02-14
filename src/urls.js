const request = require('request')
const $async = require('async')

function Url(config) {

  const result = []
  
  const q = $async.queue(function(item, callback) {
    if (config.ignore.includes(item.url)) {
      config.i++
      console.log('('+config.i+'/'+config.count+') [IGNORED] ' + item.url)
      return callback()
    }
    request.get(item.url, (err, response) => {
      config.i++
      let statusCode = (err && err.code) || response.statusCode 
      console.log('('+config.i+'/'+config.count+') ['+statusCode+'] ' + item.url)
      let result
      if ('2' !== statusCode.toString()[0]) {
        result = Object.assign({
          statusCode,
          message: 'Error ['+ statusCode +'] An issue occured on the url ' + item.url + ' in the file : ' + item.file 
        },item)
      }
      callback(result)
    })
  }, 5);
  
  // assign a callback
  q.drain(function() {
    config.event.emit('end', result)
    console.log('all items have been processed');
  });
  
  // assign an error callback
  q.error(function(err, task) {
    result.push(err)
    console.log(result.length, 'error(s)')
  });
  
  function check(item) {
    config.count++
    q.push(item);
  }

  return {
    check
  }
}

module.exports = Url
