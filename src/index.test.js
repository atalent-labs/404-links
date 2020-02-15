beforeEach(() => {
  jest.resetModules()
})

describe('#src - main', () => {
  test('throw error when ignore is not an array', () => {
    const src = require('./index')
    const config = {
      ignore: 'eee'
    }
    expect(() => {
      src(config)
    }).toThrow('The option value "ignore" should be an array')
  })

  test('throw error when the folder doesn\'t exist', () => {
    const src = require('./index')
    const config = {
      folder: './rerere'
    }
    expect(() => {
      src(config)
    }).toThrow('The folder "./rerere" doesn\'t exist')
  })
  test('Success Case', () => {
    const EventEmitter = require('events')
    jest.mock('events')

    const fs = require('fs')
    jest.mock('fs')
    fs.existsSync.mockReturnValue(true)

    const find = require('find')
    jest.mock('find')
    find.file = jest.fn((pattern, folder, fn) => {
      fn(['item1', 'item2'])
    })

    const File = require('./files')
    jest.mock('./files')
    File.mockImplementation((config) => {
      return {
        search: 'file.search'
      }
    })

    const Url = require('./urls')
    jest.mock('./urls')
    Url.mockImplementation((config) => {
      return {
        check: 'url.check'
      }
    })

    const config = {
      folder: '/tmp/'
    }

    const src = require('./index')

    const result = src(config)

    expect(config.count).toEqual(0)
    expect(config.i).toEqual(0)
    expect(config.ignore).toEqual([])
    expect(config.event).toEqual(result)
    expect(config.folder).toEqual('/tmp/')
    expect(fs.existsSync.mock.calls.length).toEqual(1)
    expect(fs.existsSync.mock.calls[0]).toEqual(['/tmp/'])
    expect(File.mock.instances.length).toEqual(1)
    expect(File.mock.calls[0]).toEqual([config])
    expect(Url.mock.instances.length).toEqual(1)
    expect(Url.mock.calls[0]).toEqual([config])
    expect(find.file.mock.calls.length).toEqual(1)
    expect(find.file.mock.calls[0][0]).toEqual(/\.md$/)
    expect(find.file.mock.calls[0][1]).toEqual('/tmp/')
    expect(find.file.mock.calls[0][2]).toBeInstanceOf(Function)
    expect(EventEmitter.mock.instances.length).toEqual(1)
    expect(EventEmitter.mock.instances[0].emit.mock.calls.length).toEqual(2)
    expect(EventEmitter.mock.instances[0].emit.mock.calls[0]).toEqual(['/file/', 'item1'])
    expect(EventEmitter.mock.instances[0].emit.mock.calls[1]).toEqual(['/file/', 'item2'])
    expect(EventEmitter.mock.instances[0].on.mock.calls.length).toEqual(2)
    expect(EventEmitter.mock.instances[0].on.mock.calls[0]).toEqual(['/file/', 'file.search'])
    expect(EventEmitter.mock.instances[0].on.mock.calls[1]).toEqual(['/url/', 'url.check'])
  })
})
