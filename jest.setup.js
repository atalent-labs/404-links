const { setupServer } = require('msw/node')
const { rest } = require('msw')

const status =  {
  'https://github.com/nodejs/undici': 204
}

const endpoints = Object.entries(status)
  .map(([url, statusCode]) => rest.get(url, (req, res, ctx) => res(ctx.status(statusCode))))

global.mockRemoteServer = setupServer(...endpoints)
