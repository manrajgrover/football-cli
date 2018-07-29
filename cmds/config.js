const fs = require('fs');
const inquirer = require('inquirer');
const path = require('path');
const config = require('../config');
const helpers = require('./utils/helpers');

const { updateMessage } = helpers;

exports.command = 'config';

exports.desc = 'Change configuration and defaults';

exports.builder = yargs => yargs
  .usage('Usage: sudo $0 config')
  .example('sudo $0 config')
  .argv;

exports.handler = (yargs) => {
  /**  Get all the options set for `config` command */
  const configs = yargs;

  if (configs.help) {
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

    fs.writeFileSync(path.resolve(__dirname, '../config.json'), JSON.stringify(obj, null, 2), 'utf8');
    updateMessage('UPDATE', 'API KEY has been updated.');
  }).catch((err) => {
    updateMessage('CUSTOM_ERR', 'Please run the following command with root access');
  });
};
