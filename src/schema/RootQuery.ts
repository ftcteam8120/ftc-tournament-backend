import {
  findEventById,
  findEvents,
  findTeamById,
  findTeams,
  findEventsForAdmin
} from '../actions';

export const rootQuery = `
  type Query {
    event(id: String!): Event
    findEventsForAdmin(admin: String!): [Event]
    team(id: String!): Team
    events: [Event]
    teams: [Team]
  }
`;

export const rootQueryResolvers = {
  async event(baseObj, { id }) {
    return await findEventById(id);
  },
  async team(baseObj, { id }) {
    return await findTeamById(id);
  },
  async events() {
    return await findEvents();
  },
  async findEventsForAdmin(baseObj, { admin }) {
    return await findEventsForAdmin(admin);
  },
  async teams() {
    return await findTeams();
  }
};
