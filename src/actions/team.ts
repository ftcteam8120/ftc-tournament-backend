import { InstanceType } from 'typegoose';
import { TeamModel, Team } from '../models/Team';
import actionProcessor from '../utils/actionProcessor';

export async function findTeamById(id: string) {
  return TeamModel.findById(id).then((team: InstanceType<Team>) => {
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