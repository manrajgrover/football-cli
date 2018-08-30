/* eslint-env jest */

const fs = require('fs');
const syncExec = require('sync-exec');
const commandExistsSync = require('command-exists').sync;

const COMMAND = 'football';

beforeEach(() => {
  if (!commandExistsSync(COMMAND)) {
    throw new Error(`Command "${COMMAND}" command not found`);
  }
});

describe('football lists', () => {
  it('should show lists', () => {
    syncExec('football lists');
  });
});
