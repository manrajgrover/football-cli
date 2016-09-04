#!/usr/bin/env node

/*
* @Author: Manraj Singh
* @Date:   2016-08-24 12:21:30
* @Last Modified by:   Manraj Singh
* @Last Modified time: 2016-09-04 22:52:44
*/

'use strict';

const yargs = require('yargs');
const fs = require('fs');
const ora = require('ora');
const chalk = require('chalk');
const request = require('request');
const moment = require('moment');
const inquirer = require('inquirer');
const Table = require('cli-table');
const config = require('./config');
const league_ids = require('./league_ids');
const helpers = require('./helpers');

/**
 * Get all helpers from `helpers.js`
 */
const fixturesHelper = helpers.fixturesHelper,
      getURL = helpers.getURL,
      refresh = helpers.refresh,
      scoresHelper = helpers.scoresHelper,
      standings = helpers.standings,
      updateMessage = helpers.updateMessage;

/**
 * Headers for every request that is made
 */
const headers = {
  'X-Auth-Token': config.API_KEY
};

/**
 * Command line interface code for the app
 */
const argv = yargs
  .usage('$0 <command>')
  .command('scores', 'Get scores of past and live fixtures', (yargs) => {

    /**
     * Get all the options set for `scores` command
     */
    const argv = yargs
      .usage('Usage: $0 scores [options]')
      .alias('l', 'live').describe('l', 'Live scores').boolean('l')
      .alias('t', 'team').describe('t', 'Select team').string('t')
      .example('$0 scores -t "Manchester United" -l')
      .argv;

    const spinner = ora('Fetching data').start();

    let team = (argv.t === undefined) ? '' : (argv.t).toLowerCase();

    /**
     * timeFrameStart [Set start date from which fixtures is to be fetch]
     * timeFrameEnd   [Set end date till which fixtures is to be fetch]
     */
    let timeFrameStart = moment().subtract(1, "days").format("YYYY-MM-DD"),
        timeFrameEnd = moment().add(1, "days").format("YYYY-MM-DD");

    /**
     * End Point for fetching all fixtures between `timeFrameStart` and `timeFrameEnd`
     */
    let url = `fixtures?timeFrameStart=${timeFrameStart}&timeFrameEnd=${timeFrameEnd}`;

    /**
     * Creates request to fetch fixtures and show them
     * @param  {[String]} options."url":     getURL(url)   [End point from where data needs to be fetched]
     * @param  {[Object]} options."headers": headers       [Headers for the request]
     * @return {[None]}                                    [None]
     */
    request({ "url": getURL(url), "headers": headers }, (err, res, body) => {
      if(err) {
        spinner.stop();
        updateMessage("ERROR");
      }
      else {
        spinner.stop();
        scoresHelper(argv.l, team, body);
      }
    });
  })
  .command('fixtures', 'Get upcoming and past fixtures of a league and team', (yargs) => {
    /**
     * Get all the options set for `fixtures` command
     */
    const argv = yargs
      .usage('Usage: $0 fixtures [options]')
      .alias('d', 'days').describe('t', 'Number of days')
      .alias('l', 'league').describe('l', 'League')
      .alias('t', 'team').describe('t', 'Team name or substring of it').string('t')
      .alias('n', 'next').describe('n', 'Next or upcoming matches').boolean('n')
      .example('$0 fixtures -l PL -d 5 -t "Manchester United" -n')
      .argv;
    
    const spinner = ora('Fetching data').start();

    let days = argv.d || 10,
        league = argv.l,
        team = argv.t || "",
        time = (argv.n === true) ? "n" : "p";

    let timeFrame = `${time}${days}`;

    if(league !== undefined) {
      if(league_ids[league] === undefined){
        spinner.stop();
        updateMessage("LEAGUE_ERR");
      }

      let id = league_ids[league].id,
          name = league_ids[league].caption;

      request({ "url": getURL(`competitions/${id}/fixtures?timeFrame=${timeFrame}`),
                "headers": headers }, (err, res, body) => {
        if(err) {
          spinner.stop();
          updateMessage("ERROR");
        }
        else {
          spinner.stop();
          fixturesHelper(league, name, team, body);
        }
      });
    }
    else {
      request({ "url": getURL(`fixtures?timeFrame=${timeFrame}`),
                "headers": headers }, (err, res, body) => {

        if(err) {
          spinner.stop();
          updateMessage("ERROR");
        }
        else {
          spinner.stop();
          fixturesHelper(league, undefined, team, body);
        }
      });
    }
  })
  .command('standings', 'Get standings of particular league', (yargs) => {

    /**
     * Get all the options set for `standings` command
     */
    const argv = yargs
      .usage('Usage: $0 standings [options]')
      .alias('l', 'league').describe('l', 'League to be searched').demand('l')
      .example('$0 standings -l PL')
      .argv;

    const spinner = ora('Fetching data').start();

    let league = argv.l;

    if(league_ids[league] === undefined){
      spinner.stop();
      updateMessage("LEAGUE_ERR");
    }

    let id = league_ids[league].id;

    request({ "url": getURL(`competitions/${id}/leagueTable`),
              "headers": headers }, (err, res, body) => {

      if(err) {
        spinner.stop();
        updateMessage("ERROR");
      }
      else {
        spinner.stop();
        standings(body);
      }
    });
  })
  .command('lists', 'List of codes of various competitions', (yargs) => {

    /**
     * Get all the options set for `lists` command
     */
    const argv = yargs
      .usage('Usage: sudo $0 lists [options]')
      .alias('r', 'refresh').describe('r', 'Refresh league ids').boolean('r')
      .example('sudo $0 lists -r')
      .argv;

    const spinner = ora('Fetching data').start();

    if (argv.r) {
      request({ "url": getURL("competitions"), "headers": headers }, (err, res, body) => {
        if(err) {
          spinner.stop();
          updateMessage("ERROR");
        }
        else {
          spinner.stop();
          let newLeagueIDs = refresh(body);
          fs.writeFileSync( __dirname + '/league_ids.json', JSON.stringify(newLeagueIDs, null, 2), 'utf8');
          updateMessage("UPDATE", "New list fetched and saved");
        }
      });
    }
    else {
      let table = new Table({
        head: [
          chalk.bold.white.bgCyan('League'),
          chalk.bold.white.bgCyan('League Code')
        ],
        colWidths: [ 40, 20]
      });

      for(let league in league_ids){
        table.push([
          chalk.bold.cyan(league_ids[league].caption),
          chalk.bold.green(league)
        ]);
      }
      spinner.stop();
      console.log( table.toString() );
    }
  })
  .command('config', 'Change configuration and defaults', (yargs) => {

    /**
     * Get all the options set for `config` command
     */
    const argv = yargs
      .usage('Usage: sudo $0 config')
      .example('sudo $0 config')
      .argv;

    if(argv.h){
      return;
    }

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

      fs.writeFileSync( __dirname + '/config.json', JSON.stringify(obj, null, 2), 'utf8');
      updateMessage("UPDATE", "API KEY has been updated.");
    });
  })
  .help('h')
  .alias('h', 'help')
  .argv;
