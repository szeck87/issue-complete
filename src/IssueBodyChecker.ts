export default async function isBodyValid (body: string, config: any) {
  if (!body) {
    return false
  }

  if (config.checkCheckboxes && /-\s\[\s\]/g.test(body)) {
    return false
  }

  if (config.keywords) {
    return config.keywords.every((key: string) => {
      return body.indexOf(key) > -1
    })
  }

  return true
}
