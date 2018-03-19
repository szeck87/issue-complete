const defaultConfig = {
  labelName: 'waiting-for-user-information',
  labelColor: 'ffffff',
  commentText: 'Thanks for opening an issue on bot-testing. I see you haven\'t provided all of the information in the list. Please update the issue to include more information.'
}

module.exports = (robot) => {
  robot.on(['issues.opened', 'issues.edited', 'issues.reopened'], async context => {
    const config = await context.config('issuecomplete.yml', defaultConfig)
    validateConfig(context, config)
    const body = context.payload.issue.body
    context.log('Checking to ensure all items are checked', body)
    const hasUncheckedItems = /-\s\[\s\]/g.test(body)
    if (hasUncheckedItems) {
      addLabelToIssue(context, config)
      if (context.payload.action !== 'edited') {
        addCommentToIssue(context, config)
      }
    } else {
      removeLabelFromIssue(context, config)
    }
  })

  function validateConfig (context, config) {
    const validColor = /^[0-9A-F]{6}$/i.test(config.labelColor)
    if (!validColor) {
      context.log.error('Invalid color in config file, using default')
      config.labelColor = defaultConfig.labelColor
    }
    if (config.labelName.length > 50) {
      context.log.error('Too many characters for label name in config file, using default')
      config.labelName = defaultConfig.labelName
    }
  }

  async function createLabelIfNotExists (context, labelName, labelColor) {
    const {owner, repo} = context.repo()
    context.log('Checking to see if the label exists', {'Repo': repo, 'Label': labelName})
    return context.github.issues.getLabel({owner, repo, name: labelName}).catch(() => {
      context.log('Creating label in repository', {'Label': labelName, 'Color': labelColor})
      return context.github.issues.createLabel({owner, repo, name: labelName, color: labelColor})
    })
  }

  async function addLabelToIssue (context, config) {
    const issueLabel = context.issue({labels: [config.labelName]})
    await createLabelIfNotExists(context, config.labelName, config.labelColor)
    context.log('Adding label to issue', issueLabel)
    return context.github.issues.addLabels(issueLabel)
  }

  async function removeLabelFromIssue (context, config) {
    const labelName = config.labelName
    const labelRemoval = context.issue({name: labelName})
    context.log('Removing label from issue', labelRemoval)
    return context.github.issues.removeLabel(labelRemoval)
  }

  async function addCommentToIssue (context, config) {
    const commentText = context.issue({body: config.commentText})
    context.log('Adding comment to issue', commentText)
    return context.github.issues.createComment(commentText)
  }
}
