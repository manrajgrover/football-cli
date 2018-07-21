#!/usr/bin/env node

'use strict';

const yargs = require('yargs');

/**
 * Command line interface code for the app
 */
// eslint-disable-next-line prefer-destructuring
const argv = yargs
  .usage('$0 <command>')
  .commandDir('cmds')
  .help('h')
  .alias('h', 'help')
  .version()
  .argv;
