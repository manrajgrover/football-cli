# football-cli
> Command line interface for Hackers who love football ⚽

![Standings](https://raw.githubusercontent.com/ManrajGrover/football-cli/master/assets/football-standings.gif)

## Installation

**Run**

```
$ npm install -g footballcli
```

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

#### Command `standings`

```
Usage: football standings [options]

Options:
  -h, --help    Show help                                         [boolean]
  -l, --league  League to be searched                             [required]

Examples:
  football standings -l PL

```

#### Command `lists`

```
Usage: sudo football lists [options]

Options:
  -h, --help     Show help                                        [boolean]
  -r, --refresh  Refresh league ids                               [boolean]

Examples:
  sudo football lists -r

```

#### Command `config`

```
Usage: sudo football config

Options:
  -h, --help  Show help                                           [boolean]

Examples:
  sudo football config
  
```

## License

MIT © [ManrajGrover](https://github.com/ManrajGrover)
