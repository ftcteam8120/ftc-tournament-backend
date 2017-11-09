import { Request, Response, Router } from 'express';
import { OK, getStatusText } from 'http-status-codes';
import { ModelType, InstanceType, Ref } from 'typegoose';
import { success, badRequest, notFound } from '../../utils/responders';
import { User, UserModel, cleanUserRef } from '../../models/User';
import { Team, TeamModel } from '../../models/Team';
import { Types } from 'mongoose';

export let team = Router();

team.get('/', (req: Request, res: Response) => {
  return TeamModel.find().then((teams: InstanceType<Team>[]) => {
    success(req, res, teams);
  });
});

team.get('/:id', (req: Request, res: Response) => {
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
});

team.post('/', (req: Request, res: Response) => {
  let coaches = [req.user._id];
  if (req.body.coaches) {
    coaches.concat(req.body.coaches);
  }
  let members = [];
  if (req.body.members) {
    members = req.body.members;
  }
  if (!req.body.name || !req.body.number) {
    return badRequest(req, res, [
      'name',
      'number'
    ]);
  }
  let newTeam = new TeamModel({
    name: req.body.name,
    number: Number(req.body.number),
    biography: req.body.biography,
    location: req.body.location,
    photo_url: req.body.photo_url,
    coaches,
    members
  })
  return newTeam.save().then(() => {
    success(req, res, newTeam.toJSON());
  });
});

team.patch('/:id', (req: Request, res: Response) => {
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
});