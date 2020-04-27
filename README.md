iggy
====



[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/iggy.svg)](https://npmjs.org/package/iggy)
[![Downloads/week](https://img.shields.io/npm/dw/iggy.svg)](https://npmjs.org/package/iggy)
[![License](https://img.shields.io/npm/l/iggy.svg)](https://github.com/ingmaras/iggy/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g yggy
$ iggy COMMAND
running command...
$ iggy (-v|--version|version)
yggy/0.0.0 darwin-x64 node-v12.12.0
$ iggy --help [COMMAND]
USAGE
  $ iggy COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`iggy config NAME`](#iggy-config-name)
* [`iggy help [COMMAND]`](#iggy-help-command)
* [`iggy ios TYPE`](#iggy-ios-type)
* [`iggy upload FILE`](#iggy-upload-file)

## `iggy config NAME`

Upload a file to an S3 bucket

```
USAGE
  $ iggy config NAME

OPTIONS
  -h, --help  show CLI help

EXAMPLE
  $ iggy bucket [file]
```

_See code: [src/commands/config.ts](https://github.com/edamameldn/iggy-cli/blob/v0.0.0/src/commands/config.ts)_

## `iggy help [COMMAND]`

display help for iggy

```
USAGE
  $ iggy help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.2.3/src/commands/help.ts)_

## `iggy ios TYPE`

Record and take screenshots of the iOS simulator

```
USAGE
  $ iggy ios TYPE

OPTIONS
  -h, --help     show CLI help
  -v, --verbose

EXAMPLE
  $ iggy ios record [screenshot | video]
  🎬 Recording started. Press SPACE to save or ESC to abort.
```

_See code: [src/commands/ios.ts](https://github.com/edamameldn/iggy-cli/blob/v0.0.0/src/commands/ios.ts)_

## `iggy upload FILE`

Upload a file to an S3 bucket

```
USAGE
  $ iggy upload FILE

OPTIONS
  -h, --help  show CLI help

EXAMPLE
  $ iggy upload [file]
```

_See code: [src/commands/upload.ts](https://github.com/edamameldn/iggy-cli/blob/v0.0.0/src/commands/upload.ts)_
<!-- commandsstop -->
