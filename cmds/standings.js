const ora = require('ora');
const request = require('request');
const URLS = require('../constants');
const config = require('../config');
const helpers = require('../helpers');
const leagueIds = require('../leagueIds');

const updateMessage = helpers.updateMessage;
const buildAndPrintStandings = helpers.buildAndPrintStandings;

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
    .alias('j', 'json')
    .describe('j', 'Output results as JSON file')
    .string('j')
    .alias('c', 'csv')
    .describe('c', 'Output results as CSV file')
    .string('c')
    .alias('o', 'dir')
    .describe('o', 'Output directory for files')
    .string('o')
    .example('$0 standings -l PL')
    .argv;
};

exports.handler = function handler(yargs) {
  /** Get all the options set for `standings` command */
  const standings = yargs;

  const spinner = ora('Fetching data').start();

  const league = standings.league;
  const outData = {
    json: standings.json,
    csv: standings.csv,
    dir: standings.dir
  };

  if (leagueIds[league] === undefined) {
    spinner.stop();
    updateMessage('LEAGUE_ERR');
  }

  const id = leagueIds[league].id;

  footballRequest(`competitions/${id}/leagueTable`, (err, _, body) => {
    spinner.stop();
    if (err) {
      updateMessage('REQ_ERROR');
    } else {
      buildAndPrintStandings(body, outData);
    }
  });
};
