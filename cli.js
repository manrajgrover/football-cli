#!/usr/bin/env node

'use strict';

const yargs = require('yargs');
const fs = require('fs');
const ora = require('ora');
const chalk = require('chalk');
const request = require('request');
const inquirer = require('inquirer');
const Table = require('cli-table3');
const config = require('./config');
const leagueIds = require('./leagueIds');
const helpers = require('./helpers');
const path = require('path');
const URLS = require('./constants');

const footballRequest = request.defaults({
  baseUrl: URLS.API_URL,
  headers: {
    'X-Auth-Token': config.API_KEY,
  },
});

/**
 * Get league ids url
 */
const LEAGUE_IDS_URL = URLS.LEAGUE_IDS_URL;

/**
 * Get all helpers from `helpers.js`
 */
const fixturesHelper = helpers.fixturesHelper;
const standingsHelper = helpers.standings;
const updateMessage = helpers.updateMessage;

/**
 * Command line interface code for the app
 */
const argv = yargs
  .usage('$0 <command>')
  .commandDir('cmds')
  .help('h')
  .alias('h', 'help')
  .version()
  .argv;
