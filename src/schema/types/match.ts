import {
  findEventById,
  findTeams
} from '../../actions';

export const matchType = `
  input SyncAllianceInput {
    teams: [Int]
    total: Int
    auto: Int
    auto_b: Int
    tele: Int
    end: Int
    penalty: Int
  }
  input SyncMatchInput {
    number: Int!
    winner: Winner
    type: MatchType
    number: Int
    sub: Int
    red_alliance: SyncAllianceInput
    blue_alliance: SyncAllianceInput
  }
  input AllianceInput {
    total: Int
    auto: Int
    auto_b: Int
    tele: Int
    end: Int
    penalty: Int
    teams: [String]
  }
  input AddMatchInput {
    winner: Winner
    type: MatchType
    number: Int
    sub: Int
    red_alliance: AllianceInput
    blue_alliance: AllianceInput
  }
  type Alliance {
    total: Int
    auto: Int
    auto_b: Int
    tele: Int
    end: Int
    penalty: Int
    teams: [Team]
  }
  enum Winner {
    RED
    BLUE
    TIE
  }
  enum MatchType {
    FINAL
    SEMIFINAL
    QUALIFYING
  }
  type Match {
    id: String!
    event: Event
    winner: Winner
    type: MatchType
    number: Int
    sub: Int
    red_alliance: Alliance
    blue_alliance: Alliance
  }
`

export const matchResolvers = {
  async event(baseObj) {
    return findEventById(baseObj.event);
  }
}

export const allianceResolvers = {
  async teams(baseObj) {
    return findTeams(baseObj.teams);
  }
}