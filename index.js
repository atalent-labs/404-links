

((path) =>  {
  const EventEmitter = require('events')
  const find = require('find')
  const File = require('./files')
  const Url = require('./urls')

  global.$ = {
    event: new EventEmitter(),
    config: {
      ignore: [
        'https://www.udemy.com/understand-nodejs'
      ]
    },
    count: 0,
    i: 0
  }
  find.file(/\.md$/, path, function(files) {
    files.forEach(_ => $.event.emit('/file/', _))
  })
  $.event.on('/file/', File.search)
  $.event.on('/url/', Url.check)
  $.event.on('/result/', (result) => {
    if (result.length) {
      result.forEach(err => {
        console.log(err.message)
      })
    } else {
      console.log('All links are OK')
    }
    
    process.exit(result.length ? 1 : 0)
  })
})(process.argv[2])


