const IssueBodyChecker = require('./src/issueBodyChecker.js')
const ConfigBuilder = require('./src/configBuilder.js')

module.exports = (robot) => {
  robot.on(['issues.opened', 'issues.edited', 'issues.reopened'], async context => {
    const config = await ConfigBuilder.getValidConfig(context)
    const body = context.payload.issue.body
    if (!(await IssueBodyChecker.isBodyValid(body, config, context))) {
      await addLabelToIssue(context, config)
      if (context.payload.action !== 'edited') {
        await addCommentToIssue(context, config)
      }
    } else {
      await removeLabelFromIssue(context, config)
    }
  })

  async function createLabelIfNotExists (context, labelName, labelColor) {
    const { owner, repo } = context.repo()
    return context.github.issues.getLabel({ owner, repo, name: labelName }).catch(() => {
      return context.github.issues.createLabel({ owner, repo, name: labelName, color: labelColor })
    })
  }

  async function addLabelToIssue (context, config) {
    const issueLabel = context.issue({ labels: [config.labelName] })
    await createLabelIfNotExists(context, config.labelName, config.labelColor)
    return context.github.issues.addLabels(issueLabel)
  }

  async function removeLabelFromIssue (context, config) {
    const labelName = config.labelName
    const labelRemoval = context.issue({ name: labelName })
    return context.github.issues.removeLabel(labelRemoval)
  }

  async function addCommentToIssue (context, config) {
    const commentText = context.issue({ body: config.commentText })
    return context.github.issues.createComment(commentText)
  }
}
