const NotFoundLinks = require('../src')


beforeAll(() => mockRemoteServer.listen())
afterEach(() => mockRemoteServer.resetHandlers())
afterAll(() => mockRemoteServer.close())

test('throw an error if the options pass doesn\'t contains a valid folder', () => {
  expect(() => {
    const options = {
      folder: '/fooooooo'
    }
    NotFoundLinks(options)
  }).toThrow('The folder "/fooooooo" doesn\'t exist, please share an existing folder.')
})
