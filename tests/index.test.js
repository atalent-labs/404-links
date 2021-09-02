const NotFoundLinks = require('../src')
const { Writable } = require('stream')
const path = require('path')


beforeAll(() => mockRemoteServer.listen())
afterEach(() => mockRemoteServer.resetHandlers())
afterAll(() => mockRemoteServer.close())

test('throw an error if the options folder doesn\'t contains a valid folder', () => {
    expect(() => {
        const options = {
            folder: '/fooooooo'
        }
        NotFoundLinks(options)
    }).toThrow('The folder "/fooooooo" doesn\'t exist, please share an existing folder.')
})

test('throw an error if the options stream doesn\'t contains a valid Stream', () => {
    expect(() => {
        const options = {
            folder: process.cwd()
        }
        NotFoundLinks(options)
    }).toThrow('The options stream is not defined, please pass a valid Writable stream.')
    expect(() => {
        const options = {
            folder: process.cwd(),
            stream: undefined
        }
        NotFoundLinks(options)
    }).toThrow('The options stream is not defined, please pass a valid Writable stream.')
})

test('Get the sucessful result of the remote calls', (done) => {
    const opt = {
        write: (chunk, _, done) => {
            expect(JSON.parse(chunk.toString())).toEqual({
                url: 'https://github.com/',
                status: 200,
                passed: true
            })
            done()
        }
    }
    const testStream = new Writable(opt)
    testStream.on('finish', done)
    const options = {
        folder: path.resolve(__dirname, 'fixtures/remote-success-case-1-link'),
        stream: testStream
    }
    NotFoundLinks(options)
})

test('Get 2 sucessful result of the remote calls (status code 200/201)', (done) => {
    const results = []
    const opt = {
        write: (chunk, _, cb) => {
            results.push(JSON.parse(chunk.toString()))
            cb()
        }
    }
    const testStream = new Writable(opt)
    testStream.on('finish', () => {
        try {
            expect(results[0]).toEqual({
                url: 'https://github.com/',
                status: 200,
                passed: true
            })
            expect(results[1]).toEqual({
                url: 'https://gitlab.com/',
                status: 201,
                passed: true
            })
            done()
        } catch (err) {
            done(err)
        }
    })
    testStream.on('error', (err) => {
        done(err)
    })
    const options = {
        folder: path.resolve(__dirname, 'fixtures/remote-success-case-2-links'),
        stream: testStream
    }
    NotFoundLinks(options)
})

test('Get 2 sucessful result of the remote calls (status code 200/201)', (done) => {
    const results = []
    const opt = {
        write: (chunk, _, cb) => {
            results.push(JSON.parse(chunk.toString()))
            cb()
        }
    }
    const testStream = new Writable(opt)
    testStream.on('finish', () => {
        try {
            expect(results[0]).toEqual({
                url: 'https://github.com/',
                status: 200,
                passed: true
            })
            expect(results[1]).toEqual({
                url: 'https://gitlab.com/',
                status: 201,
                passed: true
            })
            done()
        } catch (err) {
            done(err)
        }
    })
    testStream.on('error', (err) => {
        done(err)
    })
    const options = {
        folder: path.resolve(__dirname, 'fixtures/remote-success-case-2-links'),
        stream: testStream
    }
    NotFoundLinks(options)
})

test('Get 2 sucessful result and 1 broken of the remote calls (status code 200/201/404)', (done) => {
    const results = []
    const opt = {
        write: (chunk, _, cb) => {
            results.push(JSON.parse(chunk.toString()))
            cb()
        }
    }
    const testStream = new Writable(opt)
    testStream.on('finish', () => {
        try {
            expect(results[0]).toEqual({
                url: 'https://github.com/',
                status: 200,
                passed: true
            })
            expect(results[1]).toEqual({
                url: 'https://gitlab.com/',
                status: 201,
                passed: true
            })
            expect(results[2]).toEqual({
                url: 'https://broken.com/test',
                status: 404,
                passed: false
            })
            done()
        } catch (err) {
            done(err)
        }
    })
    testStream.on('error', (err) => {
        done(err)
    })
    const options = {
        folder: path.resolve(__dirname, 'fixtures/remote-invalid-case-3-links'),
        stream: testStream
    }
    NotFoundLinks(options)
})

test('Get only 4 broken of the remote calls (status code 404/ 500/ 403 /401)', (done) => {
    const results = []
    const opt = {
        write: (chunk, _, cb) => {
            results.push(JSON.parse(chunk.toString()))
            cb()
        }
    }
    const testStream = new Writable(opt)
    testStream.on('finish', () => {
        try {
            expect(results[0]).toEqual({
                url: 'https://ggithub.com/',
                status: 401,
                passed: false
            })
            expect(results[1]).toEqual({
                url: 'https://gittlab.com/',
                status: 500,
                passed: false
            })
            expect(results[2]).toEqual({
                url: 'https://broken.com/test',
                status: 404,
                passed: false
            })
            expect(results[3]).toEqual({
                url: 'https://broken.com/',
                status: 403,
                passed: false
            })
            done()
        } catch (err) {
            done(err)
        }
    })
    testStream.on('error', (err) => {
        done(err)
    })
    const options = {
        folder: path.resolve(__dirname, 'fixtures/remote-invalid-case-4-links'),
        stream: testStream
    }
    NotFoundLinks(options)
})

test('Duplicate - Get 2 sucessful result and 1 broken of the remote calls', (done) => {
    const results = []
    const opt = {
        write: (chunk, _, cb) => {
            results.push(JSON.parse(chunk.toString()))
            cb()
        }
    }
    const testStream = new Writable(opt)
    testStream.on('finish', () => {
        try {
            expect(results.length).toEqual(3)
            expect(results[0]).toEqual({
                url: 'https://github.com/',
                status: 200,
                passed: true
            })
            expect(results[1]).toEqual({
                url: 'https://gitlab.com/',
                status: 201,
                passed: true
            })
            expect(results[2]).toEqual({
                url: 'https://broken.com/test',
                status: 404,
                passed: false
            })
            done()
        } catch (err) {
            done(err)
        }
    })
    testStream.on('error', (err) => {
        done(err)
    })
    const options = {
        folder: path.resolve(__dirname, 'fixtures/remote-duplicate-links'),
        stream: testStream
    }
    NotFoundLinks(options)
})

test('Duplicate and multiple files - Get 2 sucessful result and 2 broken of the remote calls', (done) => {
    const results = []
    const opt = {
        write: (chunk, _, cb) => {
            results.push(JSON.parse(chunk.toString()))
            cb()
        }
    }
    const testStream = new Writable(opt)
    testStream.on('finish', () => {
        try {
            expect(results.length).toEqual(4)
            expect(results[0]).toEqual({
                url: 'https://broken.com/test',
                status: 404,
                passed: false
            })
            expect(results[1]).toEqual({
                url: 'https://broken.com/',
                status: 403,
                passed: false
            })
            expect(results[2]).toEqual({
                url: 'https://github.com/',
                status: 200,
                passed: true
            })
            expect(results[3]).toEqual({
                url: 'https://gitlab.com/',
                status: 201,
                passed: true
            })

            done()
        } catch (err) {
            done(err)
        }
    })
    testStream.on('error', (err) => {
        done(err)
    })
    const options = {
        folder: path.resolve(__dirname, 'fixtures/remote-multiple-files'),
        stream: testStream
    }
    NotFoundLinks(options)

})