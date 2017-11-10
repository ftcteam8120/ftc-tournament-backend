import { Request, Response, Router } from 'express';
import { OK, getStatusText } from 'http-status-codes';
import { ModelType, InstanceType, Ref } from 'typegoose';
import { success, badRequest, notFound } from '../../utils/responders';
import { catcher } from '../../utils/errorHandlers';
import { requireFields } from '../../utils/requireFields';
import { User, UserModel, cleanUserRef } from '../../models/User';
import { Team, TeamModel } from '../../models/Team';
import { Types } from 'mongoose';

export let team = Router();

team.get('/', catcher((req: Request, res: Response) => {
  return TeamModel.find().then((teams: InstanceType<Team>[]) => {
    success(req, res, teams);
  });
}));

team.get('/:id', catcher((req: Request, res: Response) => {
  let promise = TeamModel.findFor(req.params.id);
  if (req.body.populate || req.query.populate) {
    promise.populate('coaches').populate('members');
  }
  return promise.then((team: InstanceType<Team>) => {
    if (!team) {
      notFound(req, res);
    } else {
      if (req.body.populate || req.query.populate) {
        // Clean team members and coaches if populated
        for (var i = 0; i < team.coaches.length; i++) {
          (team.coaches[i] as any) = cleanUserRef(team.coaches[i]).toJSON();
        }
        for (var i = 0; i < team.members.length; i++) {
          (team.members[i] as any) = cleanUserRef(team.members[i]).toJSON();
        }
      }
      success(req, res, team);
    }
  });
}));

function createTeam(data) {
  let coaches = [];
  if (data.coaches) {
    coaches = data.coaches;
  }
  let members = [];
  if (data.members) {
    members = data.members;
  }
  return new TeamModel({
    name: data.name,
    number: Number(data.number),
    biography: data.biography,
    location: data.location,
    photo_url: data.photo_url,
    coaches,
    members
  }).save();
}

team.post('/', requireFields(['name', 'number'], 'teams'), catcher((req: Request, res: Response) => {
  if (req.body.teams) {
    let promises = [];
    for (var i = 0; i < req.body.teams.length; i++) {
      promises.push(createTeam(req.body.teams[i]));
    }
    return Promise.all(promises).then((teams: InstanceType<Team>[]) => {
      success(req, res, teams);
    });
  } else {
    if (!req.body.admins) req.body.admins = [req.user._id];
    return createTeam(req.body).then((team: InstanceType<Team>) => {
      success(req, res, team);
    });
  }
}));

team.patch('/:id', catcher((req: Request, res: Response) => {
  return TeamModel.findFor(req.params.id).then((team: InstanceType<Team>) => {
    if (!team) {
      badRequest(req, res);
    } else {
      for (var key in req.body) {
        if (req.body[key]) {
          switch (key) {
            case 'number':
              team[key] = Number(req.body[key]);
              break;
            default:
              team[key] = req.body[key];
          }
        }
      }
      return team.save().then(() => {
        success(req, res, team);
      });
    }
  });
}));