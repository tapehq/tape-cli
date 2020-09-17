import * as clipboardy from 'clipboardy'

export enum CopyFormats {
  MD = 'md',
  HREF = 'href',
  HTML = 'html',
  URL = 'url',
}

export const formatLink = (
  links: { tapeUrl: string; shareUrl?: string },
  format: CopyFormats | undefined,
  copy?: boolean
) => {
  let formattedLink

  switch (format) {
    case CopyFormats.MD:
      formattedLink = `![Tape Preview](${links.tapeUrl})`
      break

    case CopyFormats.HREF:
      formattedLink = `<a href="${
        links.shareUrl || links.tapeUrl
      }">Tape preview</a>`
      break

    case CopyFormats.HTML:
      if (links.tapeUrl.includes('.mp4')) {
        formattedLink = `<video src="${links.tapeUrl}" playsInline autoplay muted/>`
      } else {
        formattedLink = `<img src="${links.tapeUrl}" alt="Tape preview"/>`
      }
      break

    case CopyFormats.URL:
    default:
      formattedLink = links.shareUrl || links.tapeUrl
      break
  }

  if (copy) {
    clipboardy.writeSync(formattedLink)
  }

  return formattedLink
}
