# issue-complete

> a GitHub App built with [probot](https://github.com/probot/probot) that ensures task lists in your issue template are completed when an issue is submitted.

## Setup

1. Install the [GitHub app](https://github.com/apps/issue-complete)
2. Create a `.github/issuecomplete.yml` file in your repository (see [issuecomplete.yml](issuecomplete.yml) for a template)
* labelName: The name of the label to apply when an issue does not have all tasks checked
* commentText: The text of the comment to add to the issue in addition to the label

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
```

## Deploy

See [docs/deploy.md](docs/deploy.md) if you would like to run your own instance of this app.
