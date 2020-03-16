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
    const labelId = await getLabelByName(context, labelName)
    if (labelId !== null) {
      return labelId
    } else {
      context.log('Creating label')
      const createdLabel = await context.github.issues.createLabel({ owner, repo, name: labelName, color: labelColor })
      return createdLabel.data.node_id
    }
  }

  async function getLabelByName (context: Context, labelName: string) {
    const { owner, repo } = context.repo()
    context.log('Finding label')
    const label = await context.github.graphql(getLabelByNameQuery, {
      owner: owner,
      repoName: repo,
      labelName: labelName
    })
    if (label && label.repository.label !== null) {
      context.log('Found label')
      return label.repository.label.id
    }
    return null
  }

  async function addLabelToIssue (context: Context, config: IssueCheckConfig) {
    const labelId = await createLabelIfNotExists(context, config.labelName, config.labelColor)
    if (labelId !== null) {
      return context.github.graphql(addLabelsToLabelable, {
        labelIds: labelId,
        labelableId: context.payload.issue.node_id
      })
    } else {
      context.log('Could not add label to issue')
      return null
    }
  }

  async function removeLabelFromIssue (context: Context, config: IssueCheckConfig) {
    const labelId = await getLabelByName(context, config.labelName)
    if (labelId !== null) {
      return context.github.graphql(removeLabelsFromLabelable, {
        labelIds: labelId,
        labelableId: context.payload.issue.node_id
      })
    } else {
      context.log('Could not remove label from issue')
      return null
    }
  }

  async function addCommentToIssue (context: Context, config: IssueCheckConfig) {
    return context.github.graphql(addComment, {
      subjectId: context.payload.issue.node_id,
      body: config.commentText
    })
  }
}

const addComment = `
  mutation addComment($subjectId: ID!, $body: String!) {
    addComment(input: {subjectId: $subjectId, body: $body}) {
      clientMutationId
    }
  }
`

const addLabelsToLabelable = `
  mutation addLabelsToLabelable($labelIds: ID!, $labelableId: ID!) {
    addLabelsToLabelable(input: {labelIds: $labelIds, labelableId: $labelableId}) {
      clientMutationId
    }
  }
`

const removeLabelsFromLabelable = `
  mutation removeLabelsFromLabelable($labelIds: ID!, $labelableId: ID!) {
    removeLabelsFromLabelable(input: {labelIds: [$labelIds], labelableId: $labelableId}) {
      clientMutationId
    }
  }
`

const getLabelByNameQuery = `
  query getLabelByName($owner: String!, $repoName: String!, $labelName: String!) {
    repository(name: $repoName, owner: $owner) {
      label(name: $labelName) {
        id
      }
    }
  }
`
