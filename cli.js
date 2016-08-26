/*
* @Author: Manraj Singh
* @Date:   2016-08-24 12:21:30
* @Last Modified by:   Manraj Singh
* @Last Modified time: 2016-08-26 17:55:49
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
  .command('run', '', (yargs) => {
    var argv = yargs
      .usage('Usage: $0 run <options>')
      .demand(['s', 'i', 'o'])
      .alias('s', 'source').describe('s', 'Source Code file path')
      .alias('i', 'input').describe('i', 'Input file path')
      .alias('l', 'language').describe('l', 'Language. Change `config` for default.')
      .alias('o', 'output').describe('o', 'Output file path')
      .example('$0 run -s A.cpp -i Input00.in -o Output.txt -l 2')
      .argv;
  })
  .help('h')
  .alias('h', 'help')
  .argv;