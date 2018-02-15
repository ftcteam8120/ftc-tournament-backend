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
import * as NodeGeocoder from 'node-geocoder';
import { interpolateFirstEventData } from '../utils/FIRSTActions';
import { TeamId } from '../utils/ids';

const geocoder = NodeGeocoder({
  provider: 'google',
  apiKey: process.env.GEOCODING_API_KEY
})

export async function findEventById(id: string) {
  return EventModel.findById(id).then((event: InstanceType<Event>) => {
    return interpolateFirstEventData(event.code, event);
  });
}

export async function findEventByCode(code: string) {
  return EventModel.findOne({ code }).then((event: InstanceType<Event>) => {
    return interpolateFirstEventData(code, event);
  });
}

export async function findEvents() {
  return EventModel.find().sort({ start: -1 }).then((events: InstanceType<Event>[]) => {
    const promises = [];
    for (let i = 0; i < events.length; i++) {
      promises.push(interpolateFirstEventData(events[i].code, events[i]));
    }
    return Promise.all(promises);
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

function getTeamIdsForMatch(data: any): { red_teams: any, blue_teams: any, red_surrogates: any, blue_surrogates: any } {
  let red_teams = [];
  let blue_teams = [];
  let red_surrogates = [];
  let blue_surrogates = [];
  if (data.blue_alliance) {
    if (data.blue_alliance.teams) {
      for (let i = 0; i < data.blue_alliance.teams.length; i++) {
        blue_teams.push(TeamId(data.blue_alliance.teams[i]));
      }
    }
    if (data.blue_alliance.surrogates) {
      for (let i = 0; i < data.blue_alliance.surrogates.length; i++) {
        blue_surrogates.push(TeamId(data.blue_alliance.surrogates[i]));
      }
    }
  }
  if (data.red_alliance) {
    if (data.red_alliance.teams) {
      for (let i = 0; i < data.red_alliance.teams.length; i++) {
        red_teams.push(TeamId(data.red_alliance.teams[i]));
      }
    }
    if (data.red_alliance.surrogates) {
      for (let i = 0; i < data.red_alliance.surrogates.length; i++) {
        red_surrogates.push(TeamId(data.red_alliance.surrogates[i]));
      }
    }
  }
  return {
    red_teams,
    blue_teams,
    red_surrogates,
    blue_surrogates
  };
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
    event.rankings = [];
    for (let i = 0; i < data.length; i++) {
      event.rankings.push({
        ...data[i],
        team: TeamId(data[i].team)
      });
    }
    return event.save();
  });
}

export async function syncMatchesWithEvent(eventId: string, data: any[]) {
  return EventModel.findById(eventId).then((event: InstanceType<Event>) => {
    if (!event) throw new Error('Event not found');
    let promises = [];
    let update_promises = [];
    let create_promises = [];
    let results = [];
    data.forEach((value) => {
      promises.push(MatchModel.findOne({ event: eventId, number: value.number, type: value.type, sub: value.sub }));
    });
    return Promise.all(promises).then((matches: InstanceType<Match>[]) => {
      for (let i = 0; i < data.length; i++) {
        if (matches[i]) {
          let ids = getTeamIdsForMatch(data[i]);
          matches[i].winner = data[i].winner || matches[i].winner;
          matches[i].red_alliance = {
            ...matches[i].red_alliance,
            ...data[i].red_alliance,
            teams: ids.red_teams,
            surrogates: ids.red_surrogates
          };
          matches[i].blue_alliance = {
            ...matches[i].blue_alliance,
            ...data[i].blue_alliance,
            teams: ids.blue_teams,
            surrogates: ids.blue_surrogates
          };
          update_promises.push(matches[i].save());
        } else {
          let ids = getTeamIdsForMatch(data[i]);
          create_promises.push(new MatchModel({
            number: data[i].number,
            winner: data[i].winner,
            sub: data[i].sub,
            type: data[i].type,
            event: eventId,
            red_alliance: {
              ...data[i].red_alliance,
              teams: ids.red_teams,
              surrogates: ids.red_surrogates
            },
            blue_alliance: {
              ...data[i].blue_alliance,
              teams: ids.blue_teams,
              surrogates: ids.blue_surrogates
            }
          }).save());
        }
      }
      return Promise.all([Promise.all(update_promises), Promise.all(create_promises)]).then((res: InstanceType<Match>[][]) => {
        res[0].concat(res[1]).forEach((value) => {
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

export async function findEventsForTeam(teamId: string) {
  return EventModel.find({ teams: teamId }).then((events: InstanceType<Event>[]) => {
    let results = [];
    for (let i = 0; i < events.length; i++) {
      results.push(actionProcessor(events[i]));
    }
    return results;
  });
}

export async function updateEvent(eventId: string, data: any) {
  return EventModel.findById(eventId).then((event: InstanceType<Event>) => {
    if (!event) throw new Error('Event not found');
    event.name = data.name;
    event.description = data.description;
    event.logo_url = data.logo_url;
    event.start = new Date(data.start);
    event.end = new Date(data.end);
    if (data.location) {
      if (data.location.address) {
        if (!event.location) (event as any).location = {};
        if (data.location.address) {
          event.location.address = data.location.address;
          return geocoder.geocode(data.location.address).then((value) => {
            (event.location as any).coordinates = {
              lat: value[0].latitude,
              lng: value[0].longitude
            };
            return event.save();
          });
        }
      }
    }
    return event.save();
  });
}