const niceware = require('niceware')

export const randomString = () => {
  const stringSet = niceware.generatePassphrase(8)

  return stringSet
    .map((phrase: string) => phrase.charAt(0).toUpperCase() + phrase.slice(1))
    .join('')
}
