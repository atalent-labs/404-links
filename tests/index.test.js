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
                url: 'https://github.com',
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