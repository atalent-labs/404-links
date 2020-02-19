beforeEach(() => {
  jest.resetModules()
})

describe('#src - files.search', () => {
  test('Don\'t emit an event if the file found is in node_module', () => {
    const config = {
      event: {
        emit: jest.fn()
      }
    }
    const Files = require('./files')
    const n = new Files(config)
    n.search('/toto/node_modules/test.js')

    expect(config.event.emit.mock.calls.length).toBe(0)
  })

  test('Don\'t emit an event if in the file found there is no url', () => {
    const fs = require('fs')
    jest.mock('fs')
    fs.readFileSync = jest.fn().mockReturnValue('hello')

    const config = {
      event: {
        emit: jest.fn()
      }
    }
    const Files = require('./files')
    const n = new Files(config)
    n.search('/toto/test.js')

    expect(fs.readFileSync.mock.calls.length).toBe(1)
    expect(fs.readFileSync.mock.calls[0][0]).toBe('/toto/test.js')
    expect(config.event.emit.mock.calls.length).toBe(0)
  })

  test('emit an event if in the file found there is 1 url', () => {
    const fs = require('fs')
    jest.mock('fs')
    fs.readFileSync = jest.fn().mockReturnValue('(http://test.com)')

    const config = {
      event: {
        emit: jest.fn()
      }
    }
    const Files = require('./files')
    const n = new Files(config)
    n.search('/toto/test.js')

    expect(fs.readFileSync.mock.calls.length).toBe(1)
    expect(fs.readFileSync.mock.calls[0][0]).toBe('/toto/test.js')
    expect(config.event.emit.mock.calls.length).toBe(1)
    const expectedEvent = {
      file: '/toto/test.js',
      url: 'http://test.com'
    }
    expect(config.event.emit.mock.calls[0][0]).toEqual('/url/')
    expect(config.event.emit.mock.calls[0][1]).toEqual(expectedEvent)
  })

  test('emit an event if in the file found there is multiple urls', () => {
    const fs = require('fs')
    jest.mock('fs')
    fs.readFileSync = jest.fn().mockReturnValue('(http://test.com) (http://cool.com) (http://super.com)')

    const config = {
      event: {
        emit: jest.fn()
      }
    }
    const Files = require('./files')
    const n = new Files(config)
    n.search('/toto/test.js')

    expect(fs.readFileSync.mock.calls.length).toBe(1)
    expect(fs.readFileSync.mock.calls[0][0]).toBe('/toto/test.js')
    expect(config.event.emit.mock.calls.length).toBe(3)

    let expectedEvent = {
      file: '/toto/test.js',
      url: 'http://test.com'
    }
    expect(config.event.emit.mock.calls[0][0]).toEqual('/url/')
    expect(config.event.emit.mock.calls[0][1]).toEqual(expectedEvent)

    expectedEvent = {
      file: '/toto/test.js',
      url: 'http://cool.com'
    }
    expect(config.event.emit.mock.calls[1][0]).toEqual('/url/')
    expect(config.event.emit.mock.calls[1][1]).toEqual(expectedEvent)

    expectedEvent = {
      file: '/toto/test.js',
      url: 'http://super.com'
    }
    expect(config.event.emit.mock.calls[2][0]).toEqual('/url/')
    expect(config.event.emit.mock.calls[2][1]).toEqual(expectedEvent)
  })
})
