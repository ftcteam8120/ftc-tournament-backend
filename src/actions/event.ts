import { InstanceType } from 'typegoose';
import { EventModel, Event } from '../models/Event';
import { Team, TeamModel } from '../models/Team';
import actionProcessor from '../utils/actionProcessor';
import { Match } from '../models/Match';
import MatchModel from '../models/Match';

export async function findEventById(id: string) {
  return EventModel.findById(id).then((event: InstanceType<Event>) => {
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

