yggy
====



[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/yggy.svg)](https://npmjs.org/package/yggy)
[![Downloads/week](https://img.shields.io/npm/dw/yggy.svg)](https://npmjs.org/package/yggy)
[![License](https://img.shields.io/npm/l/yggy.svg)](https://github.com/ingmaras/yggy/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g yggy
$ yggy COMMAND
running command...
$ yggy (-v|--version|version)
yggy/0.0.1 darwin-x64 node-v12.12.0
$ yggy --help [COMMAND]
USAGE
  $ yggy COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`yggy config NAME`](#yggy-config-name)
* [`yggy help [COMMAND]`](#yggy-help-command)
* [`yggy ios TYPE`](#yggy-ios-type)
* [`yggy upload FILE`](#yggy-upload-file)

## `yggy config NAME`

Set bucket name

```
USAGE
  $ yggy config NAME

OPTIONS
  -h, --help  show CLI help

EXAMPLE
  $ yggy config [S3 bucket namee]
```

_See code: [src/commands/config.ts](https://github.com/ingmaras/yggy/blob/v0.0.1/src/commands/config.ts)_

## `yggy help [COMMAND]`

display help for yggy

```
USAGE
  $ yggy help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.2.3/src/commands/help.ts)_

## `yggy ios TYPE`

Record and take screenshots of the iOS simulator

```
USAGE
  $ yggy ios TYPE

OPTIONS
  -h, --help     show CLI help
  -v, --verbose

EXAMPLE
  $ yggy ios record [screenshot | video]
  🎬 Recording started. Press SPACE to save or ESC to abort.
```

_See code: [src/commands/ios.ts](https://github.com/ingmaras/yggy/blob/v0.0.1/src/commands/ios.ts)_

## `yggy upload FILE`

Upload a file to an S3 bucket

```
USAGE
  $ yggy upload FILE

OPTIONS
  -h, --help  show CLI help

EXAMPLE
  $ yggy upload [file]
```

_See code: [src/commands/upload.ts](https://github.com/ingmaras/yggy/blob/v0.0.1/src/commands/upload.ts)_
<!-- commandsstop -->
