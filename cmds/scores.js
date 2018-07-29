const ora = require('ora');
const moment = require('moment');

const helpers = require('./utils/helpers');
const requests = require('./utils/requests');

const { buildAndPrintScores, updateMessage } = helpers;
const { footballRequest } = requests;

exports.command = 'scores';

exports.desc = 'Get scores of past and live fixtures';

exports.builder = yargs => yargs
  .usage('Usage: $0 scores [options]')
  .alias('l', 'live')
  .describe('l', 'Live scores')
  .boolean('l')
  .alias('t', 'team')
  .describe('t', 'Select team')
  .string('t')
  .alias('j', 'json')
  .describe('j', 'Output results as JSON file')
  .string('j')
  .alias('c', 'csv')
  .describe('c', 'Output results as CSV file')
  .string('c')
  .alias('o', 'dir')
  .describe('o', 'Output directory for files')
  .string('o')
  .example('$0 scores -t "Manchester United" -l')
  .argv;

exports.handler = (yargs) => {
  /** Get all the options set for `scores` command */
  const scores = yargs;

  const outData = {
    json: scores.json,
    csv: scores.csv,
    dir: scores.dir
  };

  const spinner = ora('Fetching data').start();
  const team = (scores.team === undefined) ? '' : (scores.team).toLowerCase();

  /**
   * @const {!string} timeFrameStart Set start date from which fixtures is to be fetch
   */
  const timeFrameStart = moment().subtract(1, 'days').format('YYYY-MM-DD');
  /**
   * @const {!string} timeFrameEnd Set end date till which fixtures is to be fetch
   */
  const timeFrameEnd = moment().add(1, 'days').format('YYYY-MM-DD');
  /**
   * @const {!string} url End Point for fetching all fixtures between `timeFrameStart`
   *                      and `timeFrameEnd`
   */
  const url = `fixtures?timeFrameStart=${timeFrameStart}&timeFrameEnd=${timeFrameEnd}`;

  /** Creates request to fetch fixtures and show them */
  footballRequest(url, (err, res, body) => {
    spinner.stop();
    if (err || res.statusCode !== 200) {
      updateMessage('REQ_ERROR');
    } else {
      buildAndPrintScores(scores.live, team, body, outData);
    }
  });
};
