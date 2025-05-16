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
        new NotFoundLinks(options)
    }).toThrow('The folder "/fooooooo" doesn\'t exist, please share an existing folder.')
})

test('Get the sucessful result of the remote calls', (done) => {
    const options = {
      folder: path.resolve(__dirname, 'fixtures/remote-success-case-1-link')
    }
    const stream = new NotFoundLinks(options)
    stream
      .on('data', (chunk) => {
        expect(JSON.parse(chunk.toString())).toEqual({
            url: 'https://github.com/',
            status: 200,
            passed: true,
            file: 'file1.md',
            line: 7
        })
      })
      .on('end', done)
      .on('error', done)
})

test('Get the right url when the url is within parentheses', (done) => {
    const options = {
      folder: path.resolve(__dirname, 'fixtures/remote-url-in-parentheses')
    }
    const stream = new NotFoundLinks(options)
    .on('data', () => {})
    .on('end', () => {
      try {
          const { result, errors } = stream
          expect(result.length).toEqual(3)
          expect(result[0]).toEqual({
              url: 'http://restqa.io/logo.png',
              status: 200,
              passed: true,
              line: 7,
              file: 'file4.md'
          })
          expect(result[1]).toEqual({
              url: 'http://restqa.io/',
              status: 200,
              passed: true,
              line: 7,
              file: 'file4.md'
          })
          expect(result[2]).toEqual({
              url: 'https://github.com/',
              status: 200,
              passed: true,
              line: 8,
              file: 'file4.md'
          })
          expect(errors.length).toEqual(0)
          done()
      } catch (err) {
          done(err)
      }
    })
    .on('error', done)
})

test('Get the right url when the url finishes with a ")"', (done) => {
    const options = {
      folder: path.resolve(__dirname, 'fixtures/remote-url-contain-parenthese')
    }
    const stream = new NotFoundLinks(options)
    stream
      .on('data', (chunk) => {
        expect(JSON.parse(chunk.toString())).toEqual({
            url: 'https://en.wikipedia.org/wiki/Container_(virtualization)',
            status: 200,
            passed: true,
            file: 'file4.md',
            line: 7
        })
      })
      .on('end', done)
      .on('error', done)
})

test('Get the right url when the url contains a backslash', (done) => {
    const options = {
      folder: path.resolve(__dirname, 'fixtures/remote-url-with-backslash')
    }
    const stream = new NotFoundLinks(options)
    .on('data', () => {})
    .on('end', () => {
      try {
          const { result, errors } = stream
          expect(result.length).toEqual(4)
          expect(result[0]).toEqual({
              url: 'http://restqa.io/logo.png',
              status: 200,
              passed: true,
              line: 7,
              file: 'file4.md'
          })
          expect(result[1]).toEqual({
              url: 'http://restqa.io/',
              status: 200,
              passed: true,
              line: 7,
              file: 'file4.md'
          })
          expect(result[2]).toEqual({
              url: 'https://github.com/',
              status: 200,
              passed: true,
              line: 8,
              file: 'file4.md'
          })
          expect(result[3]).toEqual({
              url: 'https://owasp.org/www-community/attacks/SQL_Injection',
              status: 200,
              passed: true,
              line: 9,
              file: 'file4.md'
          })
          expect(errors.length).toEqual(0)
          done()
      } catch (err) {
          done(err)
      }
    })
    .on('error', done)
})

test('Get 2 sucessful result of the remote calls (status code 200/201)', (done) => {
    const options = {
      folder: path.resolve(__dirname, 'fixtures/remote-success-case-2-links'),
    }
    const stream = new NotFoundLinks(options)
    .on('data', () => {})
    .on('end', () => {
      try {
          const { result, errors } = stream
          expect(result.length).toEqual(2)
          expect(result[0]).toEqual({
              url: 'https://github.com/',
              status: 200,
              passed: true,
              line: 7,
              file: 'file2.md'
          })
          expect(result[1]).toEqual({
              url: 'https://gitlab.com/',
              status: 201,
              passed: true,
              line: 8,
              file: 'file2.md'
          })
          expect(errors.length).toEqual(0)
          done()
      } catch (err) {
          done(err)
      }
    })
    .on('error', done)
})

test('Get 2 sucessful result of the remote calls (status code 200/201)', (done) => {
    const options = {
      folder: path.resolve(__dirname, 'fixtures/remote-success-case-2-links'),
    }
    const stream = new NotFoundLinks(options)
    .on('data', () => {})
    .on('end', () => {
      try {
          const { result, errors } = stream
          expect(result.length).toEqual(2)
          expect(result[0]).toEqual({
              url: 'https://github.com/',
              status: 200,
              passed: true,
              line: 7,
              file: 'file2.md'
          })
          expect(result[1]).toEqual({
              url: 'https://gitlab.com/',
              status: 201,
              passed: true,
              line: 8,
              file: 'file2.md'
          })
          expect(errors.length).toEqual(0)
          done()
      } catch (err) {
          done(err)
      }
    })
    .on('error', done)
})

test('Get 2 sucessful result and 1 broken of the remote calls (status code 200/201/404)', () => {
  return new Promise((resolve, reject) => {
    const options = {
      folder: path.resolve(__dirname, 'fixtures/remote-invalid-case-3-links'),
    }
    const stream = new NotFoundLinks(options)
    .on('data', () => {})
    .on('end', () => {
      try {
          const { result, errors } = stream
          expect(result.length).toEqual(3)
          expect(result[0]).toEqual({
              url: 'https://github.com/',
              status: 200,
              passed: true,
              line: 7,
              file: 'file3.md'
          })
          expect(result[1]).toEqual({
              url: 'https://gitlab.com/',
              status: 201,
              passed: true,
              line: 8,
              file: 'file3.md'
          })
          expect(result[2]).toEqual({
              url: 'https://broken.com/test',
              status: 404,
              passed: false,
              line: 9,
              file: 'file3.md'
          })
          expect(errors.length).toEqual(1)
          expect(errors[0]).toEqual({
              url: 'https://broken.com/test',
              status: 404,
              passed: false,
              line: 9,
              file: 'file3.md'
          })
          resolve()
      } catch (err) {
          reject(err)
      }
    })
    .on('error', reject)
  })
})

test('Get only 4 broken of the remote calls (status code 404/ 500/ 403 /401)', () => {
  return new Promise((resolve, reject) => {
    const options = {
      folder: path.resolve(__dirname, 'fixtures/remote-invalid-case-4-links'),
    }
    const stream = new NotFoundLinks(options)
    .on('data', () => {})
    .on('end', () => {
      try {
          const { result, errors } = stream
          expect(result.length).toEqual(4)
          expect(result[0]).toEqual({
              url: 'https://ggithub.com/',
              status: 401,
              passed: false,
              line: 7,
              file: 'file4.md'
          })
          expect(result[1]).toEqual({
              url: 'https://gittlab.com/',
              status: 500,
              passed: false,
              line: 8,
              file: 'file4.md'
          })
          expect(result[2]).toEqual({
              url: 'https://broken.com/test',
              status: 404,
              passed: false,
              line: 9,
              file: 'file4.md'
          })
          expect(result[3]).toEqual({
              url: 'https://broken.com/',
              status: 403,
              line: 10,
              passed: false,
              file: 'file4.md'
          })
          expect(errors.length).toEqual(4)
          expect(errors).toEqual(result)
          resolve()
      } catch (err) {
          reject(err)
      }
    })
    .on('error', reject)
  })
})

test('Duplicate - Get 2 sucessful result and 1 broken of the remote calls', () => {
  return new Promise((resolve, reject) => {
    const options = {
      folder: path.resolve(__dirname, 'fixtures/remote-duplicate-links'),
    }
    const stream = new NotFoundLinks(options)
    .on('data', () => {})
    .on('end', () => {
      try {
          const { result, errors } = stream
          expect(result.length).toEqual(3)
          expect(result[0]).toEqual({
              url: 'https://github.com/',
              status: 200,
              passed: true,
              line: 7,
              file: 'file3.md'
          })
          expect(result[1]).toEqual({
              url: 'https://gitlab.com/',
              status: 201,
              passed: true,
              line: 15,
              file: 'file3.md'
          })
          expect(result[2]).toEqual({
              url: 'https://broken.com/test',
              status: 404,
              passed: false,
              line: 16,
              file: 'file3.md'
          })
          expect(errors.length).toEqual(1)
          expect(errors[0]).toEqual({
              url: 'https://broken.com/test',
              status: 404,
              passed: false,
              line: 16,
              file: 'file3.md'
          })
          resolve()
      } catch (err) {
          reject(err)
      }
    })
    .on('error', reject)
  })
})

test('Duplicate and multiple files - Get 3 sucessful result and 3 broken of the remote calls', () => {
  return new Promise((resolve, reject) => {
    const options = {
      folder: path.resolve(__dirname, 'fixtures/remote-multiple-files')
    }
    const stream = new NotFoundLinks(options)
    .on('data', () => {})
    .on('end', () => {
      try {
          const { result, errors } = stream
          expect(result.length).toEqual(6)
          expect(result[0]).toEqual({
              url: 'https://broken.com/test',
              status: 404,
              passed: false,
              line: 7,
              file: 'file-error.md'
          })
          expect(result[1]).toEqual({
              url: 'https://broken.com/',
              status: 403,
              passed: false,
              line: 8,
              file: 'file-error.md'
          })
          expect(result[2]).toEqual({
              url: 'https://ggithub.com/',
              status: 401,
              passed: false,
              line: 7,
              file: 'file-other-extension.mdx'
          })
          expect(result[3]).toEqual({
              url: 'https://bitbucket.com/',
              status: 204,
              line: 8,
              passed: true,
              file: 'file-other-extension.mdx'
          })
          expect(result[4]).toEqual({
              url: 'https://github.com/',
              status: 200,
              passed: true,
              line: 7,
              file: 'file-success.md'
          })
          expect(result[5]).toEqual({
              url: 'https://gitlab.com/',
              status: 201,
              passed: true,
              line: 15,
              file: 'file-success.md'
          })
          expect(errors.length).toEqual(3)
          expect(errors[0]).toEqual({
              url: 'https://broken.com/test',
              status: 404,
              passed: false,
              line: 7,
              file: 'file-error.md'
          })
          expect(errors[1]).toEqual({
              url: 'https://broken.com/',
              status: 403,
              line: 8,
              passed: false,
              file: 'file-error.md'
          })
          expect(errors[2]).toEqual({
              url: 'https://ggithub.com/',
              line: 7,
              status: 401,
              passed: false,
              file: 'file-other-extension.mdx'
          })
          resolve()
      } catch (err) {
          reject(err)
      }
    })
    .on('error', reject)
  })
})


test('Ignore urls', () => {
  return new Promise((resolve, reject) => {
    const options = {
      folder: path.resolve(__dirname, 'fixtures/remote-multiple-files'),
      ignore: {
        urls: [
          'https://gitlab.com',
          'https://github.com'
        ]
      }
    }
    const stream = new NotFoundLinks(options)
    .on('data', () => {})
    .on('end', () => {
      try {
          const { result, errors } = stream
          expect(result.length).toEqual(6)
          expect(result[0]).toEqual({
              url: 'https://broken.com/test',
              status: 404,
              passed: false,
              line: 7,
              file: 'file-error.md'
          })
          expect(result[1]).toEqual({
              url: 'https://broken.com/',
              status: 403,
              passed: false,
              line: 8,
              file: 'file-error.md'
          })
          expect(result[2]).toEqual({
              url: 'https://ggithub.com/',
              status: 401,
              passed: false,
              line: 7,
              file: 'file-other-extension.mdx'
          })
          expect(result[3]).toEqual({
              url: 'https://bitbucket.com/',
              status: 204,
              passed: true,
              line: 8,
              file: 'file-other-extension.mdx'
          })
          expect(result[4]).toEqual({
              url: 'https://github.com/',
              status: 'IGNORED',
              line: 7,
              passed: true,
              file: 'file-success.md'
          })
          expect(result[5]).toEqual({
              url: 'https://gitlab.com/',
              status: 'IGNORED',
              passed: true,
              line: 15,
              file: 'file-success.md'
          })
          expect(errors.length).toEqual(3)
          expect(errors[0]).toEqual({
              url: 'https://broken.com/test',
              status: 404,
              line: 7,
              passed: false,
              file: 'file-error.md'
          })
          expect(errors[1]).toEqual({
              url: 'https://broken.com/',
              status: 403,
              passed: false,
              line: 8,
              file: 'file-error.md'
          })
          expect(errors[2]).toEqual({
              url: 'https://ggithub.com/',
              status: 401,
              line: 7,
              passed: false,
              file: 'file-other-extension.mdx'
          })
          resolve()
      } catch (err) {
          reject(err)
      }
    })
    .on('error', reject)
  })
})

test('Incorrect url', () => {
  return new Promise((resolve, reject) => {
    const options = {
      folder: path.resolve(__dirname, 'fixtures/remote-incorrect-url'),
      httpsOnly: true
    }
    const stream = new NotFoundLinks(options)
    .on('data', () => {})
    .on('end', () => {
      try {
          const { result, errors } = stream
          expect(result.length).toEqual(2)
          expect(result[0]).toEqual({
              url: 'http://',
              status: 'ERR_INVALID_URL',
              passed: false,
              file: 'file4.md',
              line: 7
          })
          expect(result[1]).toEqual({
              url: 'https:',
              status: 'ERR_INVALID_URL',
              passed: false,
              file: 'file4.md',
              line: 8
          })
          expect(errors.length).toEqual(2)
          expect(errors[0]).toEqual({
              url: 'http://',
              status: 'ERR_INVALID_URL',
              passed: false,
              file: 'file4.md',
              line: 7
          })
          expect(errors[1]).toEqual({
              url: 'https:',
              status: 'ERR_INVALID_URL',
              passed: false,
              file: 'file4.md',
              line: 8
          })
          resolve()
      } catch (err) {
          reject(err)
      }
    })
    .on('error', reject)
  })
})

test('https only options enable', () => {
  return new Promise((resolve, reject) => {
    const options = {
      folder: path.resolve(__dirname, 'fixtures/remote-url-http'),
      httpsOnly: true
    }
    const stream = new NotFoundLinks(options)
    .on('data', () => {})
    .on('end', () => {
      try {
          const { result, errors } = stream
          expect(result.length).toEqual(2)
          expect(result[0]).toEqual({
              url: 'http://restqa.io/',
              status: 'SHOULD_BE_HTTPS',
              passed: false,
              file: 'file4.md',
              line: 7
          })
          expect(result[1]).toEqual({
              url: 'https://github.com/',
              status: 200,
              passed: true,
              file: 'file4.md',
              line: 8
          })
          expect(errors.length).toEqual(1)
          expect(errors[0]).toEqual({
              url: 'http://restqa.io/',
              status: 'SHOULD_BE_HTTPS',
              passed: false,
              file: 'file4.md',
              line: 7
          })
          resolve()
      } catch (err) {
          reject(err)
      }
    })
    .on('error', reject)
  })
})

test('Ignore files', () => {
  return new Promise((resolve, reject) => {
    const options = {
      folder: path.resolve(__dirname, 'fixtures/remote-multiple-files'),
      ignore: {
        files: [
          './file-success.md'
        ]
      }
    }
    const stream = new NotFoundLinks(options)
    .on('data', () => {})
    .on('end', () => {
      try {
          const { result, errors } = stream
          expect(result.length).toEqual(4)
          expect(result[0]).toEqual({
              url: 'https://broken.com/test',
              status: 404,
              passed: false,
              line: 7,
              file: 'file-error.md'
          })
          expect(result[1]).toEqual({
              url: 'https://broken.com/',
              status: 403,
              passed: false,
              line: 8,
              file: 'file-error.md'
          })
          expect(result[2]).toEqual({
              url: 'https://ggithub.com/',
              status: 401,
              passed: false,
              line: 7,
              file: 'file-other-extension.mdx'
          })
          expect(result[3]).toEqual({
              url: 'https://bitbucket.com/',
              status: 204,
              passed: true,
              line: 8,
              file: 'file-other-extension.mdx'
          })
          expect(errors.length).toEqual(3)
          expect(errors[0]).toEqual({
              url: 'https://broken.com/test',
              status: 404,
              passed: false,
              line: 7,
              file: 'file-error.md'
          })
          expect(errors[1]).toEqual({
              url: 'https://broken.com/',
              status: 403,
              passed: false,
              line: 8,
              file: 'file-error.md'
          })
          expect(errors[2]).toEqual({
              url: 'https://ggithub.com/',
              status: 401,
              file: 'file-other-extension.mdx',
              line: 7,
              passed: false
          })
          resolve()
      } catch (err) {
          reject(err)
      }
    })
    .on('error', reject)
  })
})

test('Ignore urls (using wildcards)', () => {
  return new Promise((resolve, reject) => {
    const options = {
      folder: path.resolve(__dirname, 'fixtures/remote-multiple-files-ignore'),
      ignore: {
        urls: [
          'https://broken.com/*',
          'https://try-out.com/test/*'
        ]
      }
    }
    const stream = new NotFoundLinks(options)
    .on('data', () => {})
    .on('end', () => {
      try {
          const { result, errors } = stream
          expect(result.length).toEqual(7)
          expect(result[0]).toEqual({
              url: 'https://broken.com/test',
              status: 'IGNORED',
              passed: true,
              file: 'file-error.md',
              line: 7
          })
          expect(result[1]).toEqual({
              url: 'https://broken.com/',
              status: 'IGNORED',
              passed: true,
              file: 'file-error.md',
              line: 8
          })
          expect(result[2]).toEqual({
              url: 'https://try-out.com/test',
              status: 'IGNORED',
              passed: true,
              file: 'file-error.md',
              line: 9
          })
          expect(result[3]).toEqual({
              url: 'https://ggithub.com/',
              status: 401,
              passed: false,
              file: 'file-other-extension.mdx',
              line: 7
          })
          expect(result[4]).toEqual({
              url: 'https://bitbucket.com/',
              status: 204,
              passed: true,
              file: 'file-other-extension.mdx',
              line: 8
          })
          expect(result[5]).toEqual({
              url: 'https://github.com/',
              status: 200,
              passed: true,
              file: 'file-success.md',
              line: 7
          })
          expect(result[6]).toEqual({
              url: 'https://gitlab.com/',
              status: 201,
              passed: true,
              file: 'file-success.md',
              line: 15
          })
          expect(errors.length).toEqual(1)
          expect(errors[0]).toEqual({
              url: 'https://ggithub.com/',
              status: 401,
              passed: false,
              file: 'file-other-extension.mdx',
              line: 7
          })
          resolve()
      } catch (err) {
          reject(err)
      }
    })
    .on('error', reject)
  })
})
