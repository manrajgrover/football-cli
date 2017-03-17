'use strict';

const leagueIds = require('./leagueIds');
const Table = require('cli-table');
const chalk = require('chalk');
const moment = require('moment');
const URLS = require('./constants');

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

const fixturesHelper = (league, name, team, body) => {
  let data = JSON.parse(body);
  let fixtures = data.fixtures;

  if (fixtures === undefined || fixtures.length === 0) {
    updateMessage('UPDATE', 'Sorry, no fixtures to show right now');
    return;
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

const getStandingsTableInstance = () => (
  new Table({
    head: [
      chalk.bold.white.bgCyan('Rank'),
      chalk.bold.white.bgCyan('Team'),
      chalk.bold.white.bgCyan('Played'),
      chalk.bold.white.bgCyan('Goal Diff'),
      chalk.bold.white.bgCyan('Points'),
    ],
    colWidths: [7, 25, 10, 15, 10],
  })
);

const getURL = endPoint => API_URL + endPoint;

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

const refresh = (body) => {
  let data = JSON.parse(body);
  let newLeagueIDs = {};

  for (let comp of data) {
    newLeagueIDs[comp.league] = {
      id: comp.id,
      caption: comp.caption
    };
  }

  return newLeagueIDs;
};

const scoresHelper = (isLive, team, body) => {
  let data = JSON.parse(body);
  let fixtures = data.fixtures;
  let live = [];
  let scores = [];

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
    } else {
      updateMessage('UPDATE', 'Sorry, no live match right now');
    }
  } else {
    if (scores.length !== 0) {
      printScores(scores, false);
    } else {
      updateMessage('UPDATE', 'Sorry, no scores to show right now');
    }
  }
};

const standings = (body) => {
  let data = JSON.parse(body);
  let table;

  if (data.standing !== undefined) {
    let standing = data.standing;

    table = getStandingsTableInstance();

    for (let team of standing) {
      table.push([
        chalk.bold.magenta(team.position),
        chalk.bold.cyan(team.teamName),
        chalk.bold.yellow(team.playedGames),
        chalk.bold.blue(team.goalDifference),
        chalk.bold.green(team.points),
      ]);
    }

    console.log(table.toString());
  } else {
    let groupStandings = data.standings;

    for (let groupCode in groupStandings) {
      console.log(chalk.bgCyan.bold.white(groupCode));

      let group = standings[groupCode];

      table = getStandingsTableInstance();

      for (let team of group) {
        table.push([
          chalk.bold.magenta(team.rank),
          chalk.bold.cyan(team.team),
          chalk.bold.yellow(team.playedGames),
          chalk.bold.blue(team.goalDifference),
          chalk.bold.green(team.points),
        ]);
      }
      console.log(table.toString());
    }
  }
};

module.exports = {
  fixturesHelper,
  getURL,
  refresh,
  scoresHelper,
  standings,
  updateMessage,
};
