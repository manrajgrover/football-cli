#!/usr/bin/env node

/*
* @Author: Manraj Singh
* @Date:   2016-08-24 12:21:30
* @Last Modified by:   Manraj Singh
* @Last Modified time: 2016-08-27 20:39:08
*/

'use strict';

const yargs = require('yargs');
const fs = require('fs');
const ora = require('ora');
const chalk = require('chalk');
const request = require('request');
const moment = require('moment');
const inquirer = require('inquirer');
const path = require('path');
const Table = require('cli-table');
const config = require('./config');
const league_ids = require('./league_ids');

const API_URL = 'http://api.football-data.org/v1/';

const headers = {
  'X-Auth-Token': config.API_KEY
};

const getURL = (endPoint) => {
  return API_URL + endPoint;
}

const standings = (err, res, body) => {
  if(err){
    console.log(chalk.red("Sorry, an error occured"));
  }
  else {
    let data = JSON.parse(body), table;

    if(data["standing"] !== undefined) {
      let standing = data["standing"];

      table = new Table({
        head: ['Rank', 'Team', 'Played', 'Goal Diff', 'Points'],
        colWidths: [ 7, 20, 10, 15, 10]
      });

      for(let i = 0; i < standing.length; i++) {
        let team = standing[i];
        table.push([ team.position, team.teamName, team.playedGames, team.goalDifference, team.points]);
      }

      console.log(table.toString());
    }
    else {
      let standings = data["standings"];

      for(let groupCode in standings) {
        console.log(groupCode);

        let group = standings[groupCode];

        table = new Table({
          head: ['Rank', 'Team', 'Played', 'Goal Diff', 'Points'],
          colWidths: [ 7, 20, 10, 15, 10]
        });

        for(let i = 0; i < group.length; i++) {
          let team = group[i];
          table.push([ team.rank, team.team, team.playedGames, team.goalDifference, team.points]);
        }

        console.log(table.toString());
      }
    }
  }
}

const refresh = (err, res, body) => {
  if(err){
    console.log(chalk.red("Sorry, an error occured"));
  }
  else {
    let data = JSON.parse(body), newLeagueIDs = {};

    for(let i = 0; i < data.length; i++) {
      let comp = data[i];

      newLeagueIDs[comp.league] = {
        "id": comp.id,
        "caption": comp.caption
      };
    }

    fs.writeFileSync(__dirname+'/league_ids.json', JSON.stringify(newLeagueIDs, null, 2), 'utf8');
  }
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

const fixturesHelper = (league, name, team, body) => {
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

      if(homeTeam.indexOf(team) !== -1 || awayTeam.indexOf(team) !== -1){
        let time = (fixture.status === "IN_PLAY") ? "LIVE" : moment(fixture.date).calendar();
        console.log(`${chalk.green(name)}  ${chalk.cyan(homeTeam)} ${chalk.cyan(goalsHomeTeam)} vs. ${chalk.red(goalsAwayTeam)} ${chalk.red(awayTeam)} ${chalk.yellow(time)}`);
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
      console.log(`${chalk.green(name)}  ${chalk.cyan(homeTeam)} ${chalk.cyan(goalsHomeTeam)} vs. ${chalk.red(goalsAwayTeam)} ${chalk.red(awayTeam)} ${chalk.yellow(time)}`);
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
    console.log(`${chalk.green(name)}  ${chalk.cyan(homeTeam)} ${chalk.cyan(goalsHomeTeam)} vs. ${chalk.red(goalsAwayTeam)} ${chalk.red(awayTeam)} ${chalk.yellow(time)}`);
  }
}

const scoresHelper = (l, team, body) => {
  let data = JSON.parse(body),
      fixtures = data.fixtures,
      live = [], scores = [];

  for(let i = 0; i < fixtures.length; i++){
    let fixture = fixtures[i],
        homeTeam = fixture.homeTeamName,
        awayTeam = fixture.awayTeamName;

    if(fixture.status == "IN_PLAY" && (homeTeam.indexOf(team) !== -1 || awayTeam.indexOf(team) !== -1)) {
      live.push(fixture);
      scores.push(fixture);
    }
    else if(fixture.status == "FINISHED" && (homeTeam.indexOf(team) !== -1 || awayTeam.indexOf(team) !== -1)){
      scores.push(fixture);
    }
  }

  if(argv.l){
    if(live.length !== 0){
      printScores(live, true);
    }
    else{
      console.log(chalk.cyan("Sorry, no live match right now"));
    }
  }
  else{
    if(scores.length !== 0){
      printScores(scores, false);
    }
    else{
      console.log(chalk.cyan("Sorry, no scores to show right now"));
    }
  }
}

const argv = yargs
  .usage('$0 <command>')
  .command('scores', 'Get scores of past and live fixtures', (yargs) => {
    const argv = yargs
      .usage('Usage: $0 scores [options]')
      .alias('l', 'live').describe('l', 'Live scores').boolean('l')
      .alias('t', 'team').describe('t', 'Select team')
      .example('sudo $0 scores -l')
      .argv;

    let url = undefined,
        team = (argv.t === undefined) ? '' : argv.t,
        timeFrameStart = undefined,
        timeFrameEnd = undefined;

    if(argv.l){
      timeFrameStart = moment().format("YYYY-MM-DD");
      timeFrameEnd = moment().add(1, "days").format("YYYY-MM-DD");
      url = `fixtures?timeFrameStart=${timeFrameStart}&timeFrameEnd=${timeFrameEnd}`;
    }
    else{
      timeFrameStart = moment().subtract(1, "days").format("YYYY-MM-DD");
      timeFrameEnd = moment().add(1, "days").format("YYYY-MM-DD");
      url = `fixtures?timeFrameStart=${timeFrameStart}&timeFrameEnd=${timeFrameEnd}`;
    }

    request({ "url": getURL(url), "headers": headers }, (err, res, body) => {
      if(err) {
        console.log(chalk.red("Sorry, an error occured"));
      }
      else {
        scoresHelper(argv.l, team, body);
      }
    });
  })
  .command('fixtures', 'Get upcoming and past fixtures of a league and team', (yargs) => {

    const argv = yargs
      .usage('Usage: $0 fixtures [options]')
      .alias('d', 'days').describe('t', 'Number of days')
      .alias('l', 'league').describe('l', 'League')
      .alias('t', 'team').describe('t', 'Team name or substring of it')
      .alias('n', 'next').describe('n', 'Next or upcoming matches').boolean('n')
      .example('sudo $0 fixtures -d 10 -t "Manchester United" -n')
      .argv;
      
    let days = argv.d || 10,
        league = argv.l,
        team = argv.t,
        time = (argv.n == true) ? "n" : "p";

    let timeFrame = `${time}${days}`;
    if(league !== undefined){
      if(league_ids[league] == undefined){
        throw new Error("No league found. Please check the League Code entered with the list `football list`.");
      }

      let id = league_ids[league].id,
          name = league_ids[league].caption;

      request({ "url": getURL(`competitions/${id}/fixtures?timeFrame=${timeFrame}`), "headers": headers }, (err, res, body) =>{
        if(err) {
          console.log(chalk.red("Sorry, an error occured"));
        }
        else {
          fixturesHelper(league, name, team, body);
        }
      });
    }
    else {
      request({ "url": getURL(`fixtures?timeFrame=${timeFrame}`), "headers": headers }, (err, res, body) => {
        if(err) {
          console.log(chalk.red("Sorry, an error occured"));
        }
        else {
          fixturesHelper(league, undefined, team, body);
        }
      });
    }
  })
  .command('standings', 'Get standings of particular league', (yargs) => {
    const argv = yargs
      .usage('Usage: $0 standings [options]')
      .alias('l', 'league').describe('l', 'League to be searched').demand('l')
      .example('sudo $0 standings -l')
      .argv;

    let id = league_ids[argv.l].id;

    request({ "url": getURL(`competitions/${id}/leagueTable`), "headers": headers }, standings);
  })
  .command('list', 'List of codes of various competitions', (yargs) => {
    const argv = yargs
      .usage('Usage: sudo $0 list [options]')
      .alias('r', 'refresh').describe('r', 'Refresh league ids').boolean('r')
      .example('sudo $0 list -r')
      .argv;

    if (argv.r) {
      request({ "url": getURL("competitions"), "headers": headers }, refresh);
    }
    else {
      let table = new Table({
        head: ['League', 'League Code'],
        colWidths: [ 40, 20]
      });

      for(let league in league_ids){
        table.push([ league_ids[league].caption, league]);
      }

      console.log(table.toString());
    }
  })
  .command('config', 'Change configuration and defaults', (yargs) => {
    const questions = [{
      type: 'input',
      name: 'API_KEY',
      message: 'Enter API KEY <leave blank incase unchanged>'
    }];

    inquirer.prompt(questions).then((answers) => {
      let obj = config;

      if (answers.API_KEY !== ''){
        obj.API_KEY = answers.API_KEY;
      }

      fs.writeFileSync(__dirname+'/config.json', JSON.stringify(obj, null, 2), 'utf8');
    });
  })
  .help('h')
  .alias('h', 'help')
  .argv;
