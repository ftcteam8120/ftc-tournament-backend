import { InstanceType } from 'typegoose';
import { Types } from 'mongoose';
import * as shortid from 'shortid';
import { TeamModel, Team } from '../models/Team';
import actionProcessor from '../utils/actionProcessor';

export async function findTeam(id: string | number) {
  let query;
  if ((typeof id) === 'number') {
    query = { number: id };
  } else {
    if (Types.ObjectId.isValid(id)) {
      query = { _id: id };
    } else if (shortid.isValid(id)) {
      query = { shortid: id };
    } else {
      return Promise.reject(new Error('Invalid Team ID'));
    }
  }
  return TeamModel.findOne(query).then((team: InstanceType<Team>) => {
    return actionProcessor(team);
  });
}

export async function findTeams(teams?: any[]) {
  let query;
  if (teams) {
    query = { _id: teams };
  }
  return TeamModel.find(query).then((teams: InstanceType<Team>[]) => {
    const teamObjs = [];
    for (let i = 0; i < teams.length; i++) {
      teamObjs.push(actionProcessor(teams[i]));
    }
    return teamObjs;
  });
}

export async function findTeamsForUser(id: string) {
  return TeamModel.find({ coaches: [id], members: [id] })
    .then((teams: InstanceType<Team>[]) => {
    const teamObjs = [];
    for (let i = 0; i < teams.length; i++) {
      teamObjs.push(actionProcessor(teams[i]));
    }
    return teamObjs;
  });
}