import * as clipboardy from 'clipboardy'

export enum CopyFormats {
  MD = 'md',
  HREF = 'href',
  HTML = 'html',
  URL = 'url',
}

export const copyLink = (link: string, format?: CopyFormats) => {
  let formattedLink

  switch (format) {
    case CopyFormats.MD:
      formattedLink = `![Tape Preview](${link})`
      break

    case CopyFormats.HREF:
      formattedLink = `<a href="${link}">Tape preview</a>`
      break

    case CopyFormats.HTML:
      formattedLink = `<img src="${link}">Tape preview</img>`
      break

    case CopyFormats.URL:
    default:
      formattedLink = link
      break
  }

  clipboardy.writeSync(formattedLink)

  return formattedLink
}
