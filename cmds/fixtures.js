const ora = require('ora');

const moment = require('moment');
const helpers = require('./utils/helpers');
const requests = require('./utils/requests');
const leagueIds = require('../leagueIds');

const { buildAndPrintFixtures, updateMessage } = helpers;
const { footballRequest } = requests;

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
    .alias('j', 'json')
    .describe('j', 'JSON output file name')
    .string('j')
    .alias('c', 'csv')
    .describe('c', 'CSV output file name')
    .string('c')
    .alias('o', 'dir')
    .describe('o', 'Output directory for files')
    .string('o')
    .example('$0 fixtures -l PL -d 5 -t "Manchester United" -n').argv;
};

exports.handler = yargs => {
  /** Get all the options set for `fixtures` command */
  const fixtures = yargs;

  const outData = {
    json: fixtures.json,
    csv: fixtures.csv,
    dir: fixtures.dir
  };

  const spinner = ora('Fetching data').start();

  /** @const {!number} days Number of days for which data needs to be fetched */
  const days = fixtures.days || 10;
  /** @const {?string} league League code for which data needs to be fetched */
  const { league } = fixtures;
  /** @const {!string} team Team for which fixtures is requested */
  const team = fixtures.team || '';
  /** @const {!string} time Past or present depending on flag `n` set */
  // const time = fixtures.next === true ? 'n' : 'p';

  if (days < 0) {
    updateMessage('FIX_INPUT_ERR');
  }

  /** @const {!string} timeFrame Combination of `time` and `days` as per API requirements */
  const timeFrame = moment()
    .add(days, 'days')
    .format('YYYY-MM-DD');

  const timeFrameStart = moment()
    .subtract(1, 'days')
    .format('YYYY-MM-DD');

  if (league !== undefined) {
    if (leagueIds[league] === undefined) {
      spinner.stop();
      updateMessage('LEAGUE_ERR');
    }

    const { id } = leagueIds[league];
    const name = leagueIds[league].caption;

    footballRequest(
      `competitions/${id}/matches?dateFrom=${timeFrameStart}&dateTo=${timeFrame}`,
      (err, res, body) => {
        spinner.stop();
        if (err || res.statusCode !== 200) {
          updateMessage('REQ_ERROR');
        } else {
          buildAndPrintFixtures(league, name, team, body, outData);
        }
      }
    );
  } else {
    footballRequest(`matches?dateFrom=${timeFrameStart}&dateTo=${timeFrame}`, (err, res, body) => {
      spinner.stop();
      if (err || res.statusCode !== 200) {
        updateMessage('REQ_ERROR');
      } else {
        buildAndPrintFixtures(league, undefined, team, body, outData);
      }
    });
  }
};
