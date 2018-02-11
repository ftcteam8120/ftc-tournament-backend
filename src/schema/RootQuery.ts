import {
  findEventById,
  findEvents,
  findTeam,
  findTeams,
  findEventsForAdmin,
  findMatchById,
  findUserById
} from '../actions';

import { Scopes } from '../v1/scopes';
import { requireScopes } from '../utils/requireScopes';

export const rootQuery = `
  type Query {
    event(id: String!): Event
    match(id: String!): Match
    user(id: String!): User
    findEventsForAdmin(admin: String!): [Event]
    team(id: String, number: Int): Team
    events: [Event]
    teams: [Team]
  }
`;

export const rootQueryResolvers = {
  async user(baseObj, { id }, context) {
    if (!requireScopes(context.scopes, Scopes.Users.READ)) throw new Error('Unauthorized');
    return await findUserById(id);
  },
  async event(baseObj, { id }, context) {
    if (!requireScopes(context.scopes, Scopes.Events.READ)) throw new Error('Unauthorized');
    return await findEventById(id);
  },
  async match(baseObj, { id }, context) {
    if (!requireScopes(context.scopes, Scopes.Matches.READ)) throw new Error('Unauthorized');
    return await findMatchById(id);
  },
  async team(baseObj, { id, number }, context) {
    if (!requireScopes(context.scopes, Scopes.Teams.READ)) throw new Error('Unauthorized');
    return await findTeam(id || number);
  },
  async events(baseObj, {}, context) {
    if (!requireScopes(context.scopes, Scopes.Events.READ)) throw new Error('Unauthorized');
    return await findEvents();
  },
  async findEventsForAdmin(baseObj, { admin }, context) {
    if (requireScopes(context.scopes, Scopes.Events.WRITE)
      || requireScopes(context.scopes, Scopes.Events.WRITE_OWN)) {
      return await findEventsForAdmin(admin);
    } else {
      throw new Error('Unauthorized');
    }
  },
  async teams() {
    return await findTeams();
  }
};
