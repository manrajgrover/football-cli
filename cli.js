#!/usr/bin/env node

/*
* @Author: Manraj Singh
* @Date:   2016-08-24 12:21:30
* @Last Modified by:   Manraj Singh
* @Last Modified time: 2016-08-27 16:51:28
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
    throw new Error("Sorry, an error occured");
  }
  else{

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
    else{

      let standings = data["standings"];

      for(let groupCode in standings) {
        console.log(groupCode);

        let group = standings[groupCode];

        table = new Table({
          head: ['Rank', 'Team', 'Played', 'Goal Diff', 'Points'],
          colWidths: [ 7, 20, 10, 15, 10]
        });

        for(let i = 0; i < group.length; i++){
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
    console.log("Sorry, an error occured");
  }
  else {
    let data = JSON.parse(body);
    let newLeagueIDs = {};

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

const argv = yargs
  .usage('$0 <command>')
  .command('scores', 'Get scores of past and live fixtures', (yargs) => {

    const argv = yargs
      .usage('Usage: $0 scores [options]')
      .alias('l', 'live').describe('l', 'Live scores')
      .alias('t', 'team').describe('t', 'Select team')
      .example('sudo $0 scores -l')
      .argv;


  })
  .command('fixtures', 'Get scores of past and live fixtures', (yargs) => {

    const argv = yargs
      .usage('Usage: $0 scores [options]')
      .alias('d', 'days').describe('t', 'Number of days')
      .alias('l', 'league').describe('l', 'League')
      .alias('t', 'team').describe('t', 'Team name or substring of it')
      .alias('n', 'next').describe('n', 'Next or upcoming matches').boolean('n')
      .example('sudo $0 fixtures -d 10 -t "Manchester United"')
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

      console.log(id +" "+ name);
      console.log(timeFrame);

      request({ "url": getURL(`competitions/${id}/fixtures?timeFrame=${timeFrame}`), "headers": headers }, (err, res, body) =>{
        if(err){
          console.log(chalk.red("Sorry, an error occured"));
        }
        else{
          let data = JSON.parse(body),
              fixtures = data.fixtures;

          //console.log(fixtures);
          if(team !== undefined) {
            for(let i = 0; i< fixtures.length; i++) {
              let fixture = fixtures[i];

              let homeTeam = fixture.homeTeamName,
                  awayTeam = fixture.awayTeamName,
                  goalsHomeTeam = (fixture.result.goalsHomeTeam === null) ? "-1" : fixture.result.goalsHomeTeam,
                  goalsAwayTeam = (fixture.result.goalsAwayTeam === null) ? "-1" : fixture.result.goalsAwayTeam;

              if(homeTeam.indexOf(team) !== -1 || awayTeam.indexOf(team) !== -1){
                let time = moment(fixture.date).calendar();;
                console.log(`${name}  ${homeTeam} ${goalsHomeTeam} vs. ${goalsAwayTeam} ${awayTeam} ${time}`);
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

              let time = moment(fixture.date).calendar();;
              console.log(`${name}  ${homeTeam} ${goalsHomeTeam} vs. ${goalsAwayTeam} ${awayTeam} ${time}`);
            }
          }
        }
      });

    }
    else {



    }
  })
  .command('standings', 'Get standings of particular league', (yargs) => {

    const argv = yargs
      .usage('Usage: $0 standings [options]')
      .demand('l')
      .alias('l', 'league').describe('l', 'League to be searched')
      .example('sudo $0 standings -l')
      .argv;

    let id = league_ids[argv.l].id;

    request({ "url": getURL(`competitions/${id}/leagueTable`), "headers": headers }, standings);
  })
  .command('list', 'List of codes of various competitions', (yargs) => {

    const argv = yargs
      .usage('Usage: sudo $0 list [options]')
      .alias('r', 'refresh').describe('r', 'Refresh league ids').boolean('r')
      .example('sudo $0 config -r')
      .argv;

    if (argv.r){

      request({ "url": getURL("competitions"), "headers": headers }, refresh);

    }
    else{

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
