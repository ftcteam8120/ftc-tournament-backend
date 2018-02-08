import {
  findTeams,
  findTeam,
  findUsers,
  findMatchesForEvent,
  sortRankings
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
    shortid: String
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
  async admins(baseObj) {
    return findUsers(baseObj.admins);
  },
  async teams(baseObj) {
    return findTeams(baseObj.teams);
  },
  async matches(baseObj, query) {
    return findMatchesForEvent(baseObj.id, query);
  },
  rankings(baseObj, { orderBy }) {
    return sortRankings(baseObj, orderBy);
  }
}

export const rankingResolvers = {
  async team(baseObj) {
    return findTeam(baseObj.team);
  }
}