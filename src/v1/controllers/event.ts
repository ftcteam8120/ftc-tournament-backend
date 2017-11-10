import { Request, Response, Router } from 'express';
import { OK, getStatusText } from 'http-status-codes';
import { ModelType, InstanceType, Ref } from 'typegoose';
import { success, badRequest, notFound, serverError } from '../../utils/responders';
import { catcher } from '../../utils/errorHandlers';
import { requireFields } from '../../utils/requireFields';
import { User, UserModel, cleanUserRef } from '../../models/User';
import { Team, TeamModel } from '../../models/Team';
import { Event, EventModel } from '../../models/Event';
import { Match, MatchModel } from '../../models/Match';
import { Types } from 'mongoose';

export let event = Router();

event.get('/', catcher((req: Request, res: Response) => {
  return EventModel.find().then((events: InstanceType<Event>[]) => {
    success(req, res, events);
  });
}));

event.get('/:id', catcher((req: Request, res: Response) => {
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
}));

event.get('/:event_id/match', catcher((req: Request, res: Response) => {
  return MatchModel.find({ event: req.params.event_id }).then((matches: InstanceType<Match>[]) => {
    success(req, res, matches);
  });
}));

function createMatch(eventId, data) {
  return new MatchModel({
    event: eventId,
    type: data.type,
    number: Number(data.number),
    red_alliance: data.red_alliance,
    blue_alliance: data.blue_alliance
  }).save();
}

event.post('/:event_id/match',
  requireFields(['type', 'number', 'red_alliance.teams', 'blue_alliance.teams'], 'matches'),
  catcher((req: Request, res: Response) => {
  return EventModel.findFor(req.params.event_id).then((event: InstanceType<Event>) => {
    if (!event) return badRequest(req, res, [], { error: 'Cannot create a match in a nonexisting event' });
    if (req.body.matches) {
      let promises = [];
      if ((typeof req.body.matches as any) === 'array') {
        for (var i = 0; i < req.body.matches.lenght; i++) {
          promises.push(createMatch(event._id, req.body.matches[i]));
        }
        return Promise.all(promises).then((matches: InstanceType<Match>[]) => {
          success(req, res, matches);
        });
      }
    } else {
      return createMatch(event._id, req.body).then((match: InstanceType<Match>) => {
        success(req, res, match);
      });
    }
  });
}));

event.get('/:event_id/match/:match_id', (req: Request, res: Response) => {
  return MatchModel.findById(req.params.match_id).then((match: InstanceType<Match>) => {
    success(req, res, match);
  });
});

function createEvent(req, res, admins, teams) {
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

event.post('/', requireFields(['name']), catcher((req: Request, res: Response) => {
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
}));

event.patch('/:id', catcher((req: Request, res: Response) => {
  return EventModel.findFor(req.params.id).then((event: InstanceType<Event>) => {
    if (!event) {
      notFound(req, res);
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
}));