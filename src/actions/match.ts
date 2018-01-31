import { InstanceType } from 'typegoose';
import { EventModel, Event } from '../models/Event';
import { MatchModel, Match } from '../models/Match';
import actionProcessor from '../utils/actionProcessor';

export async function findMatchesForEvent(eventId) {
  return MatchModel.find({ event: eventId }).sort({ number: 1 }).then((matches: InstanceType<Match>[]) => {
    const matchObjs = [];
    for (let i = 0; i < matches.length; i++) {
      matchObjs.push(actionProcessor(matches[i]));
    }
    return matchObjs;
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