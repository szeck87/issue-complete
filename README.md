# issue-complete

> a GitHub App built with [probot](https://github.com/probot/probot) that ensures task lists in your issue template are completed when an issue is submitted.

## What It Does

issue-complete looks at the body of an issue and adds a label and comment if it has unchecked boxes in the tasklist and/or has missing keywords. In this example, Task 2 is not checked so the bot adds a label and comment to it:

![issuecomplete](https://user-images.githubusercontent.com/8315038/37742479-cc18daaa-2d33-11e8-886e-6de63df96edd.png)

## Setup

1. Install the [GitHub app](https://github.com/apps/issue-complete)
2. Create a `.github/issuecomplete.yml` file in your repository (see [issuecomplete.yml](issuecomplete.yml) for a template). If you don't create this, the app will use defaults.

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
