class IssueBodyChecker {
  static async isBodyValid (body, config, context) {
    if (!body) {
      return false
    }

    if (config.checkCheckboxes && /-\s\[\s\]/g.test(body)) {
      return false
    }

    if (config.keywords) {
      for (let i = 0; i < config.keywords.length; i++) {
        if (body.indexOf(config.keywords[i]) === -1) {
          return false
        }
      }
    }

    return true
  }
}

module.exports = IssueBodyChecker
