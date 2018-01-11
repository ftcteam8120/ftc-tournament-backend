import {
  findTeams,
  findTeamById,
  findUsers,
  findMatchesForEvent
} from '../../actions';

export const eventType = `
  input CreateEventInput {
    admins: [String]
    teams: [String]
    current_round: Int
    name: String!
    start: String
    end: String
    logo_url: String
    primary_color: String
    secondary_color: String
    rankings: [CreateRankingInput]
  }
  input CreateRankingInput {
    team: String!
    score: Int
    ranking: Int
  }
  type Ranking {
    team: Team
    score: Int
    ranking: Int
  }
  type Event implements Node {
    id: String!
    shortid: String
    admins: [User]
    teams: [Team]
    current_round: Int
    name: String!
    start: String
    end: String
    logo_url: String
    primary_color: String
    secondary_color: String
    rankings: [Ranking]
    matches: [Match]
  }
`

export const eventResolvers = {
  async admins(baseObj) {
    return findUsers(baseObj.admins);
  },
  async teams(baseObj) {
    return findTeams(baseObj.teams);
  },
  async matches(baseObj) {
    return findMatchesForEvent(baseObj.id);
  }
}

export const rankingResolvers = {
  async team(baseObj) {
    return findTeamById(baseObj.team);
  }
}