#!/usr/bin/env node

/*
* @Author: Manraj Singh
* @Date:   2016-08-24 12:21:30
* @Last Modified by:   Manraj Singh
* @Last Modified time: 2016-08-26 20:48:21
*/

'use strict';

const yargs = require('yargs');
const fs = require('fs');
const ora = require('ora');
const chalk = require('chalk');
const request = require('request');
const inquirer = require('inquirer');
const Table = require('cli-table');
const config = require('./config');
const league_ids = require('./league_ids');

const API_URL = 'http://api.football-data.org/v1/';
const headers = {
  'X-Auth-Token': config.API_KEY
};

const argv = yargs
  .usage('$0 <command>')
  .command('scores', 'Get scores of past and live fixtures', (yargs) => {

  })
  .command('scores', 'Get scores of past and live fixtures', (yargs) => {

  })
  .command('list', 'Get scores of past and live fixtures', (yargs) => {
    var argv = yargs
      .usage('Usage: sudo $0 list [options]')
      .alias('r', 'refresh').describe('r', 'Refresh league ids').boolean('r')
      .example('sudo $0 config -r')
      .argv;
    if (argv.r){
      request({ "url": API_URL+"competitions", "headers": headers }, function (err, res, body) {
        if(err){
          console.log("Sorry, an error occured");
        }
        else{
          var data = JSON.parse(body);
          let newLeagueIDs = {};
          for(let i=0;i<data.length;i++){
            let comp = data[i];
            newLeagueIDs[comp.league] = {
              "id": comp.id,
              "caption": comp.caption
            };
          }
          console.log(JSON.stringify(newLeagueIDs, null, 2));
          //fs.writeFileSync(__dirname+'/league_ids.json', JSON.stringify(newLeagueIDs, null, 2), 'utf8');
        }
      });
    }
    else{
      var table = new Table({
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
      var obj = config;
      if (answers.API_KEY !== ''){
        obj.API_KEY = answers.API_KEY;
      }
      fs.writeFileSync(__dirname+'/config.json', JSON.stringify(obj, null, 2), 'utf8');
    });
  })
  .help('h')
  .alias('h', 'help')
  .argv;
