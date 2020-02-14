const request = require('request')
const $async = require('async')

const result = []

const q = $async.queue(function(item, callback) {
  if ($.config.ignore.includes(item.url)) {
    $.i++
    console.log('('+$.i+'/'+$.count+') [IGNORED] ' + item.url)
    return callback()
  }
  request.get(item.url, (err, response) => {
    $.i++
    let statusCode = response.statusCode
    console.log('('+$.i+'/'+$.count+') ['+statusCode+'] ' + item.url)
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
  $.event.emit('/result/', result)
  console.log('all items have been processed');
});

// assign an error callback
q.error(function(err, task) {
  result.push(err)
  console.log(result.length, 'error(s)')
});

function check(item) {
  $.count++
  q.push(item);
}

module.exports = {
  check
}
