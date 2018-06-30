const ora = require('ora');
const moment = require('moment');
const request = require('request');
const URLS = require('../constants');
const config = require('../config');
const helpers = require('../helpers');
const leagueIds = require('../leagueIds');
const Table = require('cli-table3');
const chalk = require('chalk');

const fixturesHelper = helpers.fixturesHelper;

const footballRequest = request.defaults({
    baseUrl: URLS.API_URL,
    headers: {
        'X-Auth-Token': config.API_KEY,
    },
});

exports.command = 'lists';
exports.desc = 'List of codes of various competitions';
exports.builder = (yargs) => {
    return yargs
        .usage('Usage: sudo $0 lists [options]')
        .alias('r', 'refresh')
            .describe('r', 'Refresh league ids')
            .boolean('r')
        .example('sudo $0 lists -r')
        .argv;
};
exports.handler = (yargs) => {
    /**
     * Get all the options set for `lists` command
     */
    const lists = yargs;

    const spinner = ora('Fetching data').start();
    const refreshHeaders = { 'User-Agent': 'node.js' };

    if (lists.r) {
      request({
        url: LEAGUE_IDS_URL,
        headers: refreshHeaders,
        json: true,
      }, (err, res, body) => {
        spinner.stop();

        if (err) {
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
}