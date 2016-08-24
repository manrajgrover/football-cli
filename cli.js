/*
* @Author: Manraj Singh
* @Date:   2016-08-24 12:21:30
* @Last Modified by:   Manraj Singh
* @Last Modified time: 2016-08-24 21:26:53
*/

'use strict';

const yargs = require('yargs');
const fs = require('fs');
const ora = require('ora');
const chalk = require('chalk');
const request = require('request');
const Table = require('cli-table');
const config = require('./config');

const API_URL = 'API_URL';

const argv = yargs
  .usage('$0 <command>')
  .command('run', 'Run code on HackerRank server', (yargs) => {
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