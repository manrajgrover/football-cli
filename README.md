# football-cli
[![npm version](https://badge.fury.io/js/footballcli.svg)](https://www.npmjs.com/package/footballcli) [![npm](https://img.shields.io/npm/dt/footballcli.svg?maxAge=2592000?style=flat-square)](https://www.npmjs.com/package/footballcli) ![awesome](https://img.shields.io/badge/awesome-yes-green.svg)
> Command line interface for Hackers who love football ⚽

![Standings](https://raw.githubusercontent.com/ManrajGrover/football-cli/master/assets/football-standings.gif)

## Installation

**Run**

```
$ npm install -g footballcli
```

## How to get API Key?

Please register on [football-data.org](http://api.football-data.org/register) to get your API Key. Then run `$ sudo football config` to add your API Key. Requests made using API key increases your rate limit from 50 requests per day to 50 requests per minute.

## Usage

### Commands available

```
football <command>

Commands:
  scores     Get scores of past and live fixtures
  fixtures   Get upcoming and past fixtures of a league and team
  standings  Get standings of particular league
  lists      List of codes of various competitions
  config     Change configuration and defaults

Options:
  -h, --help  Show help                                          [boolean]
  
```

#### Command `scores`
Get scores of past and live fixtures

![Standings](https://raw.githubusercontent.com/ManrajGrover/football-cli/master/assets/football-livescores.gif)

```
Usage: football scores [options]

Options:
  -h, --help  Show help                                          [boolean]
  -l, --live  Live scores                                        [boolean]
  -t, --team  Select team                                        [string]

Examples:
  football scores -t "Manchester United" -l
  
```

#### Command `fixtures`
Get upcoming and past fixtures of a league and team

```
Usage: football fixtures [options]

Options:
  -h, --help    Show help                                         [boolean]
  -t, --team    Team name or substring of it                      [string]
  -l, --league  League
  -n, --next    Next or upcoming matches                          [boolean]

Examples:
  football fixtures -l PL -d 5 -t "Manchester United" -n

```

![Fixtures](https://raw.githubusercontent.com/ManrajGrover/football-cli/master/assets/football-fixtures.gif)

#### Command `standings`
Get standings of particular league

```
Usage: football standings [options]

Options:
  -h, --help    Show help                                         [boolean]
  -l, --league  League to be searched                             [required]

Examples:
  football standings -l PL

```

#### Command `lists`
List of codes of various competitions

```
Usage: sudo football lists [options]

Options:
  -h, --help     Show help                                        [boolean]
  -r, --refresh  Refresh league ids                               [boolean]

Examples:
  sudo football lists -r

```

#### Command `config`
Change configuration and defaults

```
Usage: sudo football config

Options:
  -h, --help  Show help                                           [boolean]

Examples:
  sudo football config
  
```

## Get in touch

Say hi on [twitter](https://twitter.com/manrajsgrover) and share this project by clicking [here](https://twitter.com/home?status=Checkout%20command%20line%20tool%20for%20checking%20live%20%23scores,%20%23fixtures%20and%20more%20on%20%23Github%20by%20%40manrajsgrover%20%23cli%20https%3A//github.com/ManrajGrover/football-cli)

## Related
You may find similar packages [here](http://api.football-data.org/libraries)

## License

MIT © [ManrajGrover](https://github.com/ManrajGrover)
