import {
  createEvent,
  addTeamToEvent,
  addMatchToEvent,
  updateMatchScores,
  syncTeamsWithEvent,
  syncMatchesWithEvent,
  syncRankingsWithEvent,
  updateEvent
} from '../actions';

import { Scopes } from '../v1/scopes';
import { requireScopes } from '../utils/requireScopes';

export const rootMutation = `
  type Mutation {
    createEvent(input: CreateEventInput!): Event
    addTeamsToEvent(event: String!, teams: [String]): Event
    syncMatchesWithEvent(event: String!, matches: [SyncMatchInput]): [Match]
    syncRankingsWithEvent(event: String!, rankings: [SyncRankingInput]): Event
    addMatchToEvent(event: String!, input: AddMatchInput!): Match
    updateEvent(id: String!, input: UpdateEventInput!): Event
    addSponsorsToEvent(event: String!, sponsors: [AddSponsorInput]): Event
  }
`;

export const rootMutationResolvers = {
  async createEvent(baseObj, { input }) {
    return createEvent(input);
  },
  async syncMatchesWithEvent(baseObj, { event, matches }) {
    return syncMatchesWithEvent(event, matches);
  },
  async syncRankingsWithEvent(baseObj, { event, rankings }) {
    return syncRankingsWithEvent(event, rankings);
  },
  async addMatchToEvent(baseObj, { event, input }) {
    return addMatchToEvent(event, input);
  },
  async updateEvent(baseObj, { id, input }, context) {
    if (!requireScopes(context.scopes, Scopes.Events.WRITE)) throw new Error('Unauthorized');
    return updateEvent(id, input);
  }
};
