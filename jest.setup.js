const { setupServer } = require('msw/node')
const { rest } = require('msw')

const status = {
    'https://github.com': 200,
    'https://gitlab.com': 201,
    'https://bitbucket.com': 204
}

const endpoints = Object.entries(status)
    .map(([url, statusCode]) => rest.get(url, (req, res, ctx) => res(ctx.status(statusCode))))

global.mockRemoteServer = setupServer(...endpoints)