import {
  createEvent,
  addTeamToEvent,
  addMatchToEvent,
  updateMatchScores
} from '../actions';

export const rootMutation = `
  type Mutation {
    createEvent(input: CreateEventInput!): Event
    addTeamToEvent(event: String!, input: AddTeamInput!): Team
    addMatchToEvent(event: String!, input: AddMatchInput!): Match
    updateMatchScores(event: String!, match: Int!, input: UpdateScoresInput!): Match
  }
`;

export const rootMutationResolvers = {
  async createEvent(baseObj, { input }) {
    return createEvent(input);
  },
  async addTeamToEvent(baseObj, { event, input }) {
    return addTeamToEvent(event, input);
  },
  async addMatchToEvent(baseObj, { event, input }) {
    return addMatchToEvent(event, input);
  },
  async updateMatchScores(baseObj, { event, match, input }) {
    return updateMatchScores(event, match, input);
  }
};
