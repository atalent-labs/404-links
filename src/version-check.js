const got = require('got')
const fs = require('fs')

module.exports = async function () {

  const {
    GITHUB_STEP_SUMMARY,
    GITHUB_API_URL, // 'https://api.github.com'
    GITHUB_ACTION_REPOSITORY, // 'restqa/404-links'
    GITHUB_WORKFLOW_REF, // 'olivierodo/issue-test/.github/workflows/markdown-lint.yml@refs/heads/olivierodo-patch-1'
    GITHUB_ACTION_REF, // 'pull-request-review'
    GITHUB_REPOSITORY, // 'olivierodo/issue-test'
    GITHUB_SERVER_URL, // 'https://github.com'
    DEBUG
  } = process.env

  try {

    if (!GITHUB_API_URL || !GITHUB_ACTION_REPOSITORY) return
  
    const URL = `${GITHUB_API_URL}/repos/${GITHUB_ACTION_REPOSITORY}/releases/latest`
    const { tag_name } = await got.get(URL).json()
  
    if (GITHUB_ACTION_REF === tag_name) return
  
    const workflowFile = GITHUB_WORKFLOW_REF.replace(GITHUB_REPOSITORY + '/', '').split('@').shift()
  
    if (!fs.existsSync(workflowFile)) return 
  
    const contentWorkflowFile = fs.readFileSync(workflowFile).toString('utf-8')
    const newWorkflowContent = contentWorkflowFile.replace(GITHUB_ACTION_REF, tag_name)
  
    const repoURL = `${GITHUB_SERVER_URL}/${GITHUB_ACTION_REPOSITORY}`
    const summaryContent = [
      '',
      '---',
      `Hey it sound like you are running an older version of the Github action: [${GITHUB_ACTION_REPOSITORY}](${repoURL}) 😢`,
      '',
      `The latest version (${tag_name}) is available 🚀`,
      '',
      `Here the new content for your workflow on \`${workflowFile}\`:`,
      '',
      '```yaml',
      newWorkflowContent,
      '```',
      '---',
      `❤️ Support us but giving  a star ⭐on [Github](${repoURL})`
      
    ].join('\n')
  
    if (!GITHUB_STEP_SUMMARY) return 
    fs.appendFileSync(GITHUB_STEP_SUMMARY, '\n' + summaryContent)
  } catch (e) {
    console.log('An error occured during the check of latest Github action version')
    if (!DEBUG) return
    console.log(e)
  }
}
