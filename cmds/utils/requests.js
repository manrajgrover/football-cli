const request = require('request');
const config = require('../../config');
const constants = require('../../constants');

const footballRequest = request.defaults({
  baseUrl: constants.API_URL,
  headers: {
    'X-Auth-Token': config.API_KEY
  }
});

module.exports = {
  footballRequest
};
