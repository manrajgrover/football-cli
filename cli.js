#!/usr/bin/env node

'use strict';

const yargs = require('yargs');

/**
 * Command line interface code for the app
 */
const argv = yargs
  .usage('$0 <command>')
<<<<<<< HEAD
  .command('scores', 'Get scores of past and live fixtures', (yargsScores) => {
    /**
     * Get all the options set for `scores` command
     */
    const scores = yargsScores
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

    const spinner = ora('Fetching data').start();

    const team = (scores.t === undefined) ? '' : (scores.t).toLowerCase();
    const outData = {
      json: (scores.json === undefined) ? undefined : scores.json,
      csv: (scores.csv === undefined) ? undefined : scores.csv
    };

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
  })
  .command('fixtures', 'Get upcoming and past fixtures of a league and team', (yargsFixtures) => {
    /**
     * Get all the options set for `fixtures` command
     */
    const fixtures = yargsFixtures
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
        }
      })
      .example('$0 fixtures -l PL -d 5 -t "Manchester United" -n')
      .argv;

    const spinner = ora('Fetching data').start();
    const outData = {
      json: (fixtures.json === undefined) ? undefined : fixtures.json,
      csv: (fixtures.csv === undefined) ? undefined : fixtures.csv
    };

    /**
     * days   Number of days for which data needs to be fetched
     * league League code for which data needs to be fetched
     * team   Team for which fixtures is requested
     * time   Past or present depending on flag `n` set
     */
    const days = fixtures.d || 10;
    const league = fixtures.l;
    const team = fixtures.t || '';
    const time = (fixtures.n === true) ? 'n' : 'p';

    if (days < 0) {
      updateMessage('FIX_INPUT_ERR');
    }

    /**
     * timeFrame Combination of `time` and `days` as per API requirements
     * @type {String}
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
          fixturesHelper(league, name, team, body, outData);
        }
      });
    } else {
      footballRequest(`fixtures?timeFrame=${timeFrame}`, (err, res, body) => {
        spinner.stop();

        if (err) {
          updateMessage('REQ_ERROR');
        } else {
          fixturesHelper(league, undefined, team, body, outData);
        }
      });
    }
  })
  .command('standings', 'Get standings of particular league', (yargsStandings) => {
    /**
     * Get all the options set for `standings` command
     */
    const standings = yargsStandings
      .usage('Usage: $0 standings [options]')
      .alias('l', 'league')
        .describe('l', 'League to be searched')
        .demand('l')
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
      .example('$0 standings -l PL')
      .argv;

    const spinner = ora('Fetching data').start();

    const league = standings.l;
    const outData = {
      json: (standings.json === undefined) ? undefined : standings.json,
      csv: (standings.csv === undefined) ? undefined : standings.csv
    };

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
        standingsHelper(body, outData);
      }
    });
  })
  .command('lists', 'List of codes of various competitions', (yargsLists) => {
    /**
     * Get all the options set for `lists` command
     */
    const lists = yargsLists
      .usage('Usage: sudo $0 lists [options]')
      .alias('r', 'refresh')
        .describe('r', 'Refresh league ids')
        .boolean('r')
      .example('sudo $0 lists -r')
      .argv;

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
  })
  .command('config', 'Change configuration and defaults', (yargsConfig) => {
    /**
     * Get all the options set for `config` command
     */
    const configs = yargsConfig
      .usage('Usage: sudo $0 config')
      .example('sudo $0 config')
      .argv;

    if (configs.h) {
      return;
    }

    const questions = [{
      type: 'input',
      name: 'API_KEY',
      message: 'Enter API KEY <leave blank in case unchanged>',
    }];

    inquirer.prompt(questions).then((answers) => {
      const obj = config;

      if (answers.API_KEY !== '') {
        obj.API_KEY = answers.API_KEY;
      }

      fs.writeFileSync(path.resolve(__dirname, 'config.json'), JSON.stringify(obj, null, 2), 'utf8');
      updateMessage('UPDATE', 'API KEY has been updated.');
    }).catch((err) => {
      updateMessage('CUSTOM_ERR', 'Please run the following command with root access');
    });
  })
=======
  .commandDir('cmds')
>>>>>>> 983b164087583b018d4fa25f39306dfadbcee222
  .help('h')
  .alias('h', 'help')
  .version()
  .argv;
