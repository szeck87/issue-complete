// Requiring probot allows us to mock out a robot instance
import { Probot, ProbotOctokit } from 'probot'
import issueCheck from '../src'
import * as fs from 'fs'
import * as path from 'path'
import nock from 'nock'
const issueOpenedWithUnchecked = require('./fixtures/issueOpenedWithUnchecked')
const issueOpenedMissingKeywords = require('./fixtures/issueOpenedMissingKeywords')
const issueReopenedIncomplete = require('./fixtures/issueReopenedIncomplete')
const issueOpenedComplete = require('./fixtures/issueOpenedComplete')
const issueUpdatedComplete = require('./fixtures/issueUpdatedComplete')
const issueUpdatedIncomplete = require('./fixtures/issueUpdatedIncomplete')
const issueOpenedNoBody = require('./fixtures/issueOpenedNoBody')

let app: Probot

function loadConfig (filename: string): string {
  return fs.readFileSync(path.join(__dirname, 'configs', filename + '.yml'), 'base64')
}

beforeEach(() => {
  app = new Probot({
    id: 1,
    githubToken: 'test',
    Octokit: ProbotOctokit.defaults({
      retry: { enabled: false },
      throttle: { enabled: false }
    })
  })
  app.load(issueCheck)
})

describe('issues are missing required information', () => {
  test('unchecked boxes, adds a label and comment to a newly opened issue', async () => {
    const mock = nock('https://api.github.com')
      .get('/repos/stevenzeck/bot-testing/contents/.github%2Fissuecomplete.yml')
      .reply(200, {
        content: loadConfig('issuecomplete')
      })

      .post('/repos/stevenzeck/bot-testing/labels')
      .reply(200)

      .post('/repos/stevenzeck/bot-testing/issues/123/labels')
      .reply(200)

      .post('/repos/stevenzeck/bot-testing/issues/123/comments')
      .reply(200)

    await app.receive({
      id: '123',
      name: 'issues',
      payload: issueOpenedWithUnchecked
    })
    expect(mock.activeMocks()).toStrictEqual([])
  })

  test('missing keywords, adds a label and comment to a newly opened issue', async () => {
    const mock = nock('https://api.github.com')
      .get('/repos/stevenzeck/bot-testing/contents/.github%2Fissuecomplete.yml')
      .reply(200, {
        content: loadConfig('issuecomplete')
      })

      .post('/repos/stevenzeck/bot-testing/labels')
      .reply(200)

      .post('/repos/stevenzeck/bot-testing/issues/123/labels')
      .reply(200)

      .post('/repos/stevenzeck/bot-testing/issues/123/comments')
      .reply(200)
    await app.receive({
      id: '123',
      name: 'issues',
      payload: issueOpenedMissingKeywords
    })
    expect(mock.activeMocks()).toStrictEqual([])
  })

  test('unchecked boxes and missing keywords, adds a label and comment to a reopened issue', async () => {
    const mock = nock('https://api.github.com')
      .get('/repos/stevenzeck/bot-testing/contents/.github%2Fissuecomplete.yml')
      .reply(200, {
        content: loadConfig('issuecomplete')
      })

      .post('/repos/stevenzeck/bot-testing/labels')
      .reply(200)

      .post('/repos/stevenzeck/bot-testing/issues/123/labels')
      .reply(200)

      .post('/repos/stevenzeck/bot-testing/issues/123/comments')
      .reply(200)
    await app.receive({
      id: '123',
      name: 'issues',
      payload: issueReopenedIncomplete
    })
    expect(mock.activeMocks()).toStrictEqual([])
  })

  test('does not comment on updated issue with no checkboxes filled', async () => {
    const mock = nock('https://api.github.com')
      .get('/repos/stevenzeck/bot-testing/contents/.github%2Fissuecomplete.yml')
      .reply(200, {
        content: loadConfig('issuecomplete')
      })

      .post('/repos/stevenzeck/bot-testing/labels')
      .reply(200)

      .post('/repos/stevenzeck/bot-testing/issues/123/labels')
      .reply(200)
    await app.receive({
      id: '123',
      name: 'issues',
      payload: issueUpdatedIncomplete
    })
    expect(mock.activeMocks()).toStrictEqual([])
  })

  test('body is empty, adds a comment and labels', async () => {
    const mock = nock('https://api.github.com')
      .get('/repos/stevenzeck/bot-testing/contents/.github%2Fissuecomplete.yml')
      .reply(200, {
        content: loadConfig('issuecomplete')
      })

      .post('/repos/stevenzeck/bot-testing/labels')
      .reply(200)

      .post('/repos/stevenzeck/bot-testing/issues/123/labels')
      .reply(200)

      .post('/repos/stevenzeck/bot-testing/issues/123/comments')
      .reply(200)
    await app.receive({
      id: '123',
      name: 'issues',
      payload: issueOpenedNoBody
    })
    expect(mock.activeMocks()).toStrictEqual([])
  })
})

describe('issues have required information', () => {
  test('boxes checked and has keywords, does not add label or comment to opened issue', async () => {
    const mock = nock('https://api.github.com')
      .get('/repos/stevenzeck/bot-testing/contents/.github%2Fissuecomplete.yml')
      .reply(200, {
        content: loadConfig('issuecomplete')
      })

      .delete('/repos/stevenzeck/bot-testing/issues/123/labels/waiting-for-user-information')
      .reply(200)

    await app.receive({
      id: '123',
      name: 'issues',
      payload: issueOpenedComplete
    })
    expect(mock.activeMocks()).toStrictEqual([])
  })

  test('does not check checkboxes or keywords, does nothing', async () => {
    const mock = nock('https://api.github.com')
      .get('/repos/stevenzeck/bot-testing/contents/.github%2Fissuecomplete.yml')
      .reply(200, {
        content: loadConfig('issuecompletenocheckboxeskeywords')
      })

      .delete('/repos/stevenzeck/bot-testing/issues/123/labels/waiting-for-user-information')
      .reply(200)

    await app.receive({
      id: '123',
      name: 'issues',
      payload: issueOpenedComplete
    })
    expect(mock.activeMocks()).toStrictEqual([])
  })

  test('boxes checked and has keywords, removes label to updated issue', async () => {
    const mock = nock('https://api.github.com')
      .get('/repos/stevenzeck/bot-testing/contents/.github%2Fissuecomplete.yml')
      .reply(200, {
        content: loadConfig('issuecomplete')
      })

      .delete('/repos/stevenzeck/bot-testing/issues/123/labels/waiting-for-user-information')
      .reply(200)
    await app.receive({
      id: '123',
      name: 'issues',
      payload: issueUpdatedComplete
    })
    expect(mock.activeMocks()).toStrictEqual([])
  })

  test('invalid color, uses default #ffffff', async () => {
    const mock = nock('https://api.github.com')
      .get('/repos/stevenzeck/bot-testing/contents/.github%2Fissuecomplete.yml')
      .reply(200, {
        content: loadConfig('issuecompleteinvalidcolor')
      })

      .delete('/repos/stevenzeck/bot-testing/issues/123/labels/waiting-for-user-information')
      .reply(200)
    await app.receive({
      id: '123',
      name: 'issues',
      payload: issueOpenedComplete
    })
    expect(mock.activeMocks()).toStrictEqual([])
  })

  test('label text length too long, uses default', async () => {
    const mock = nock('https://api.github.com')
      .get('/repos/stevenzeck/bot-testing/contents/.github%2Fissuecomplete.yml')
      .reply(200, {
        content: loadConfig('issuecompletelabeltextlong')
      })

      .delete('/repos/stevenzeck/bot-testing/issues/123/labels/waiting-for-user-information')
      .reply(200)
    await app.receive({
      id: '123',
      name: 'issues',
      payload: issueOpenedComplete
    })
    expect(mock.activeMocks()).toStrictEqual([])
  })

  describe('configuration file name', () => {
    test('issuecomplete.yml still picks up the configuration', async () => {
      const mock = nock('https://api.github.com')
        .get(
          '/repos/stevenzeck/bot-testing/contents/.github%2Fissuecomplete.yml'
        )
        .reply(200, {
          content: loadConfig('issuecomplete')
        })

        .post('/repos/stevenzeck/bot-testing/labels')
        .reply(200)

        .post('/repos/stevenzeck/bot-testing/issues/123/labels')
        .reply(200)

        .post('/repos/stevenzeck/bot-testing/issues/123/comments')
        .reply(200)
      await app.receive({
        id: '123',
        name: 'issues',
        payload: issueOpenedWithUnchecked
      })
      expect(mock.activeMocks()).toStrictEqual([])
    })
  })
})
