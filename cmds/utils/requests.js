const request = require('request');
const config = require('../../config');
const URLS = require('../../constants');

const footballRequest = request.defaults({
  baseUrl: URLS.API_URL,
  headers: {
    'X-Auth-Token': config.API_KEY,
  },
});

module.exports = {
  footballRequest
};
