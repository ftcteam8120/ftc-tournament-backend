import { Request, Response, Router } from 'express';
import { OK, getStatusText } from 'http-status-codes';
import { ModelType, InstanceType, Ref } from 'typegoose';
import { success, badRequest, notFound } from '../../utils/responders';
import { User, UserModel, cleanUserRef } from '../../models/User';
import { Team, TeamModel } from '../../models/Team';
import { Event, EventModel } from '../../models/Event';
import { Types } from 'mongoose';

export let event = Router();

event.get('/', (req: Request, res: Response) => {
  return EventModel.find().then((events: InstanceType<Event>[]) => {
    success(req, res, events);
  });
});

event.get('/:id', (req: Request, res: Response) => {
  let promise = EventModel.findFor(req.params.id);
  if (req.body.populate || req.query.populate) {
    promise.populate('admins').populate('teams');
  }
  return promise.then((event: InstanceType<Event>) => {
    if (!event) {
      notFound(req, res);
    } else {
      if (req.body.populate || req.query.populate) {
        // Clean event members and coaches if populated
        for (var i = 0; i < event.admins.length; i++) {
          (event.admins[i] as any) = cleanUserRef(event.admins[i]).toJSON();
        }
      }
      success(req, res, event);
    }
  });
});

function createEvent(req, res, admins, teams) {
  if (!req.body.name) {
    return badRequest(req, res, [
      'name'
    ]);
  }
  let start;
  let end;
  if (req.body.start) {
    try {
      start = new Date(req.body.start);
    } catch {
      return badRequest(req, res, [], { error: 'Invalid date format for start date' });
    }
  }
  if (req.body.end) {
    try {
      end = new Date(req.body.end);
    } catch {
      return badRequest(req, res, [], { error: 'Invalid date format for end date' });
    }
  }
  let newEvent = new EventModel({
    admins,
    teams,
    current_round: 0,
    name: req.body.name,
    location: req.body.location,
    start,
    end,
    logo_url: req.body.logo_url,
    primary_color: req.body.primary_color,
    secondary_color: req.body.secondary_color
  })
  return newEvent.save().then(() => {
    success(req, res, newEvent.toJSON());
  });
}

event.post('/', (req: Request, res: Response) => {
  let admins = [req.user._id];
  if (req.body.admins) {
    admins = req.body.admins;
  }
  let teams = [];
  if (req.body.teams) {
    // Lookup teams by shortid, ObjectId, or team number
    let promises: Promise<InstanceType<Team>>[] = [];
    for (var i = 0; i < req.body.teams.length; i++) {
      promises.push(TeamModel.findFor(req.body.teams[i]).then((team) => {
        return team;
      }));
    }
    return Promise.all(promises).then((teamResults: InstanceType<Team>[]) => {
      for (var i = 0; i < teamResults.length; i++) {
        teams.push(teamResults[i]._id);
      }
      return createEvent(req, res, admins, teams);
    });
  } else {
    return createEvent(req, res, admins, teams);
  }
});

event.patch('/:id', (req: Request, res: Response) => {
  return EventModel.findFor(req.params.id).then((event: InstanceType<Event>) => {
    if (!event) {
      badRequest(req, res);
    } else {
      for (var key in req.body) {
        if (req.body[key]) {
          switch (key) {
            case 'start':
              event[key] = new Date(req.body[key]);
              break;
            case 'end':
              event[key] = new Date(req.body[key]);
              break;
            case 'current_round':
            event[key] = Number(req.body[key]);
              break;
            default:
              event[key] = req.body[key];
          }
        }
      }
      return event.save().then(() => {
        success(req, res, event);
      });
    }
  });
});