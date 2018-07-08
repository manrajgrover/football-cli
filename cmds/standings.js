const ora = require('ora');
const moment = require('moment');
const request = require('request');
const URLS = require('../constants');
const config = require('../config');
const helpers = require('../helpers');
const leagueIds = require('../leagueIds');

const updateMessage = helpers.updateMessage;
const standingsHelper = helpers.standings;

const footballRequest = request.defaults({
  baseUrl: URLS.API_URL,
  headers: {
    'X-Auth-Token': config.API_KEY,
  },
});

exports.command = 'standings';
exports.desc = 'Get standings of particular league';
exports.builder = function builder(yargs) {
  return yargs
    .usage('Usage: $0 standings [options]')
    .alias('l', 'league')
      .describe('l', 'League to be searched')
      .demand('l')
    .example('$0 standings -l PL')
    .argv;
};
exports.handler = function handler(yargs) {
  /**
   * Get all the options set for `standings` command
   */
  const standings = yargs;
  const spinner = ora('Fetching data').start();
  const league = standings.l;
  if (leagueIds[league] === undefined) {
    spinner.stop();
    updateMessage('LEAGUE_ERR');
  }
  const id = leagueIds[league].id;
  footballRequest(`competitions/${id}/leagueTable`, (err, res, body) => {
    spinner.stop();
    if (err) {
      updateMessage('REQ_ERROR');
    } else {
      standingsHelper(body);
    }
  });
};
