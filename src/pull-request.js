const got = require('got')
const fs = require('fs')

module.exports = function(result=[]) {
  try {
    const { 
      CI = 'false',
      GITHUB_TOKEN,
      GITHUB_ACTION_REPOSITORY,
      GITHUB_API_URL,
      GITHUB_EVENT_PATH
    } = process.env

    console.log(process.env)
    if (false === fs.existsSync(GITHUB_EVENT_PATH)) return 
    const evt = JSON.parse(fs.readFileSync(GITHUB_EVENT_PATH, 'utf8'))

    console.log(JSON.stringify(evt, null, 2))


    if (!CI === 'true' || !GITHUB_TOKEN || !GITHUB_EVENT_PATH || result.length === 0) return 

    if (false === fs.existsSync(GITHUB_EVENT_PATH)) return 
    const event = JSON.parse(fs.readFileSync(GITHUB_EVENT_PATH, 'utf8'))

    console.log(JSON.stringify(event, null, 2))

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
