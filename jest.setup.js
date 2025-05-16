const { setupServer } = require('msw/node')
const { rest } = require('msw')

const status = {
    'https://github.com': 200,
    'https://gitlab.com': 201,
    'https://bitbucket.com': 204,
    'https://broken.com/test': 404,
    'https://broken.com': 403,
    'https://gittlab.com': 500,
    'https://ggithub.com': 401,
    'http://restqa.io': 200,
    'http://restqa.io/logo.png': 200,
    'https://en.wikipedia.org/wiki/Container_\\(virtualization\\)': 200,
    'https://owasp.org/www-community/attacks/SQL_Injection': 200
}

const endpoints = Object.entries(status)
    .map(([url, statusCode]) => rest.get(url, (req, res, ctx) => res(ctx.status(statusCode))))

global.mockRemoteServer = setupServer(...endpoints)
