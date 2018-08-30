const fs = require('fs');

const getLogger = () => {
  if (process.env.NODE_ENV === 'test') {
    const logs = fs.createWriteStream('/var/log/football-tests.log', { flags: 'w' });
    return log => logs.write(`${log}\n`);
  }
  return console.log;
};

module.exports = {
  getLogger
};
