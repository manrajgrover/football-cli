const ora = require('ora');
const moment = require('moment');
const request = require('request');
const URLS = require('../constants');
const config = require('../config');
const helpers = require('../helpers');

const scoresHelper = helpers.scoresHelper;
const updateMessage = helpers.updateMessage;

const footballRequest = request.defaults({
  baseUrl: URLS.API_URL,
  headers: {
    'X-Auth-Token': config.API_KEY,
  },
});

exports.command = 'scores';
exports.desc = 'Get scores of past and live fixtures';
exports.builder = function builder(yargs) {
  return yargs
    .usage('Usage: $0 scores [options]')
    .alias('l', 'live')
        .describe('l', 'Live scores')
        .boolean('l')
    .alias('t', 'team')
        .describe('t', 'Select team')
        .string('t')
    .options({
      json: {
        desc: 'Output results as JSON file.',
        type: 'string',
      },
      csv: {
        desc: 'Output results as CSV file.',
        type: 'string',
      }
    })
    .example('$0 scores -t "Manchester United" -l')
    .argv;
};
exports.handler = function handler(yargs) {
    /**
     * Get all the options set for `scores` command
     */
  const scores = yargs;

  const outData = {
    json: (scores.json === undefined) ? undefined : scores.json,
    csv: (scores.csv === undefined) ? undefined : scores.csv
  };

  const spinner = ora('Fetching data').start();
  const team = (scores.t === undefined) ? '' : (scores.t).toLowerCase();

  /**
   * timeFrameStart Set start date from which fixtures is to be fetch
   * timeFrameEnd   Set end date till which fixtures is to be fetch
   * End Point for fetching all fixtures between `timeFrameStart` and `timeFrameEnd`
   */

  const timeFrameStart = moment().subtract(1, 'days').format('YYYY-MM-DD');
  const timeFrameEnd = moment().add(1, 'days').format('YYYY-MM-DD');
  const url = `fixtures?timeFrameStart=${timeFrameStart}&timeFrameEnd=${timeFrameEnd}`;
  /**
   * Creates request to fetch fixtures and show them
   * @param  {String} url:     End point from where data to be fetched
   * @return {None}            None
   */

  footballRequest(url, (err, res, body) => {
    spinner.stop();
    if (err) {
      updateMessage('REQ_ERROR');
    } else {
      scoresHelper(scores.l, team, body, outData);
    }
  });
};
