import {
  createEvent,
  addTeamToEvent,
  addMatchToEvent,
  updateMatchScores,
  syncTeamsWithEvent,
  syncMatchesWithEvent,
  syncRankingsWithEvent
} from '../actions';

export const rootMutation = `
  type Mutation {
    createEvent(input: CreateEventInput!): Event
    addTeamToEvent(event: String!, input: AddTeamInput!): Team
    syncTeamsWithEvent(event: String!, teams: [SyncTeamInput]): [Team]
    syncMatchesWithEvent(event: String!, matches: [SyncMatchInput]): [Match]
    syncRankingsWithEvent(event: String!, rankings: [SyncRankingInput]): Event
    addMatchToEvent(event: String!, input: AddMatchInput!): Match
  }
`;

export const rootMutationResolvers = {
  async createEvent(baseObj, { input }) {
    return createEvent(input);
  },
  async syncTeamsWithEvent(baseObj, { event, teams }) {
    return syncTeamsWithEvent(event, teams);
  },
  async syncMatchesWithEvent(baseObj, { event, matches }) {
    return syncMatchesWithEvent(event, matches);
  },
  async syncRankingsWithEvent(baseObj, { event, rankings }) {
    return syncRankingsWithEvent(event, rankings);
  },
  async addTeamToEvent(baseObj, { event, input }) {
    return addTeamToEvent(event, input);
  },
  async addMatchToEvent(baseObj, { event, input }) {
    return addMatchToEvent(event, input);
  }
};
