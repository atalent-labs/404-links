const got = require('got')

module.exports = async function(result=[]) {
  try {
    const { 
      CI = 'false',
      GITHUB_TOKEN,
      GITHUB_REPOSITORY,
      GITHUB_SHA,
      GITHUB_API_URL,
    } = process.env

    if (!GITHUB_API_URL || !GITHUB_REPOSITORY) return

    const http = got.extend({
      prefixUrl: GITHUB_API_URL + '/repos/' + GITHUB_REPOSITORY,
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`
      }
    })

    if (!CI === 'true' || !GITHUB_TOKEN || !GITHUB_SHA) return 

    const pulls = await http.get('commits/' +  GITHUB_SHA + '/pulls').json()
    const PULL_ID = (pulls.find(pull => pull.state === 'open') || {}).number

    if (!PULL_ID) return

    const options = {
      url: `pulls/${PULL_ID}/reviews`,
      json: {
        body: getComment(result),
        event: 'COMMENT',
        comments: result.map(item => {
          return {
            line: item.line,
            path: item.file,
            body: getReviewComment(item)
          }
        })
      }
    }
    await http.post(options)
  } catch (e) {
    console.log('Error during the creation of the review', e)
  }
}

function getComment(items) {
  return `
Hey, I found ${items.length} links that seems to be broken. 🐛
Wanna take a look at it?
  `.trim()
}

function getReviewComment(item) {
  return `
${getEmoji(item.status)} Oups, it's sound like this url 👆 response a status code of **${item.status}**
  `.trim()
}

function getEmoji(status) {
  return {
    '400': '😩',
    '401': '⚔️',
    '403': '🔑',
    '404': '😱',
    '500': '🔥',
    '502': '⛑️',
    '504': '🚧',
  }[String(status)] || '💩'

}
