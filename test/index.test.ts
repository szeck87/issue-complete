// Requiring probot allows us to mock out a robot instance
import { Application } from 'probot'
import issueCheck from '../src'
const issueOpenedWithUnchecked = require('./fixtures/issueOpenedWithUnchecked')
const issueOpenedMissingKeywords = require('./fixtures/issueOpenedMissingKeywords')
const issueReopenedIncomplete = require('./fixtures/issueReopenedIncomplete')
const issueOpenedComplete = require('./fixtures/issueOpenedComplete')
const issueUpdatedComplete = require('./fixtures/issueUpdatedComplete')
const issueUpdatedIncomplete = require('./fixtures/issueUpdatedIncomplete')
const issueOpenedNoBody = require('./fixtures/issueOpenedNoBody')

let app: Application
let github: any

beforeEach(() => {
  app = new Application()
  app.load(issueCheck)
  github = {
    repos: {
      getContents: jest.fn().mockImplementation(() => Promise.resolve({
        data: { content: Buffer.from('labelName: waiting-for-user-information\nlabelColor: f7c6c7\ncommentText: Thanks for opening an issue on bot-testing.\ncheckCheckboxes: true\nkeywords:\n  - gist\n  - recreate').toString('base64') }
      }))
    },
    issues: {
      createLabel: jest.fn().mockImplementation(() => Promise.resolve({
        data: { node_id: 'dsfhsdjkfhkdjsh' }
      }))
    },
    graphql: jest.fn((query) => {
      if (query.includes('getLabelByName')) {
        return Promise.resolve({ repository: { label: { id: 'abc' } } })
      } else {
        return Promise.resolve({})
      }
    })
  }
  app.auth = () => Promise.resolve(github)
})

describe('issues are missing required information', () => {
  test('unchecked boxes, adds a label and comment to a newly opened issue', async () => {
    await app.receive({
      id: '123',
      name: 'issues',
      payload: issueOpenedWithUnchecked
    })
    expect(github.repos.getContents).toHaveBeenCalledWith({
      owner: 'stevenzeck',
      repo: 'bot-testing',
      path: '.github/issuecomplete.yml'
    })
    // getLabelByName
    // addLabelsToLabelable
    // addComment
    expect(github.graphql).toHaveBeenCalledTimes(3)
  })

  test('missing keywords, adds a label and comment to a newly opened issue', async () => {
    await app.receive({
      id: '123',
      name: 'issues',
      payload: issueOpenedMissingKeywords
    })
    expect(github.repos.getContents).toHaveBeenCalledWith({
      owner: 'stevenzeck',
      repo: 'bot-testing',
      path: '.github/issuecomplete.yml'
    })
    expect(github.graphql).toHaveBeenCalledTimes(3)
  })

  test('unchecked boxes and missing keywords, adds a label and comment to a reopened issue', async () => {
    await app.receive({
      id: '123',
      name: 'issues',
      payload: issueReopenedIncomplete
    })
    expect(github.repos.getContents).toHaveBeenCalledWith({
      owner: 'stevenzeck',
      repo: 'bot-testing',
      path: '.github/issuecomplete.yml'
    })
    expect(github.graphql).toHaveBeenCalledTimes(3)
  })

  test('does not comment on updated issue with no checkboxes filled', async () => {
    await app.receive({
      id: '123',
      name: 'issues',
      payload: issueUpdatedIncomplete
    })
    expect(github.repos.getContents).toHaveBeenCalledWith({
      owner: 'stevenzeck',
      repo: 'bot-testing',
      path: '.github/issuecomplete.yml'
    })
    expect(github.graphql).toHaveBeenCalledTimes(2)
  })

  test('body is empty, adds a comment and labels', async () => {
    await app.receive({
      id: '123',
      name: 'issues',
      payload: issueOpenedNoBody
    })
    expect(github.repos.getContents).toHaveBeenCalledWith({
      owner: 'stevenzeck',
      repo: 'bot-testing',
      path: '.github/issuecomplete.yml'
    })
    expect(github.graphql).toHaveBeenCalledTimes(3)
  })
})

describe('issues have required information', () => {
  test('boxes checked and has keywords, does not add label or comment to opened issue', async () => {
    await app.receive({
      id: '123',
      name: 'issues',
      payload: issueOpenedComplete
    })
    expect(github.repos.getContents).toHaveBeenCalledWith({
      owner: 'stevenzeck',
      repo: 'bot-testing',
      path: '.github/issuecomplete.yml'
    })
    expect(github.graphql).toHaveBeenCalledTimes(2)
  })

  test('does not check checkboxes or keywords, does nothing', async () => {
    github.repos.getContents = jest.fn().mockImplementation(() => Promise.resolve({
      data: { content: Buffer.from('labelName: waiting-for-user-information\nlabelColor: f7c6c7\ncommentText: Thanks for opening an issue on bot-testing.').toString('base64') }
    }))
    await app.receive({
      id: '123',
      name: 'issues',
      payload: issueOpenedComplete
    })
    expect(github.repos.getContents).toHaveBeenCalledWith({
      owner: 'stevenzeck',
      repo: 'bot-testing',
      path: '.github/issuecomplete.yml'
    })
    expect(github.graphql).toHaveBeenCalledTimes(2)
  })

  test('boxes checked and has keywords, removes label to updated issue', async () => {
    await app.receive({
      id: '123',
      name: 'issues',
      payload: issueUpdatedComplete
    })
    expect(github.repos.getContents).toHaveBeenCalledWith({
      owner: 'stevenzeck',
      repo: 'bot-testing',
      path: '.github/issuecomplete.yml'
    })
    expect(github.graphql).toHaveBeenCalledTimes(2)
  })

  test('invalid color, uses default #ffffff', async () => {
    github.repos.getContents = jest.fn().mockImplementation(() => Promise.resolve({
      data: { content: Buffer.from('labelName: waiting-for-user-information\nlabelColor: hjuhgg\ncommentText: Thanks for opening an issue on bot-testing.\ncheckCheckboxes: true\nkeywords:\n  - gist\n  - recreate').toString('base64') }
    }))
    await app.receive({
      id: '123',
      name: 'issues',
      payload: issueOpenedComplete
    })
    expect(github.repos.getContents).toHaveBeenCalledWith({
      owner: 'stevenzeck',
      repo: 'bot-testing',
      path: '.github/issuecomplete.yml'
    })
    expect(github.graphql).toHaveBeenCalledTimes(2)
  })

  test('label text length too long, uses default', async () => {
    github.repos.getContents = jest.fn().mockImplementation(() => Promise.resolve({
      data: { content: Buffer.from('labelName: waiting-for-user-information-and-more-user-information\nlabelColor: ffffff\ncommentText: Thanks for opening an issue on bot-testing.\ncheckCheckboxes: true\nkeywords:\n  - gist\n  - recreate').toString('base64') }
    }))
    await app.receive({
      id: '123',
      name: 'issues',
      payload: issueOpenedComplete
    })
    expect(github.repos.getContents).toHaveBeenCalledWith({
      owner: 'stevenzeck',
      repo: 'bot-testing',
      path: '.github/issuecomplete.yml'
    })
    expect(github.graphql).toHaveBeenCalledTimes(2)
  })
  test('label does not exist, create it', async () => {
    github.graphql = jest.fn().mockImplementationOnce((query, variables) => {
      if (query.includes('getLabelByName')) {
        return Promise.resolve(null)
      } else {
        return Promise.resolve({})
      }
    })
    await app.receive({
      id: '123',
      name: 'issues',
      payload: issueOpenedWithUnchecked
    })
    expect(github.repos.getContents).toHaveBeenCalledWith({
      owner: 'stevenzeck',
      repo: 'bot-testing',
      path: '.github/issuecomplete.yml'
    })
    expect(github.graphql).toHaveBeenCalledTimes(3)
  })
})
