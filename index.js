const getConfig = require('probot-config');

module.exports = (robot) => {

  robot.on(["issues.opened", "issues.edited", "issues.reopened"], async context => {
    const config = await getConfig(context, 'issuecomplete.yml');
    const body = context.payload.issue.body;
    context.log("Checking to ensure all items are checked", body)
    const hasUncheckedItems = /-\s\[\s\]/g.test(body);
    if (hasUncheckedItems) {
      addLabelAndComment(context, config);
    }
  })

  async function createLabelIfNotExists (context, labelName) {
    const {owner, repo} = context.repo();
    context.log("Checking to make sure the label exists", {"Owner": owner, "Repo": repo, "Label": labelName});
    return context.github.issues.getLabel({owner, repo, name: labelName}).catch(() => {
      context.log("Creating label", labelName);
      return context.github.issues.createLabel({owner, repo, name: labelName, color: 'f7c6c7'});
    })
  }

  async function addLabelAndComment(context, config) {
    const {owner, repo} = context.repo();
    const labelName = config["labelName"];
    await createLabelIfNotExists(context, labelName);
    const issueComment = context.issue({body: config["commentText"]});
    const issueLabel = context.issue({labels: [labelName]});
    context.log("Adding label to issue", context.issue())
    await context.github.issues.addLabels(issueLabel);
    context.log("Adding comment to issue", context.issue);
    return context.github.issues.createComment(issueComment);
  }

}
