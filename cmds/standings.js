const ora = require('ora');

const helpers = require('./utils/helpers');
const requests = require('./utils/requests');
const leagueIds = require('../leagueIds');

const { updateMessage, buildAndPrintStandings } = helpers;
const { footballRequest } = requests;

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
    .example('$0 standings -l PL').argv;
};

exports.handler = function handler(yargs) {
  /** Get all the options set for `standings` command */
  const standings = yargs;

  const spinner = ora('Fetching data').start();

  const { league } = standings;
  const outData = {
    json: standings.json,
    csv: standings.csv,
    dir: standings.dir
  };

  if (leagueIds[league] === undefined) {
    spinner.stop();
    updateMessage('LEAGUE_ERR');
  }

  const { id } = leagueIds[league];

  footballRequest(`competitions/${id}/standings`, (err, res, body) => {
    spinner.stop();
    if (err || res.statusCode !== 200) {
      updateMessage('REQ_ERROR');
    } else {
      buildAndPrintStandings(body, outData);
    }
  });
};
