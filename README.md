# tape-cli

> Collaborate better during mobile development, for iOS & tvOS simulators and Android emulators and devices. Share screenshots, screen recordings as video or GIFs. Use with [https://www.tape.sh/](https://www.tape.sh/) or bring your own bucket!

---
[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/tape-cli.svg)](https://npmjs.org/package/tape-cli)
[![Downloads/week](https://img.shields.io/npm/dw/tape-cli.svg)](https://npmjs.org/package/tape-cli)
[![License](https://img.shields.io/npm/l/rec.svg)](https://github.com/edamameldn/tape-cli/blob/master/package.json)

![Tape](https://www.tape.sh/media/tape-og.gif)

---
<!-- toc -->
* [tape-cli](#tape-cli)
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
---

# Usage

<!-- usage -->
```sh-session
$ npm install -g tape-cli
$ tape COMMAND
running command...
$ tape (-v|--version|version)
tape-cli/0.10.1 darwin-x64 node-v14.5.0
$ tape --help [COMMAND]
USAGE
  $ tape COMMAND
...
```
<!-- usagestop -->

# Commands

<!-- commands -->
* [`tape config [NAME]`](#tape-config-name)
* [`tape devices`](#tape-devices)
* [`tape gif`](#tape-gif)
* [`tape help [COMMAND]`](#tape-help-command)
* [`tape image`](#tape-image)
* [`tape login`](#tape-login)
* [`tape upgrade`](#tape-upgrade)
* [`tape video`](#tape-video)

## `tape config [NAME]`

Configuration

```
USAGE
  $ tape config [NAME]

OPTIONS
  -h, --help   show CLI help
  -s, --setup
  --check
  --login

EXAMPLE
  $ tape config
```

_See code: [src/commands/config.ts](https://github.com/edamameldn/tape-cli/blob/v0.10.1/src/commands/config.ts)_

## `tape devices`

List devices

```
USAGE
  $ tape devices

OPTIONS
  -c, --clear
  -h, --help   show CLI help

ALIASES
  $ tape device
  $ tape emu
  $ tape sims

EXAMPLE
  $ tape devices
```

_See code: [src/commands/devices.ts](https://github.com/edamameldn/tape-cli/blob/v0.10.1/src/commands/devices.ts)_

## `tape gif`

Record iOS simulators and Android devices/emulators and output a gif file

```
USAGE
  $ tape gif

OPTIONS
  -d, --debug
  -h, --help                             show CLI help
  -l, --local=~/Documents
  --format=md|href|html|url              [default: url]
  --hq
  --nocopy Disable copying to clipboard

ALIASES
  $ tape gif
  $ tape g

EXAMPLE
  $ tape gif [--local $OUTPUTPATH]
  🎬 Recording started. Press SPACE to save or ESC to abort.
```

_See code: [src/commands/gif.ts](https://github.com/edamameldn/tape-cli/blob/v0.10.1/src/commands/gif.ts)_

## `tape help [COMMAND]`

display help for tape

```
USAGE
  $ tape help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.2.3/src/commands/help.ts)_

## `tape image`

Take screenshots of iOS/Android devices/simulators

```
USAGE
  $ tape image

OPTIONS
  -d, --debug
  -h, --help                             show CLI help
  -l, --local=~/Documents
  --format=md|href|html|url              [default: url]
  --nocopy Disable copying to clipboard

ALIASES
  $ tape i
  $ tape screenshot
  $ tape img

EXAMPLE
  $ tape image
  🎉 Screenshot uploaded. Copied URL to clipboard 🔖 ! -> 
    https://example.com/image.png
```

_See code: [src/commands/image.ts](https://github.com/edamameldn/tape-cli/blob/v0.10.1/src/commands/image.ts)_

## `tape login`

Log in to Tape.sh

```
USAGE
  $ tape login

ALIASES
  $ tape auth
  $ tape authorize

EXAMPLE
  $ tape login
```

_See code: [src/commands/login.ts](https://github.com/edamameldn/tape-cli/blob/v0.10.1/src/commands/login.ts)_

## `tape upgrade`

Opens a direct link to upgrade your Tape.sh plan

```
USAGE
  $ tape upgrade

OPTIONS
  -h, --help      show CLI help
  -p, --plan=Pro  Plan name to upgrade to
```

_See code: [src/commands/upgrade.ts](https://github.com/edamameldn/tape-cli/blob/v0.10.1/src/commands/upgrade.ts)_

## `tape video`

Record iOS/Android devices/simulators

```
USAGE
  $ tape video

OPTIONS
  -d, --debug
  -g, --gif
  -h, --help                             show CLI help
  -l, --local=~/Documents
  --format=md|href|html|url              [default: url]
  --hq
  --legacy
  --nocopy Disable copying to clipboard

ALIASES
  $ tape video
  $ tape vid
  $ tape m

EXAMPLE
  $ tape video [--hq | --gif | --local $OUTPUTPATH]
  🎬 Recording started. Press SPACE to save or ESC to abort.
```

_See code: [src/commands/video.ts](https://github.com/edamameldn/tape-cli/blob/v0.10.1/src/commands/video.ts)_
<!-- commandsstop -->

### License
[MIT License](LICENSE), read more [here](https://help.tape.sh/articles/licensing/)

by [edamame studio](https://edamame.studio/)
