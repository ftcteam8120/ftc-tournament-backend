import { Request, Response, Router } from 'express';
import { OK, getStatusText } from 'http-status-codes';
import { ModelType, InstanceType, Ref } from 'typegoose';
import { success, badRequest, notFound } from '../../utils/responders';
import { User, UserModel, cleanUserRef } from '../../models/User';
import { Team, TeamModel } from '../../models/Team';
import { Tournament, TournamentModel } from '../../models/Tournament';
import { Types } from 'mongoose';

export let tournament = Router();

tournament.get('/', (req: Request, res: Response) => {
  return TournamentModel.find().then((tournaments: InstanceType<Tournament>[]) => {
    success(req, res, tournaments);
  });
});

tournament.get('/:id', (req: Request, res: Response) => {
  let promise = TournamentModel.findFor(req.params.id);
  if (req.body.populate || req.query.populate) {
    promise.populate('admins').populate('teams');
  }
  return promise.then((tournament: InstanceType<Tournament>) => {
    if (!tournament) {
      notFound(req, res);
    } else {
      if (req.body.populate || req.query.populate) {
        // Clean tournament members and coaches if populated
        for (var i = 0; i < tournament.admins.length; i++) {
          (tournament.admins[i] as any) = cleanUserRef(tournament.admins[i]).toJSON();
        }
      }
      success(req, res, tournament);
    }
  });
});

function createTournament(req, res, admins, teams) {
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
  let newTournament = new TournamentModel({
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
  return newTournament.save().then(() => {
    success(req, res, newTournament.toJSON());
  });
}

tournament.post('/', (req: Request, res: Response) => {
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
      return createTournament(req, res, admins, teams);
    });
  } else {
    return createTournament(req, res, admins, teams);
  }
});

tournament.patch('/:id', (req: Request, res: Response) => {
  return TournamentModel.findFor(req.params.id).then((tournament: InstanceType<Tournament>) => {
    if (!tournament) {
      badRequest(req, res);
    } else {
      for (var key in req.body) {
        if (req.body[key]) {
          switch (key) {
            case 'start':
              tournament[key] = new Date(req.body[key]);
              break;
            case 'end':
              tournament[key] = new Date(req.body[key]);
              break;
            case 'current_round':
            tournament[key] = Number(req.body[key]);
              break;
            default:
              tournament[key] = req.body[key];
          }
        }
      }
      return tournament.save().then(() => {
        success(req, res, tournament);
      });
    }
  });
});