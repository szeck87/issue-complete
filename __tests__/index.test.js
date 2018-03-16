// Requiring probot allows us to mock out a robot instance
const {createRobot} = require('probot')
const app = require('../index.js')
const issueOpened = require('./fixtures/issueOpened')
const issueReopened = require('./fixtures/issueReopened')
const issueWithChecked = require('./fixtures/issueWithCheckboxesChecked')
const issueUpdatedWithChecked = require('./fixtures/issueUpdatedWithCheckboxes')
const issueUpdatedWithoutChecked = require('./fixtures/issueUpdatedWithoutCheckboxes')

let robot
// let issue
let github

beforeEach(() => {
  robot = createRobot()
  app(robot)
  // issue = {
  //   body: '- [ ] Task 1\n- [ ] Task 2\n- [ ] Task 3',
  //   number: 100,
  //   labels: [{
  //     name: 'waiting-for-user-information',
  //     color: 'f7c6c7'
  //   }]
  // };
  github = {
    repos: {
      getContent: jest.fn().mockImplementation(() => Promise.resolve({
        data: {content: Buffer.from(`labelName: waiting-for-user-information\nlabelColor: f7c6c7\ncommentText: Thanks for opening an issue on bot-testing.`).toString('base64')}
      }))
    },
    issues: {
      createLabel: jest.fn(),
      removeLabel: jest.fn(),
      createComment: jest.fn(),
      addLabels: jest.fn(),
      getLabel: jest.fn().mockImplementation(() => Promise.reject(new Error()))
    }
  }
  robot.auth = () => Promise.resolve(github)
})

test('adds a label and comment to a newly opened issue without checkboxes filled', async () => {
  await robot.receive(issueOpened)
  expect(github.repos.getContent).toHaveBeenCalledWith({
    owner: 'szeck87',
    repo: 'bot-testing',
    path: '.github/issuecomplete.yml'
  })
  expect(github.issues.addLabels).toHaveBeenCalled()
  expect(github.issues.createComment).toHaveBeenCalled()
})

test('adds a label and comment to a reopened issue without checkboxes filled', async () => {
  await robot.receive(issueReopened)
  expect(github.repos.getContent).toHaveBeenCalledWith({
    owner: 'szeck87',
    repo: 'bot-testing',
    path: '.github/issuecomplete.yml'
  })
  expect(github.issues.addLabels).toHaveBeenCalled()
  expect(github.issues.createComment).toHaveBeenCalled()
})

test('does not add label or comment to opened issue with checkboxes filled', async () => {
  await robot.receive(issueWithChecked)
  expect(github.repos.getContent).toHaveBeenCalledWith({
    owner: 'szeck87',
    repo: 'bot-testing',
    path: '.github/issuecomplete.yml'
  })
  expect(github.issues.addLabels).not.toHaveBeenCalled()
  expect(github.issues.createComment).not.toHaveBeenCalled()
})

test('removes label to updated issue with checkboxes filled', async () => {
  await robot.receive(issueUpdatedWithChecked)
  expect(github.repos.getContent).toHaveBeenCalledWith({
    owner: 'szeck87',
    repo: 'bot-testing',
    path: '.github/issuecomplete.yml'
  })
  expect(github.issues.removeLabel).toHaveBeenCalledWith({
    owner: 'szeck87',
    repo: 'bot-testing',
    number: 26,
    name: 'waiting-for-user-information'
  })
  expect(github.issues.addLabels).not.toHaveBeenCalled()
  expect(github.issues.createComment).not.toHaveBeenCalled()
})

test('does not comment on updated issue with no checkboxes filled', async () => {
  await robot.receive(issueUpdatedWithoutChecked)
  expect(github.repos.getContent).toHaveBeenCalledWith({
    owner: 'szeck87',
    repo: 'bot-testing',
    path: '.github/issuecomplete.yml'
  })
  expect(github.issues.addLabels).toHaveBeenCalled()
  expect(github.issues.createComment).not.toHaveBeenCalled()
})

// test('errors when there is no config file', async () => {
//   await robot.receive(issueOpened)
//   expect(github.repos.getContent).toHaveBeenCalledWith({
//     owner: 'szeck87',
//     repo: 'bot-testing',
//     path: '.github/issuecomplete.yml'
//   })
// })
