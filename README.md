# rec

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/rec.svg)](https://npmjs.org/package/rec)
[![Downloads/week](https://img.shields.io/npm/dw/rec.svg)](https://npmjs.org/package/rec)
[![License](https://img.shields.io/npm/l/rec.svg)](https://github.com/ingmaras/rec/blob/master/package.json)

<!-- toc -->

- [Usage](#usage)
- [Commands](#commands)
<!-- tocstop -->

# Usage

<!-- usage -->

```sh-session
$ npm install -g rec
$ rec COMMAND
running command...
$ rec (-v|--version|version)
rec/0.0.1 darwin-x64 node-v12.12.0
$ rec --help [COMMAND]
USAGE
  $ rec COMMAND
...
```

<!-- usagestop -->

# Commands

<!-- commands -->

- [`rec config NAME`](#rec-config-name)
- [`rec help [COMMAND]`](#rec-help-command)
- [`rec ios TYPE`](#rec-ios-type)
- [`rec upload FILE`](#rec-upload-file)

## `rec config NAME`

Set bucket name

```
USAGE
  $ rec config NAME

OPTIONS
  -h, --help  show CLI help

EXAMPLE
  $ rec config [S3 bucket namee]
```

_See code: [src/commands/config.ts](https://github.com/ingmaras/rec/blob/v0.0.1/src/commands/config.ts)_

## `rec help [COMMAND]`

display help for rec

```
USAGE
  $ rec help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.2.3/src/commands/help.ts)_

## `rec ios TYPE`

Record and take screenshots of the iOS simulator

```
USAGE
  $ rec ios TYPE

OPTIONS
  -h, --help     show CLI help
  -v, --verbose

EXAMPLE
  $ rec ios record [screenshot | video]
  🎬 Recording started. Press SPACE to save or ESC to abort.
```

_See code: [src/commands/ios.ts](https://github.com/ingmaras/rec/blob/v0.0.1/src/commands/ios.ts)_

## `rec upload FILE`

Upload a file to an S3 bucket

```
USAGE
  $ rec upload FILE

OPTIONS
  -h, --help  show CLI help

EXAMPLE
  $ rec upload [file]
```

_See code: [src/commands/upload.ts](https://github.com/ingmaras/rec/blob/v0.0.1/src/commands/upload.ts)_

<!-- commandsstop -->
