# issue-checker

> a GitHub App built with [probot](https://github.com/probot/probot) that ensures task lists in your issue template are completed when an issue is submitted. It also scans for keywords, such as "recreate", that may be in your template but missing when an issue is created

[![Build Status](https://travis-ci.com/stevenzeck/issue-checker.svg?branch=master)](https://travis-ci.com/stevenzeck/issue-checker) [![Maintainability](https://api.codeclimate.com/v1/badges/200de1d512b9aec78a17/maintainability)](https://codeclimate.com/github/stevenzeck/issue-checker/maintainability) [![Test Coverage](https://api.codeclimate.com/v1/badges/200de1d512b9aec78a17/test_coverage)](https://codeclimate.com/github/stevenzeck/issue-checker/test_coverage)

## What It Does

issue-checker looks at the body of an issue and adds a label and comment if it has unchecked boxes in the tasklist and/or has missing keywords. In this example, Task 2 is not checked so the bot adds a label and comment to it:

![issuechecker](https://user-images.githubusercontent.com/8315038/76657935-f1f68a00-6540-11ea-9f38-57410f71a49a.png)

## Setup

1. Install the [GitHub app](https://github.com/apps/issue-checker)
2. Create a `.github/issuechecker.yml` or `.github/issuecomplete.yml` file in your repository (see [issuecomplete.yml](issuecomplete.yml) for a template). If you don't create this, the app will use defaults.

| Name | Validation | Description | Default |
| --- | --- | --- | --- |
| labelName | String, 50 characters or less | The name of the label to apply when an issue does not have all tasks checked | waiting-for-user-information |
| labelColor | Color in hex without `#` | The color of the label (will be ignored if the label already exists) | ffffff |
| commentText | String | The text of the comment to add to the issue in addition to the label | Thanks for opening an issue. I see you haven't provided all of the information in the list. Please update the issue to include more information |
| checkCheckboxes | boolean | Whether or not to enforce all checkboxes be checked if a tasklist is present | false |
| keywords | List (yaml format) | A list of keywords that each issue should have (example: a link to a gist, so "gist") | None |

```yaml
# The name of the label to apply when an issue does not have all tasks checked
labelName:

# The color of the label in hex format (without #)
labelColor:

# The text of the comment to add to the issue in addition to the label
commentText: >
  Text here.
  More text here.
  And more text here.

# Whether or not to ensure all checkboxes are checked
checkCheckboxes: true

# Keywords to look for in the body of the issue
keywords:
  - gist
  - recreate
```

## Deploy

See [docs/deploy.md](docs/deploy.md) if you would like to run your own instance of this app.
