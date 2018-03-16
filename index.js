const getConfig = require('probot-config')

module.exports = (robot) => {
  robot.on(['issues.opened', 'issues.edited', 'issues.reopened'], async context => {
    const config = await getConfig(context, 'issuecomplete.yml')
    if (!config) {
      context.error('No config found, please add an file at .github/issuecomplete.yml')
      return new Error('No config found, please add an file at .github/issuecomplete.yml')
    }
    const body = context.payload.issue.body
    context.log('Checking to ensure all items are checked', body)
    const hasUncheckedItems = /-\s\[\s\]/g.test(body)
    if (hasUncheckedItems) {
      addLabelToIssue(context, config)
      addCommentToIssue(context, config)
    } else {
      removeLabelFromIssue(context, config)
    }
  })

  async function createLabelIfNotExists (context, labelName, labelColor) {
    const {owner, repo} = context.repo()
    context.log('Checking to see if the label exists', {'Owner': owner, 'Repo': repo, 'Label': labelName})
    return context.github.issues.getLabel({owner, repo, name: labelName}).catch(() => {
      context.log('Creating label in repository', labelName, labelColor)
      return context.github.issues.createLabel({owner, repo, name: labelName, color: labelColor})
    })
  }

  async function addLabelToIssue (context, config) {
    const labelName = config['labelName']
    const labelColor = config['labelColor']
    const issueLabel = context.issue({labels: [labelName]})
    await createLabelIfNotExists(context, labelName, labelColor)
    context.log('Adding label to issue', {'Label': issueLabel, 'Issue': context.issue()})
    return context.github.issues.addLabels(issueLabel)
  }

  async function removeLabelFromIssue (context, config) {
    const labelName = config['labelName']
    const labelRemoval = context.issue({name: labelName})
    context.log('Removing label from issue', {labelRemoval})
    return context.github.issues.removeLabel(labelRemoval)
  }

  async function addCommentToIssue (context, config) {
    const commentText = context.issue({body: config['commentText']})
    context.log('Adding comment to issue', {'Comment': commentText, 'Issue': context.issue()})
    return context.github.issues.createComment(commentText)
  }
}
