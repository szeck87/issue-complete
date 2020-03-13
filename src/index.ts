// eslint-disable-next-line no-unused-vars
import { Application, Context } from 'probot'
// eslint-disable-next-line no-unused-vars
import getValidConfig, { IssueCheckConfig } from './config-builder'
import isBodyValid from './issue-body-check'

export = (app: Application) => {
  app.log('Issue Check loaded')
  app.on(['issues.opened', 'issues.edited', 'issues.reopened'], async (context: Context) => {
    const config = await getValidConfig(context)
    const body: string = context.payload.issue.body
    const isValid: boolean = await isBodyValid(body, config)
    if (!isValid) {
      await addLabelToIssue(context, config)
      if (context.payload.action !== 'edited') {
        await addCommentToIssue(context, config)
      }
    } else {
      await removeLabelFromIssue(context, config)
    }
  })

  async function createLabelIfNotExists (context: Context, labelName: string, labelColor: string) {
    const { owner, repo } = context.repo()
    return context.github.issues.getLabel({ owner, repo, name: labelName }).catch(() => {
      return context.github.issues.createLabel({ owner, repo, name: labelName, color: labelColor })
    })
  }

  async function addLabelToIssue (context: Context, config: IssueCheckConfig) {
    const issueLabel = context.issue({ labels: [config.labelName] })
    await createLabelIfNotExists(context, config.labelName, config.labelColor)
    return context.github.issues.addLabels(issueLabel)
  }

  async function removeLabelFromIssue (context: Context, config: IssueCheckConfig) {
    const labelName = config.labelName
    const labelRemoval = context.issue({ name: labelName })
    return context.github.issues.removeLabel(labelRemoval)
  }

  async function addCommentToIssue (context: Context, config: IssueCheckConfig) {
    const commentText = context.issue({ body: config.commentText })
    return context.github.issues.createComment(commentText)
  }
}
