/*
* @Author: Manraj Singh
* @Date:   2016-08-27 20:49:04
* @Last Modified by:   Manraj Singh
* @Last Modified time: 2016-08-27 21:05:44
*/

'use strict';

const league_ids = require('./league_ids')
const Table = require('cli-table');
const chalk = require('chalk');
const moment = require('moment');

const API_URL = 'http://api.football-data.org/v1/';

module.exports.getURL = (endPoint) => {
  return API_URL + endPoint;
}

module.exports.standings = (body) => {
  let data = JSON.parse(body), table;

  if(data["standing"] !== undefined) {
    let standing = data["standing"];

    table = new Table({
      head: [
        chalk.bold.white.bgCyan('Rank'),
        chalk.bold.white.bgCyan('Team'),
        chalk.bold.white.bgCyan('Played'),
        chalk.bold.white.bgCyan('Goal Diff'),
        chalk.bold.white.bgCyan('Points')
      ],
      colWidths: [ 7, 25, 10, 15, 10]
    });

    for(let i = 0; i < standing.length; i++) {
      let team = standing[i];
      table.push([
        chalk.bold.magenta(team.position),
        chalk.bold.cyan(team.teamName),
        chalk.bold.yellow(team.playedGames),
        chalk.bold.blue(team.goalDifference),
        chalk.bold.green(team.points)
      ]);
    }

    console.log(table.toString());
  }
  else {
    let standings = data["standings"];

    for(let groupCode in standings) {
      console.log(chalk.bgCyan.bold.white(groupCode));

      let group = standings[groupCode];

      table = new Table({
        head: [
          chalk.bold.white.bgCyan('Rank'),
          chalk.bold.white.bgCyan('Team'),
          chalk.bold.white.bgCyan('Played'),
          chalk.bold.white.bgCyan('Goal Diff'),
          chalk.bold.white.bgCyan('Points')
        ],
        colWidths: [ 7, 25, 10, 15, 10]
      });

      for(let i = 0; i < group.length; i++) {
        let team = group[i];
        table.push([
          chalk.bold.magenta(team.rank),
          chalk.bold.cyan(team.team),
          chalk.bold.yellow(team.playedGames),
          chalk.bold.blue(team.goalDifference),
          chalk.bold.green(team.points)
        ]);
      }

      console.log(table.toString());
    }
  }
}

module.exports.refresh = (body) => {
  let data = JSON.parse(body), newLeagueIDs = {};

  for(let i = 0; i < data.length; i++) {
    let comp = data[i];

    newLeagueIDs[comp.league] = {
      "id": comp.id,
      "caption": comp.caption
    };
  }

  return newLeagueIDs;
}


const getLeagueName = (fixture) => {
  let compUrl = fixture._links.competition.href;
  let parts = compUrl.split('/');
  let id = parts[parts.length-1];
  for(let league in league_ids){
    if(league_ids[league].id == id) {
      return league_ids[league].caption;
    }
  }
  return "";
}

module.exports.fixturesHelper = (league, name, team, body) => {
  let data = JSON.parse(body),
      fixtures = data.fixtures;
  if(team !== undefined) {
    for(let i = 0; i< fixtures.length; i++) {
      let fixture = fixtures[i];

      let homeTeam = fixture.homeTeamName,
          awayTeam = fixture.awayTeamName,
          goalsHomeTeam = (fixture.result.goalsHomeTeam === null) ? "-1" : fixture.result.goalsHomeTeam,
          goalsAwayTeam = (fixture.result.goalsAwayTeam === null) ? "-1" : fixture.result.goalsAwayTeam;

      name = (league === undefined) ? getLeagueName(fixture) : name;

      if((homeTeam.toLowerCase()).indexOf((team).toLowerCase()) !== -1 || (awayTeam.toLowerCase()).indexOf((team).toLowerCase()) !== -1){
        let time = (fixture.status === "IN_PLAY") ? "LIVE" : moment(fixture.date).calendar();
        console.log(`${chalk.green.bold(name)}  ${chalk.cyan.bold(homeTeam)} ${chalk.cyan.bold(goalsHomeTeam)} vs. ${chalk.red.bold(goalsAwayTeam)} ${chalk.red.bold(awayTeam)} ${chalk.yellow.bold(time)}`);
      }
    }
  }
  else {

    for(let i = 0; i< fixtures.length; i++) {
      let fixture = fixtures[i];

      let homeTeam = fixture.homeTeamName,
          awayTeam = fixture.awayTeamName,
          goalsHomeTeam = (fixture.result.goalsHomeTeam === null) ? "-1" : fixture.result.goalsHomeTeam,
          goalsAwayTeam = (fixture.result.goalsAwayTeam === null) ? "-1" : fixture.result.goalsAwayTeam;

      name = (league === undefined) ? getLeagueName(fixture) : name;

      let time = (fixture.status === "IN_PLAY") ? "LIVE" : moment(fixture.date).calendar();
      console.log(`${chalk.green.bold(name)}  ${chalk.cyan.bold(homeTeam)} ${chalk.cyan.bold(goalsHomeTeam)} vs. ${chalk.red.bold(goalsAwayTeam)} ${chalk.red.bold(awayTeam)} ${chalk.yellow.bold(time)}`);
    }
  }
}

const printScores = (arr, live) => {
  for(let i = 0; i < arr.length; i++){
    let fixture = arr[i];
    let name = getLeagueName(fixture),
        homeTeam = fixture.homeTeamName,
        awayTeam = fixture.awayTeamName,
        goalsHomeTeam = (fixture.result.goalsHomeTeam === null) ? "-1" : fixture.result.goalsHomeTeam,
        goalsAwayTeam = (fixture.result.goalsAwayTeam === null) ? "-1" : fixture.result.goalsAwayTeam,
        time = (live === true) ? "LIVE": moment(fixture.date).calendar();
    console.log(`${chalk.green.bold(name)}  ${chalk.cyan.bold(homeTeam)} ${chalk.cyan.bold(goalsHomeTeam)} vs. ${chalk.red.bold(goalsAwayTeam)} ${chalk.red.bold(awayTeam)} ${chalk.yellow.bold(time)}`);
  }
}

module.exports.scoresHelper = (l, team, body) => {
  let data = JSON.parse(body),
      fixtures = data.fixtures,
      live = [], scores = [];

  for(let i = 0; i < fixtures.length; i++){
    let fixture = fixtures[i],
        homeTeam = (fixture.homeTeamName).toLowerCase(),
        awayTeam = (fixture.awayTeamName).toLowerCase();

    team = team.toLowerCase();

    if(fixture.status === "IN_PLAY" && (homeTeam.indexOf(team) !== -1 || awayTeam.indexOf(team) !== -1)) {
      live.push(fixture);
      scores.push(fixture);
    }
    else if(fixture.status === "FINISHED" && (homeTeam.indexOf(team) !== -1 || awayTeam.indexOf(team) !== -1)){
      scores.push(fixture);
    }
  }

  if(l){
    if(live.length !== 0){
      printScores(live, true);
    }
    else{
      console.log(chalk.cyan.bold("Sorry, no live match right now"));
    }
  }
  else{
    if(scores.length !== 0){
      printScores(scores, false);
    }
    else{
      console.log(chalk.cyan.bold("Sorry, no scores to show right now"));
    }
  }
}
