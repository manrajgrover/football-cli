#!/usr/bin/env node

/*
* @Author: Manraj Singh
* @Date:   2016-08-24 12:21:30
* @Last Modified by:   Manraj Singh
* @Last Modified time: 2016-08-26 18:22:27
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
  .command('run', 'Runs', (yargs) => {
  })
  .help('h')
  .alias('h', 'help')
  .argv;