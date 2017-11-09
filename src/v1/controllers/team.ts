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
  let promise = TeamModel.findByShortId(req.params.id);
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
    for (var id in req.body.coaches) {
      coaches.push(id);
    }
  }
  let members = [];
  if (req.body.members) {
    for (var id in req.body.members) {
      members.push(id);
    }
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