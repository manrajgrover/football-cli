#!/usr/bin/env node

'use strict';

const yargs = require('yargs');

/**
 * Command line interface code for the app
 */
const argv = yargs
  .usage('$0 <command>')
  .commandDir('cmds')
  .help('h')
  .alias('h', 'help')
  .version()
  .argv;
