const getConfig = require('probot-config')

const defaultConfig = {
  labelName: 'waiting-for-user-information',
  labelColor: 'ffffff',
  commentText: 'Thanks for opening an issue. I see you haven\'t provided all of the information in the list. Please update the issue to include more information.'
}

function buildConfig (context, config) {
  const validColor = /^[0-9A-F]{6}$/i.test(config.labelColor)
  if (!validColor) {
    context.log.error('Invalid color in config file, using default')
    config.labelColor = defaultConfig.labelColor
  }
  if (config.labelName.length > 50) {
    context.log.error('Too many characters for label name in config file, using default')
    config.labelName = defaultConfig.labelName
  }
  return config
}

class ConfigBuilder {
  static async getValidConfig (context) {
    const repoConfig = await getConfig(context, 'issuecomplete.yml', defaultConfig)
    return buildConfig(context, repoConfig)
  }
}

module.exports = ConfigBuilder
