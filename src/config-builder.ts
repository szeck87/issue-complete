// eslint-disable-next-line no-unused-vars
import { Context } from 'probot'

const defaultConfig: IssueCheckConfig = {
  labelName: 'waiting-for-user-information',
  labelColor: 'ffffff',
  commentText: 'Thanks for opening an issue. I see you haven"t provided all of the information in the list. Please update the issue to include more information.'
}

export default async function getValidConfig (context: Context) {
  const repoConfig = await context.config('issuecomplete.yml', defaultConfig)
  return buildConfig(context, repoConfig)
}

function buildConfig (context: Context, config: any) {
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

export interface IssueCheckConfig {
  labelName: string;
  labelColor: string;
  commentText: string;
}
