const got = require('got')
const fs = require('fs')

module.exports = function(result=[], cb) {
  try {
    const { 
      CI = 'false',
      GITHUB_TOKEN,
      GITHUB_ACTION_REPOSITORY,
      GITHUB_API_URL,
      GITHUB_EVENT_PATH
    } = process.env

    if (!CI === 'true' || !GITHUB_TOKEN || !GITHUB_EVENT_PATH || result.length === 0) return cb()

    if (false === fs.existsSync(GITHUB_EVENT_PATH)) return cb()
    const event = JSON.parse(fs.readFileSync(GITHUB_EVENT_PATH, 'utf8'))
    const prNumber = event.pull_request.number
    const options = {
      method: 'POST',
      prefixUrl: GITHUB_API_URL,
      url: `${GITHUB_ACTION_REPOSITORY}/pulls/${prNumber}/comments`,
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`
      },
      json: {
        body: `

        `.trim()
      }
    }

    got(options)

  } catch (e) {
    cb(e)
  }
}
