const ora = require('ora');
const request = require('request');
const URLS = require('../constants');
const config = require('../config');
const helpers = require('../helpers');
const leagueIds = require('../leagueIds');

const buildAndPrintFixtures = helpers.buildAndPrintFixtures;
const updateMessage = helpers.updateMessage;

const footballRequest = request.defaults({
  baseUrl: URLS.API_URL,
  headers: {
    'X-Auth-Token': config.API_KEY,
  },
});

exports.command = 'fixtures';
exports.desc = 'Get upcoming and past fixtures of a league and team';

exports.builder = function builder(yargs) {
  return yargs
    .usage('Usage: $0 fixtures [options]')
    .alias('d', 'days')
        .describe('d', 'Number of days from today')
        .number('d')
    .alias('l', 'league')
        .describe('l', 'League')
        .string('l')
    .alias('t', 'team')
        .describe('t', 'Team name or substring of it')
        .string('t')
    .alias('n', 'next')
        .describe('n', 'Next or upcoming matches')
        .boolean('n')
    .options({
      json: {
        desc: 'Output results as JSON file.',
        type: 'string',
      },
      csv: {
        desc: 'Output results as CSV file.',
        type: 'string',
      },
      dir: {
        desc: 'Output directory for files',
        type: 'string'
      }
    })
    .example('$0 fixtures -l PL -d 5 -t "Manchester United" -n')
    .argv;
};

exports.handler = (yargs) => {
  /**
   * Get all the options set for `fixtures` command
   */
  const fixtures = yargs;
  const outData = {
    json: (fixtures.json === undefined) ? undefined : fixtures.json,
    csv: (fixtures.csv === undefined) ? undefined : fixtures.csv,
    dir: (fixtures.dir === undefined) ? undefined : fixtures.dir
  };

  const spinner = ora('Fetching data').start();

  /**
   * @const {!number} days Number of days for which data needs to be fetched
   * @const {?string} league League code for which data needs to be fetched
   * @const {!string} team   Team for which fixtures is requested
   * @const {!string} time   Past or present depending on flag `n` set
   */
  const days = fixtures.d || 10;
  const league = fixtures.l;
  const team = fixtures.t || '';
  const time = (fixtures.n === true) ? 'n' : 'p';
  if (days < 0) {
    updateMessage('FIX_INPUT_ERR');
  }
  /**
   * @const {!string} timeFrame Combination of `time` and `days` as per API requirements
   */
  const timeFrame = `${time}${days}`;

  if (league !== undefined) {
    if (leagueIds[league] === undefined) {
      spinner.stop();
      updateMessage('LEAGUE_ERR');
    }

    const id = leagueIds[league].id;
    const name = leagueIds[league].caption;

    footballRequest(`competitions/${id}/fixtures?timeFrame=${timeFrame}`, (err, res, body) => {
      spinner.stop();
      if (err) {
        updateMessage('REQ_ERROR');
      } else {
        buildAndPrintFixtures(league, name, team, body);
      }
    });
  } else {
    footballRequest(`fixtures?timeFrame=${timeFrame}`, (err, res, body) => {
      spinner.stop();
      if (err) {
        updateMessage('REQ_ERROR');
      } else {
        buildAndPrintFixtures(league, undefined, team, body, outData);
      }
    });
  }
};
