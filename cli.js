#!/usr/bin/env node

/*
* @Author: Manraj Singh
* @Date:   2016-08-24 12:21:30
* @Last Modified by:   Manraj Singh
* @Last Modified time: 2016-08-26 19:14:21
*/

'use strict';

const yargs = require('yargs');
const fs = require('fs');
const ora = require('ora');
const chalk = require('chalk');
const request = require('request');
const Table = require('cli-table');
const config = require('./config');
const league_ids = require('./league_ids');

const API_URL = 'API_URL';
const headers = {
  'X-Auth-Token': config.API_KEY
};

const argv = yargs
  .usage('$0 <command>')
  .command('scores', 'Get scores of past and live fixtures', (yargs) => {

  })
  .command('scores', 'Get scores of past and live fixtures', (yargs) => {

  })
  .command('scores', 'Get scores of past and live fixtures', (yargs) => {

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