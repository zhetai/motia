export const getStepLanguage = (fileExtension?: string): string | undefined => {
  if (!fileExtension) return

  if (fileExtension.match(/js/)) {
    return 'javascript'
  }

  if (fileExtension.match(/ts/)) {
    return 'typescript'
  }

  if (fileExtension.match(/py/)) {
    return 'python'
  }

  if (fileExtension.match(/go/)) {
    return 'go'
  }

  if (fileExtension.match(/rb/)) {
    return 'ruby'
  }

  if (fileExtension.match(/php/)) {
    return 'php'
  }

  return
}
