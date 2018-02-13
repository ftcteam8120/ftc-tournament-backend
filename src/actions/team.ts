import { InstanceType } from 'typegoose';
import { Types } from 'mongoose';
import * as shortid from 'shortid';
import * as _ from 'lodash';
import { TeamModel, Team } from '../models/Team';
import actionProcessor from '../utils/actionProcessor';
import { interpolateFirstTeamData } from '../utils/FIRSTActions';

export async function findTeam(id: string) {
  return TeamModel.findById(id).then((team: InstanceType<Team>) => {
    return interpolateFirstTeamData(id, team);
  });
}

export async function findTeamByNumber(number: number) {
  return TeamModel.findOne({ number }).then((team: InstanceType<Team>) => {
    return interpolateFirstTeamData(number, team);
  });
}

export async function findTeams(teams?: any[]) {
  let query;
  if (teams) {
    query = { _id: teams };
  }
  return TeamModel.find(query).then((teamData: InstanceType<Team>[]) => {
    const promises = [];
    for (let i = 0; i < teams.length; i++) {
      promises.push(interpolateFirstTeamData(teams[i], _.find(teamData, { _id: teams[i] })));
    }
    return Promise.all(promises);
  });
}

export async function findTeamsForUser(id: string) {
  return TeamModel.find().or([{ coaches: [id] }, { members: [id] }])
    .then((teams: InstanceType<Team>[]) => {
      const promises = [];
      for (let i = 0; i < teams.length; i++) {
        promises.push(interpolateFirstTeamData(teams[i]._id, teams[i]));
      }
      return Promise.all(promises);
  });
}