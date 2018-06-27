'use strict';

const leagueIds = require('./leagueIds');
const Table = require('cli-table3');
const chalk = require('chalk');
const moment = require('moment');
const URLS = require('./constants');
const fs = require('fs');
const path = require('path');
const jsonexport = require('jsonexport');

const API_URL = URLS.API_URL;
const BUGS_URL = URLS.BUGS_URL;

const buildScore = (name, homeTeam, goalsHomeTeam, goalsAwayTeam, awayTeam, time) => (
  `${chalk.green.bold(name)}  ${chalk.cyan.bold(homeTeam)} ${chalk.cyan.bold(goalsHomeTeam)} vs. ` +
  `${chalk.red.bold(goalsAwayTeam)} ${chalk.red.bold(awayTeam)} ${chalk.yellow.bold(time)}`
);

const updateMessage = (TYPE, message) => {
  message = message || '';

  switch (TYPE) {

    case 'REQ_ERROR':
      console.log(
        chalk.red.bold(`Sorry, an error occured. Please report issues to ${BUGS_URL} if problem persists.`)
      );
      break;

    case 'CUSTOM_ERR':
      console.log(chalk.bold.red(message));
      break;

    case 'UPDATE':
      console.log(chalk.bold.cyan(message));
      break;

    case 'LEAGUE_ERR':
      throw new Error(chalk.red.bold(
        'No league found. Please check the League Code entered with the list `football lists`.'
      ));

    case 'FIX_INPUT_ERR':
      throw new Error(chalk.red.bold('Days cannot be a negative value.'));

    default:
      console.log('ERROR OCCURED.');
  }
};

const exportData = (output, data) => {
  if (output.json !== undefined) {
    const jsonFileName = (output.json.length > 0) ? output.json : 'footballOut';
    fs.writeFile(path.resolve(process.cwd(), `${jsonFileName}.json`),
                    JSON.stringify(data, null, 4), 'utf8', (err) => {
                      if (err) {
                        throw (err);
                      } else {
                        console.log(`\nData has been successfully saved as ${jsonFileName}.json`);
                      }
                    });
  }
  if (output.csv !== undefined) {
    const csvFileName = (output.csv.length > 0) ? output.csv : 'footballOut';
    try {
      const exp = jsonexport(data, (err, csv) => {
        if (err) {
          throw (err);
        } else {
          fs.writeFile(path.resolve(process.cwd(), `${csvFileName}.csv`),
                        csv, 'utf8', (error) => {
                          if (error) {
                            throw (error);
                          } else {
                            console.log(`\nData has been successfully saved as ${csvFileName}.csv`);
                          }
                        });
        }
      });
    } catch (err) {
      console.log('Error while generating CSV.', err);
    }
  }
};

const getLeagueName = (fixture) => {
  let compUrl = fixture._links.competition.href;
  let parts = compUrl.split('/');
  let id = parts[parts.length - 1];

  for (let league in leagueIds) {
    if (leagueIds[league].id === id) {
      return leagueIds[league].caption;
    }
  }

  return '';
};

const fixturesHelper = (league, name, team, body, outData) => {
  let data = JSON.parse(body);
  let fixtures = data.fixtures;

  if ('error' in data) {
    updateMessage('CUSTOM_ERR', data.error);
    return;
  }

  if (fixtures.length === 0) {
    updateMessage('UPDATE', 'Sorry, no fixtures to show right now');
    return;
  }

  if (outData.json !== undefined || outData.csv !== undefined) {
    exportData(outData, fixtures);
  }

  for (let fixture of fixtures) {
    let homeTeam = fixture.homeTeamName;
    let awayTeam = fixture.awayTeamName;
    let goalsHomeTeam = (fixture.result.goalsHomeTeam === null) ? '-1' : fixture.result.goalsHomeTeam;
    let goalsAwayTeam = (fixture.result.goalsAwayTeam === null) ? '-1' : fixture.result.goalsAwayTeam;

    name = (league === undefined) ? getLeagueName(fixture) : name;

    let time = (fixture.status === 'IN_PLAY') ? 'LIVE' : moment(fixture.date).calendar();

    if (team !== undefined) {
      if ((homeTeam.toLowerCase()).indexOf((team).toLowerCase()) !== -1 ||
          (awayTeam.toLowerCase()).indexOf((team).toLowerCase()) !== -1) {
        console.log(buildScore(name, homeTeam, goalsHomeTeam, goalsAwayTeam, awayTeam, time));
      }
    } else {
      console.log(buildScore(name, homeTeam, goalsHomeTeam, goalsAwayTeam, awayTeam, time));
    }
  }
};

const printScores = (fixtures, isLive) => {
  for (let fixture of fixtures) {
    let name = getLeagueName(fixture);
    let homeTeam = fixture.homeTeamName;
    let awayTeam = fixture.awayTeamName;
    let goalsHomeTeam = (fixture.result.goalsHomeTeam === null) ? '-1' : fixture.result.goalsHomeTeam;
    let goalsAwayTeam = (fixture.result.goalsAwayTeam === null) ? '-1' : fixture.result.goalsAwayTeam;
    let time = (isLive === true) ? 'LIVE' : moment(fixture.date).calendar();

    console.log(buildScore(name, homeTeam, goalsHomeTeam, goalsAwayTeam, awayTeam, time));
  }
};

const scoresHelper = (isLive, team, body, outData) => {
  let data = JSON.parse(body);
  let fixtures = data.fixtures;
  let live = [];
  let scores = [];

  if ('error' in data) {
    updateMessage('CUSTOM_ERR', data.error);
    return;
  }

  team = team.toLowerCase();

  for (let fixture of fixtures) {
    let homeTeam = (fixture.homeTeamName).toLowerCase();
    let awayTeam = (fixture.awayTeamName).toLowerCase();

    if (fixture.status === 'IN_PLAY' && (homeTeam.indexOf(team) !== -1 ||
                                         awayTeam.indexOf(team) !== -1)) {
      live.push(fixture);
      scores.push(fixture);
    } else if (fixture.status === 'FINISHED' && (homeTeam.indexOf(team) !== -1 ||
                                                 awayTeam.indexOf(team) !== -1)) {
      scores.push(fixture);
    }
  }

  if (isLive) {
    if (live.length !== 0) {
      printScores(live, true);
      if (outData.json !== undefined || outData.csv !== undefined) {
        exportData(outData, live);
      }
    } else {
      updateMessage('UPDATE', 'Sorry, no live matches right now');
    }
  } else {
    if (scores.length !== 0) {
      printScores(scores, false);
      if (outData.json !== undefined || outData.csv !== undefined) {
        exportData(outData, scores);
      }
    } else {
      updateMessage('UPDATE', 'Sorry, no scores to show right now');
    }
  }
};

const standings = (body, outData) => {
  let data = JSON.parse(body);
  let table;

  if ('error' in data) {
    updateMessage('CUSTOM_ERR', data.error);
    return;
  }

  if (data.standing !== undefined) {
    let standing = data.standing;

    table = new Table({
      head: [
        chalk.bold.white.bgBlue(' # '),
        chalk.bold.white.bgBlue(' Team '),
        chalk.bold.white.bgBlue(' MP '),
        chalk.bold.white.bgBlue(' W '),
        chalk.bold.white.bgBlue(' D '),
        chalk.bold.white.bgBlue(' L '),
        chalk.bold.white.bgBlue(' GF '),
        chalk.bold.white.bgBlue(' GA '),
        chalk.bold.white.bgBlue(' GD '),
        chalk.bold.white.bgBlue(' Pts '),
      ],
      colWidths: [7, 30],
    });

    for (let team of standing) {
      table.push([
        chalk.bold.magenta(team.position),
        chalk.bold.cyan(team.teamName),
        chalk.bold.magenta(team.playedGames),
        chalk.bold.green(team.wins),
        chalk.bold.yellow(team.draws),
        chalk.bold.magenta(team.losses),
        chalk.bold.green(team.goals),
        chalk.bold.magenta(team.goalsAgainst),
        chalk.bold.cyan(team.goalDifference),
        chalk.bold.green(team.points),
      ]);
    }

    console.log(table.toString());

    if (outData.json !== undefined || outData.csv !== undefined) {
      exportData(outData, standing);
    }
  } else {
    let groupStandings = data.standings;

    for (let groupCode in groupStandings) {
      console.log(chalk.bgBlue.bold.white(` Group: ${groupCode} `));

      let group = groupStandings[groupCode];

      table = new Table({
        head: [
          chalk.bold.white.bgBlue(' # '),
          chalk.bold.white.bgBlue(' Team '),
          chalk.bold.white.bgBlue(' MP '),
          chalk.bold.white.bgBlue(' GF '),
          chalk.bold.white.bgBlue(' GA '),
          chalk.bold.white.bgBlue(' GD '),
          chalk.bold.white.bgBlue(' Pts '),
        ],
        colWidths: [7, 30],
      });

      for (let team of group) {
        table.push([
          chalk.bold.magenta(team.rank),
          chalk.bold.cyan(team.team),
          chalk.bold.magenta(team.playedGames),
          chalk.bold.green(team.goals),
          chalk.bold.magenta(team.goalsAgainst),
          chalk.bold.cyan(team.goalDifference),
          chalk.bold.green(team.points),
        ]);
      }
      console.log(table.toString());
    }
    if (outData.json !== undefined || outData.csv !== undefined) {
      exportData(outData, groupStandings);
    }
  }
};

module.exports = {
  fixturesHelper,
  scoresHelper,
  standings,
  updateMessage,
  exportData
};
