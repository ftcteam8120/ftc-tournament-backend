import { InstanceType } from 'typegoose';
import { EventModel, Event } from '../models/Event';
import { MatchModel, Match, Winner } from '../models/Match';
import { findTeam } from './';
import { Order } from '../schema/typeDefs';
import actionProcessor from '../utils/actionProcessor';

async function getTeamQuery(query) {
  if (query.team) {
    return findTeam(query.team).then((team) => {
      return {
        $or: [
          { 'blue_alliance.teams': team.id },
          { 'red_alliance.teams': team.id }
        ]
      }
    }).catch(() => {
      throw new Error('Team Not Found');
    });
  } else {
    return Promise.resolve(null);
  }
}

export async function findMatchesForEvent(eventId: string, query: { type?: string, winner?: string, team?: string, orderBy: any }) {
  return getTeamQuery(query).then((teamQuery) => {
    delete query.team;
    let order = query.orderBy;
    let sort;
    if (order) {
      sort = {};
      delete query.orderBy;
      Object.keys(order).forEach((key) => {
        if (order[key] === Order.ASC) {
          sort[key] = 1;
        } else {
          sort[key] = -1;
        }
      });
    } else {
      sort = { number: 1, sub: 1 };
    }
    let q = { event: eventId, ...query, ...teamQuery };
    return MatchModel.find(q).sort(sort).then((matches: InstanceType<Match>[]) => {
      const matchObjs = [];
      for (let i = 0; i < matches.length; i++) {
        matchObjs.push(actionProcessor(matches[i]));
      }
      return matchObjs;
    });
  });
}

export async function addMatchToEvent(eventId: string, matchData: Match) {
  return EventModel.findById(eventId).then((event: InstanceType<Event>) => {
    if (!event) throw new Error('Event not found');
    matchData.event = eventId;
    return new MatchModel(matchData).save();
  });
}

export async function updateMatchScores(eventId: string, matchNumber: number, matchData: Match) {
  return EventModel.findById(eventId).then((event: InstanceType<Event>) => {
    if (!event) throw new Error('Event not found');
    return MatchModel.findOne({ event: event._id, number: matchNumber }).then((match: InstanceType<Match>) => {
      if (!match) throw new Error('Match not found');
      const updatedMatch = Object.assign(match, matchData);
      return updatedMatch.save();
    });
  });
}

export async function findWinningAllianceForMatch(baseObj: any) {
  switch (baseObj.winner) {
    case Winner.BLUE:
      return baseObj.blue_alliance;
    case Winner.RED:
      return baseObj.red_alliance;
    default:
      return null;  
  }
}