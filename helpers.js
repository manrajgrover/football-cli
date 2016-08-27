/*
* @Author: Manraj Singh
* @Date:   2016-08-27 20:49:04
* @Last Modified by:   Manraj Singh
* @Last Modified time: 2016-08-27 20:58:44
*/

'use strict';

const league_ids = require('./league_ids')
const API_URL = 'http://api.football-data.org/v1/';
const Table = require('cli-table');

module.exports.getURL = (endPoint) => {
  return API_URL + endPoint;
}

module.exports.standings = (body) => {
  let data = JSON.parse(body), table;

  if(data["standing"] !== undefined) {
    let standing = data["standing"];

    table = new Table({
      head: ['Rank', 'Team', 'Played', 'Goal Diff', 'Points'],
      colWidths: [ 7, 20, 10, 15, 10]
    });

    for(let i = 0; i < standing.length; i++) {
      let team = standing[i];
      table.push([ team.position, team.teamName, team.playedGames, team.goalDifference, team.points]);
    }

    console.log(table.toString());
  }
  else {
    let standings = data["standings"];

    for(let groupCode in standings) {
      console.log(groupCode);

      let group = standings[groupCode];

      table = new Table({
        head: ['Rank', 'Team', 'Played', 'Goal Diff', 'Points'],
        colWidths: [ 7, 20, 10, 15, 10]
      });

      for(let i = 0; i < group.length; i++) {
        let team = group[i];
        table.push([ team.rank, team.team, team.playedGames, team.goalDifference, team.points]);
      }

      console.log(table.toString());
    }
  }
}

module.exports.refresh = (body) => {
  let data = JSON.parse(body), newLeagueIDs = {};

  for(let i = 0; i < data.length; i++) {
    let comp = data[i];

    newLeagueIDs[comp.league] = {
      "id": comp.id,
      "caption": comp.caption
    };
  }

  return newLeagueIDs;
}
