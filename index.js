const getConfig = require('probot-config')

const defaultConfig = {
  labelName: 'waiting-for-user-information',
  labelColor: 'ffffff',
  commentText: 'Thanks for opening an issue. I see you haven\'t provided all of the information in the list. Please update the issue to include more information.'
}

module.exports = (robot) => {
  robot.on(['issues.opened', 'issues.edited', 'issues.reopened'], async context => {
    const config = await getConfig(context, 'issuecomplete.yml', defaultConfig)
    validateConfig(context, config)
    const issueIsIncomplete = validateIssueRequirements(context, config)
    if (issueIsIncomplete) {
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

  function validateIssueRequirements (context, config) {
    const body = context.payload.issue.body
    const hasUncheckedTasks = /-\s\[\s\]/g.test(body)
    let hasMissingKeywords = false
    if (config.keywords) {
      for (let i = 0; i < config.keywords.length; i++) {
        if (body.indexOf(config.keywords[i]) === -1) {
          hasMissingKeywords = true
          break
        }
      }
    }
    if (hasUncheckedTasks || hasMissingKeywords) {
      context.log('Issue is incomplete, missing checkboxes or keywords', {'Keywords': config.keywords, 'Issue Body': body})
      return true
    }
    return false
  }

  async function createLabelIfNotExists (context, labelName, labelColor) {
    const {owner, repo} = context.repo()
    return context.github.issues.getLabel({owner, repo, name: labelName}).catch(() => {
      return context.github.issues.createLabel({owner, repo, name: labelName, color: labelColor})
    })
  }

  async function addLabelToIssue (context, config) {
    const issueLabel = context.issue({labels: [config.labelName]})
    await createLabelIfNotExists(context, config.labelName, config.labelColor)
    return context.github.issues.addLabels(issueLabel)
  }

  async function removeLabelFromIssue (context, config) {
    const labelName = config.labelName
    const labelRemoval = context.issue({name: labelName})
    return context.github.issues.removeLabel(labelRemoval)
  }

  async function addCommentToIssue (context, config) {
    const commentText = context.issue({body: config.commentText})
    return context.github.issues.createComment(commentText)
  }
}
