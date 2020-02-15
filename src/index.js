const EventEmitter = require('events')
const find = require('find')
const File = require('./files')
const Url = require('./urls')
const fs = require('fs')

function main (config) {
  config.count = 0
  config.i = 0
  config.event = new EventEmitter()
  config.ignore = config.ignore || []

  if (Array.isArray(config.ignore) === false) {
    throw new Error('The option value "ignore" should be an array')
  }

  if (fs.existsSync(config.folder) === false) {
    throw new Error('The folder "./rerere" doesn\'t exist')
  }

  const file = new File(config)
  const url = new Url(config)

  find.file(/\.md$/, config.folder, function (files) {
    files.forEach(_ => config.event.emit('/file/', _))
  })

  config.event.on('/file/', file.search)
  config.event.on('/url/', url.check)

  return config.event
}

module.exports = main
