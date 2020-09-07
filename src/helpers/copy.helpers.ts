import * as clipboardy from 'clipboardy'

export enum CopyFormats {
  MD = 'md',
  HREF = 'href',
  URL = 'url',
}

export const formatLink = (
  link: string,
  format: CopyFormats | undefined,
  copy?: boolean
) => {
  let formattedLink

  switch (format) {
    case CopyFormats.MD:
      formattedLink = `![Tape Preview](${link})`
      break

    case CopyFormats.HREF:
      formattedLink = `<a href="${link}">Tape preview</a>`
      break

    case CopyFormats.URL:
    default:
      formattedLink = link
      break
  }

  if (copy) {
    clipboardy.writeSync(formattedLink)
  }

  return formattedLink
}
