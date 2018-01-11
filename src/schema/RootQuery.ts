import {
  findEventById,
  findEvents,
  findTeamById,
  findTeams
} from '../actions';

export const rootQuery = `
  type Query {
    event(id: String!): Event
    team(id: String!): Team
    events: [Event]
    teams: [Team]
  }
`;

export const rootQueryResolvers = {
  async event(baseObj, { id }) {
    return await findEventById(id);
  },
  async team({ id }) {
    return await findTeamById(id);
  },
  async events() {
    return await findEvents();
  },
  async teams() {
    return await findTeams();
  }
};
