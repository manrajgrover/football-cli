const fs = require('fs');
const path = require('path');
const ora = require('ora');
const request = require('request');
const Table = require('cli-table3');
const chalk = require('chalk');
const leagueIds = require('../leagueIds');
const helpers = require('./utils/helpers');
const URLS = require('../constants');

const { updateMessage } = helpers;
const { LEAGUE_IDS_URL } = URLS;

exports.command = 'lists';
exports.desc = 'List of codes of various competitions';

exports.builder = function builder(yargs) {
  return yargs
    .usage('Usage: sudo $0 lists [options]')
    .alias('r', 'refresh')
    .describe('r', 'Refresh league ids')
    .boolean('r')
    .example('sudo $0 lists -r')
    .argv;
};

exports.handler = function handler(yargs) {
  /** Get all the options set for `lists` command */
  const lists = yargs;

  const spinner = ora('Fetching data').start();
  const refreshHeaders = { 'User-Agent': 'node.js' };

  if (lists.refresh) {
    request({
      url: LEAGUE_IDS_URL,
      headers: refreshHeaders,
      json: true,
    }, (err, res, body) => {
      spinner.stop();
      if (err || res.statusCode !== 200) {
        updateMessage('REQ_ERROR');
      } else {
        const newLeagueIDs = Buffer.from(body.content, 'base64').toString('utf8');

        fs.writeFileSync(
          path.resolve(__dirname, 'leagueIds.json'),
          newLeagueIDs,
          'utf8'
        );

        updateMessage('UPDATE', 'New list fetched and saved');
      }
    });
  } else {
    const table = new Table({
      head: [
        chalk.bold.white.bgBlue(' League '),
        chalk.bold.white.bgBlue(' League Code '),
      ],
      colWidths: [40, 20],
    });

    for (let league of Object.keys(leagueIds)) {
      table.push([
        chalk.bold.cyan(leagueIds[league].caption),
        chalk.bold.green(league),
      ]);
    }

    spinner.stop();
    console.log(table.toString());
  }
};
