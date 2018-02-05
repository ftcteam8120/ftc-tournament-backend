import { InstanceType } from 'typegoose';
import { Types } from 'mongoose';
import { EventModel, Event } from '../models/Event';
import { Team, TeamModel } from '../models/Team';
import actionProcessor from '../utils/actionProcessor';
import { Match, MatchType } from '../models/Match';
import MatchModel from '../models/Match';
import { Order } from '../schema/typeDefs';
import * as shortid from 'shortid';
import * as _ from 'lodash';

export async function findEventById(id: string) {
  let query;
  if (Types.ObjectId.isValid(id)) {
    query = { _id: id };
  } else if (shortid.isValid(id)) {
    query = { shortid: id };
  } else {
    throw new Error('Invalid Event ID');
  }
  return EventModel.findOne(query).then((event: InstanceType<Event>) => {
    return actionProcessor(event);
  });
}

export async function findEvents() {
  return EventModel.find().then((events: InstanceType<Event>[]) => {
    const eventObjs = [];
    for (let i = 0; i < events.length; i++) {
      eventObjs.push(actionProcessor(events[i]));
    }
    return eventObjs;
  });
}

export async function createEvent(event: Event) {
  return new EventModel(event).save();
}

export async function addTeamToEvent(eventId: string, teamData: Team) {
  return EventModel.findById(eventId).then((event: InstanceType<Event>) => {
    return TeamModel.findOne({ number: teamData.number }).then((team: InstanceType<Team>) => {
      if (team) {
        event.teams.push(team._id);
        return event.save();
      } else {
        return new TeamModel(teamData).save().then((newTeam: InstanceType<Team>) => {
          console.log('Creating new placeholder team');
          event.teams.push(newTeam._id);
          return event.save();
        });
      }
    });
  });
}

export async function syncTeamsWithEvent(eventId: string, data: any[]) {
  return EventModel.findById(eventId).then((event: InstanceType<Event>) => {
    if (!event) throw new Error('Event not found');
    let promises = [];
    let newTeamPromises = [];
    let teamResults = [];
    data.forEach(team => {
      promises.push(TeamModel.findOne({ number: team.number }));
    });
    return Promise.all(promises).then((teams: InstanceType<Team>[]) => {
      for (let i = 0; i < data.length; i++) {
        if (teams[i]) {
          if (event.teams.indexOf(teams[i]._id) === -1)
            event.teams.push(teams[i]._id);
          teamResults.push(actionProcessor(teams[i]));
        } else {
          newTeamPromises.push(new TeamModel(data[i]).save());
        }
      }
      return Promise.all(newTeamPromises).then((newTeams: InstanceType<Team>[]) => {
        newTeams.forEach((value) => {
          if (event.teams.indexOf(value._id) === -1)
            event.teams.push(value._id);
          teamResults.push(actionProcessor(value));
        });
      }).then(() => {
        return event.save().then(() => {
          return teamResults;
        });
      });
    });
  });
}

async function getTeamIdForNumber(number: number): Promise<string> {
  return TeamModel.findOne({ number }).then((team: InstanceType<Team>) => {
    if (!team) return null;
    return team._id;
  });
}

async function getTeamIdsForMatch(data: any): Promise<{ red_teams: any, blue_teams: any }> {
  let blue_teams = [];
  let blue_promises = [];
  let red_teams = [];
  let red_promises = [];
  if (data.blue_alliance) {
    if (data.blue_alliance.teams) {
      for (let i = 0; i < data.blue_alliance.teams.length; i++) {
        blue_promises.push(getTeamIdForNumber(data.blue_alliance.teams[i]));
      }
    }
  }
  if (data.red_alliance) {
    if (data.red_alliance.teams) {
      for (let i = 0; i < data.red_alliance.teams.length; i++) {
        red_promises.push(getTeamIdForNumber(data.red_alliance.teams[i]));
      }
    }
  }
  let blue = Promise.all(blue_promises);
  let red = Promise.all(red_promises);
  return Promise.all([blue, red]).then((results: string[][]) => {
    blue_teams = results[0];
    red_teams = results[1];
    return {
      red_teams,
      blue_teams
    };
  });
}

/*export async function syncMatchesWithEvent(eventId: string, data: any[]) {
  return EventModel.findById(eventId).then((event: InstanceType<Event>) => {
    if (!event) throw new Error('Event not found');
    let promises = [];
    let update_promises = [];
    data.forEach((value) => {
      promises.push(MatchModel.findOne({ event: eventId, number: value.number }));
    });
    return Promise.all(promises).then((matches: InstanceType<Match>[]) => {
      for (let i = 0; i < data.length; i++) {
        if (matches[i]) {
          update_promises.push(getTeamIdsForMatch(data[i]).then((ids) => {
            if (!matches[i].red_alliance) (matches[i] as any).red_alliance = {};
            matches[i].red_alliance.teams = ids.red_teams;
            if (!matches[i].blue_alliance) (matches[i] as any).blue_alliance = {};
            matches[i].blue_alliance.teams = ids.blue_teams;
            return matches[i].save();
          }));
        } else {
          update_promises.push(getTeamIdsForMatch(data[i]).then((ids) => {
            return new MatchModel({
              number: data[i].number,
              type: MatchType.QUALIFYING,
              event: eventId,
              red_alliance: {
                teams: ids.red_teams
              },
              blue_alliance: {
                teams: ids.blue_teams
              }
            }).save();
          }));
        }
      }
      return Promise.all(update_promises).then((matches: InstanceType<Match>[]) => {
        let matchResults = [];
        matches.forEach((value) => {
          matchResults.push(actionProcessor(value));
        });
        return matchResults;
      });
    });
  });
}*/

export async function syncRankingsWithEvent(eventId: string, data: any[]) {
  return EventModel.findById(eventId).then((event: InstanceType<Event>) => {
    if (!event) throw new Error('Event not found');
    let promises = [];
    for (let i = 0; i < data.length; i++) {
      promises.push(getTeamIdForNumber(data[i].team));
    }
    return Promise.all(promises).then((ids: string[]) => {
      event.rankings = [];
      for (let i = 0; i < data.length; i++) {
        event.rankings.push({
          ...data[i],
          team: ids[i]
        });
      }
      return event.save();
    });
  });
}

export async function syncMatchesWithEvent(eventId: string, data: any[]) {
  return EventModel.findById(eventId).then((event: InstanceType<Event>) => {
    if (!event) throw new Error('Event not found');
    let promises = [];
    let update_promises = [];
    let results = [];
    data.forEach((value) => {
      promises.push(MatchModel.findOne({ event: eventId, number: value.number, type: value.type, sub: value.sub }));
    });
    return Promise.all(promises).then((matches: InstanceType<Match>[]) => {
      for (let i = 0; i < data.length; i++) {
        if (matches[i]) {
          update_promises.push(getTeamIdsForMatch(data[i]).then((ids) => {
            matches[i].winner = data[i].winner || matches[i].winner;
            matches[i].red_alliance = {
              ...matches[i].red_alliance,
              ...data[i].red_alliance,
              teams: ids.red_teams
            };
            matches[i].blue_alliance = {
              ...matches[i].blue_alliance,
              ...data[i].blue_alliance,
              teams: ids.blue_teams
            };
            return matches[i].save();
          }));
        } else {
          update_promises.push(getTeamIdsForMatch(data[i]).then((ids) => {
            return new MatchModel({
              number: data[i].number,
              winner: data[i].winner,
              sub: data[i].sub,
              type: data[i].type,
              event: eventId,
              red_alliance: {
                ...data[i].red_alliance,
                teams: ids.red_teams
              },
              blue_alliance: {
                ...data[i].blue_alliance,
                teams: ids.blue_teams
              }
            }).save();
          }));
        }
      }
      return Promise.all(update_promises).then((updatedMatches: InstanceType<Match>[]) => {
        updatedMatches.forEach((value) => {
          results.push(actionProcessor(value));
        });
        return results;
      });
    });
  });
}

export async function findEventsForAdmin(adminId: string) {
  return EventModel.find({ admins: adminId }).then((events: InstanceType<Event>[]) => {
    let results = [];
    for (let i = 0; i < events.length; i++) {
      results.push(actionProcessor(events[i]));
    }
    return results;
  });
}

function sortRankingsAsc(a, b) {
  if (a.last_nom < b.last_nom)
      return -1;
    if (a.last_nom > b.last_nom)
      return 1;
    return 0;
}

export function sortRankings(baseObj, orderBy) {
  let iteratees = [];
  let orders = [];
  if (orderBy) {
    Object.keys(orderBy).forEach((key) => {
      if (orderBy[key]) {
        iteratees.push(key);
        if (orderBy[key] === Order.DESC) {
          orders.push('desc');
        } else {
          orders.push('asc');
        }
      }
    });
    return _.orderBy(baseObj.rankings, iteratees, orders);
  } else {
    return _.orderBy(baseObj.rankings, ['rank'], ['asc']);
  }
}