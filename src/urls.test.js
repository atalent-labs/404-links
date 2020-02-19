beforeEach(() => {
  jest.resetModules()
})

describe('#src - urls.check', () => {
  test('successfull check', () => {
    const $async = require('async')
    jest.mock('async')
    const q = {
      drain: jest.fn(),
      error: jest.fn(),
      push: jest.fn()
    }
    $async.queue = jest.fn().mockReturnValue(q)

    const config = {
      count: 0
    }
    const Urls = require('./urls')
    const n = new Urls(config)
    const item = {
      title: 'title',
      url: 'url'
    }
    n.check(item)

    expect(config.count).toBe(1)
    expect(q.push.mock.calls.length).toEqual(1)
    expect(q.push.mock.calls[0][0]).toEqual(item)
  })

  test('queue drain', () => {
    const $async = require('async')
    jest.mock('async')
    const q = {
      drain: jest.fn(f => {
        f.call()
      }),
      error: jest.fn(),
      push: jest.fn()
    }
    $async.queue = jest.fn().mockReturnValue(q)

    const config = {
      count: 0,
      log: jest.fn(),
      event: {
        emit: jest.fn()
      }
    }
    const Urls = require('./urls')
    const n = new Urls(config)
    const item = {
      title: 'title',
      url: 'url'
    }
    n.check(item)

    expect(q.drain.mock.calls.length).toEqual(1)
    expect(q.drain.mock.calls[0][0]).toBeInstanceOf(Function)
    expect(config.event.emit.mock.calls.length).toEqual(1)
    expect(config.event.emit.mock.calls[0][0]).toEqual('end')
    expect(config.event.emit.mock.calls[0][1]).toEqual([])
    expect(config.log.mock.calls.length).toEqual(1)
    expect(config.log.mock.calls[0][0]).toEqual('all items have been processed')
  })

  test('queue error', () => {
    const $async = require('async')
    jest.mock('async')
    const q = {
      error: jest.fn(f => {
        f.call('errorMsg')
      }),
      drain: jest.fn(),
      push: jest.fn()
    }
    $async.queue = jest.fn().mockReturnValue(q)

    const config = {
      count: 0,
      log: jest.fn(),
      event: {
        emit: jest.fn()
      }
    }
    const Urls = require('./urls')
    const n = new Urls(config)
    const item = {
      title: 'title',
      url: 'url'
    }
    n.check(item)

    expect(q.error.mock.calls.length).toEqual(1)
    expect(q.error.mock.calls[0][0]).toBeInstanceOf(Function)
    expect(config.log.mock.calls.length).toEqual(1)
    expect(config.log.mock.calls[0][0]).toEqual(1)
    expect(config.log.mock.calls[0][1]).toEqual('error(s)')
  })

  test('queue handler but url is ignored', () => {
    const $async = require('async')
    jest.mock('async')
    const q = {
      error: jest.fn(),
      drain: jest.fn(),
      push: jest.fn()
    }

    const item = {
      url: 'http://test.local',
      file: '/test/toto.js'
    }

    const cb = jest.fn()

    $async.queue = jest.fn(f => {
      f.call(this, item, cb)
      return q
    })

    const config = {
      count: 30,
      i: 0,
      log: jest.fn(),
      event: {
        emit: jest.fn()
      },
      ignore: [
        'http://test.local'
      ]
    }

    const Urls = require('./urls')
    const n = new Urls(config)
    n.check(item)

    expect($async.queue.mock.calls.length).toBe(1)
    expect($async.queue.mock.calls[0][0]).toBeInstanceOf(Function)
    expect($async.queue.mock.calls[0][1]).toBe(5)
    expect(config.i).toBe(1)
    expect(q.error.mock.calls.length).toEqual(1)
    expect(q.error.mock.calls[0][0]).toBeInstanceOf(Function)
    expect(config.log.mock.calls.length).toEqual(1)
    expect(config.log.mock.calls[0][0]).toEqual('(1/30) [IGNORED] http://test.local')
    expect(cb.mock.calls.length).toEqual(1)
    expect(cb.mock.calls[0][0]).toBeUndefined()
  })

  test('queue handler but an error occured during the request', () => {
    const request = require('request')
    jest.mock('request')

    request.get = jest.fn((url, cb) => {
      cb.call(this, { code: 555 })
    })

    const $async = require('async')
    jest.mock('async')
    const q = {
      error: jest.fn(),
      drain: jest.fn(),
      push: jest.fn()
    }

    const item = {
      url: 'http://test.local',
      file: '/test/toto.js'
    }

    const cb = jest.fn()

    $async.queue = jest.fn(f => {
      f.call(this, item, cb)
      return q
    })

    const config = {
      count: 30,
      i: 0,
      log: jest.fn(),
      event: {
        emit: jest.fn()
      },
      ignore: []
    }

    const Urls = require('./urls')
    const n = new Urls(config)
    n.check(item)

    expect($async.queue.mock.calls.length).toBe(1)
    expect($async.queue.mock.calls[0][0]).toBeInstanceOf(Function)
    expect($async.queue.mock.calls[0][1]).toBe(5)
    expect(config.i).toBe(1)
    expect(q.error.mock.calls.length).toEqual(1)
    expect(q.error.mock.calls[0][0]).toBeInstanceOf(Function)
    expect(config.log.mock.calls.length).toEqual(1)
    expect(config.log.mock.calls[0][0]).toEqual('(1/30) [555] http://test.local')
    expect(cb.mock.calls.length).toEqual(1)
    const expectedResult = {
      statusCode: 555,
      message: 'Error [555] An issue occured on the url http://test.local in the file : /test/toto.js',
      url: 'http://test.local',
      file: '/test/toto.js'
    }
    expect(cb.mock.calls[0][0]).toEqual(expectedResult)
  })

  test('queue handler but response code is not 2XX', () => {
    const request = require('request')
    jest.mock('request')

    request.get = jest.fn((url, cb) => {
      cb.call(this, undefined, { statusCode: 404 })
    })

    const $async = require('async')
    jest.mock('async')
    const q = {
      error: jest.fn(),
      drain: jest.fn(),
      push: jest.fn()
    }

    const item = {
      url: 'http://test.local',
      file: '/test/toto.js'
    }

    const cb = jest.fn()

    $async.queue = jest.fn(f => {
      f.call(this, item, cb)
      return q
    })

    const config = {
      count: 30,
      i: 0,
      log: jest.fn(),
      event: {
        emit: jest.fn()
      },
      ignore: []
    }

    const Urls = require('./urls')
    const n = new Urls(config)
    n.check(item)

    expect($async.queue.mock.calls.length).toBe(1)
    expect($async.queue.mock.calls[0][0]).toBeInstanceOf(Function)
    expect($async.queue.mock.calls[0][1]).toBe(5)
    expect(config.i).toBe(1)
    expect(q.error.mock.calls.length).toEqual(1)
    expect(q.error.mock.calls[0][0]).toBeInstanceOf(Function)
    expect(config.log.mock.calls.length).toEqual(1)
    expect(config.log.mock.calls[0][0]).toEqual('(1/30) [404] http://test.local')
    expect(cb.mock.calls.length).toEqual(1)
    const expectedResult = {
      statusCode: 404,
      message: 'Error [404] An issue occured on the url http://test.local in the file : /test/toto.js',
      url: 'http://test.local',
      file: '/test/toto.js'
    }
    expect(cb.mock.calls[0][0]).toEqual(expectedResult)
  })

  test('queue handler but response code is 2XX', () => {
    const request = require('request')
    jest.mock('request')

    request.get = jest.fn((url, cb) => {
      cb.call(this, undefined, { statusCode: 201 })
    })

    const $async = require('async')
    jest.mock('async')
    const q = {
      error: jest.fn(),
      drain: jest.fn(),
      push: jest.fn()
    }

    const item = {
      url: 'http://test.local',
      file: '/test/toto.js'
    }

    const cb = jest.fn()

    $async.queue = jest.fn(f => {
      f.call(this, item, cb)
      return q
    })

    const config = {
      count: 30,
      i: 0,
      log: jest.fn(),
      event: {
        emit: jest.fn()
      },
      ignore: []
    }

    const Urls = require('./urls')
    const n = new Urls(config)
    n.check(item)

    expect($async.queue.mock.calls.length).toBe(1)
    expect($async.queue.mock.calls[0][0]).toBeInstanceOf(Function)
    expect($async.queue.mock.calls[0][1]).toBe(5)
    expect(config.i).toBe(1)
    expect(q.error.mock.calls.length).toEqual(1)
    expect(q.error.mock.calls[0][0]).toBeInstanceOf(Function)
    expect(config.log.mock.calls.length).toEqual(1)
    expect(config.log.mock.calls[0][0]).toEqual('(1/30) [201] http://test.local')
    expect(cb.mock.calls.length).toEqual(1)
    expect(cb.mock.calls[0][0]).toBeUndefined()
  })
})
