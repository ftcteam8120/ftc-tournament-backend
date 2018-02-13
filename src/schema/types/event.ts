import {
  findTeams,
  findTeam,
  findUsers,
  findMatchesForEvent,
  sortRankings
} from '../../actions';

import { requireScopes } from '../../utils/requireScopes';
import { Scopes } from '../../v1/scopes';

export const eventType = `
  input UpdateLocationInput {
    address: String
    description: String
  }
  input UpdateEventInput {
    name: String
    start: Date
    end: Date
    logo_url: String
    location: UpdateLocationInput
    description: String
  }
  input CreateEventInput {
    admins: [String]
    teams: [String]
    current_round: Int
    name: String!
    start: Date
    end: Date
    logo_url: String
    primary_color: String
    secondary_color: String
    rankings: [CreateRankingInput]
  }
  input AddSponsorInput {
    name: String
    logo_url: String
    type: SponsorType
  }
  input SyncRankingInput {
    team: Int
    ranking_points: Int
    qualifying_points: Int
    highest: Int
    rank: Int
    matches: Int
  }
  input CreateRankingInput {
    team: String!
    ranking_points: Int
    qualifying_points: Int
    highest: Int
    rank: Int
    matches: Int
  }
  type Ranking {
    team: Team
    ranking_points: Int
    qualifying_points: Int
    highest: Int
    rank: Int
  }
  type Coordinates {
    lat: Float
    lng: Float
  }
  type Location {
    address: String
    description: String
    place_id: String
    coordinates: Coordinates
  }
  enum EventType {
    SCRIMMAGE
    MEET
    QUALIFYING
    SUPER_QUALIFYING
    SUPER_REGIONAL
    CHAMPIONSHIP
    WORLD
  }
  enum SponsorType {
    PRIMARY
    SECONDARY
  }
  type Sponsor {
    name: String
    logo_url: String
    type: SponsorType
  }
  input RankingsOrder {
    rank: Order
    ranking_points: Order
    qualifying_points: Order
    highest: Order
  }
  input MatchesOrder {
    number: Order
    type: Order
    sub: Order
  }
  type Event implements Node {
    id: String!
    code: String!
    type: EventType
    season: Int
    admins: [User]
    teams: [Team]
    current_round: Int
    name: String!
    location: Location
    description: String
    start: Date
    end: Date
    sponsors: [Sponsor]
    logo_url: String
    primary_color: String
    secondary_color: String
    rankings: [Ranking]
    rankings(orderBy: RankingsOrder): [Ranking]
    matches: [Match]
    matches(type: MatchType, winner: Winner, team: String, orderBy: MatchesOrder): [Match]
  }
`

export const eventResolvers = {
  async admins(baseObj, {}, context) {
    if (!requireScopes(context.scopes, Scopes.Users.READ)) throw new Error('Unauthorized');
    return findUsers(baseObj.admins);
  },
  async teams(baseObj, { }, context) {
    if (!requireScopes(context.scopes, Scopes.Teams.READ)) throw new Error('Unauthorized');
    return findTeams(baseObj.teams);
  },
  async matches(baseObj, query, context) {
    if (!requireScopes(context.scopes, Scopes.Matches.READ)) throw new Error('Unauthorized');
    return findMatchesForEvent(baseObj.id, query);
  },
  rankings(baseObj, { orderBy }, context) {
    if (!requireScopes(context.scopes, Scopes.Teams.READ)) throw new Error('Unauthorized');
    return sortRankings(baseObj, orderBy);
  }
}

export const rankingResolvers = {
  async team(baseObj, {}, context) {
    if (!requireScopes(context.scopes, Scopes.Matches.READ)) throw new Error('Unauthorized');
    return findTeam(baseObj.team);
  }
}