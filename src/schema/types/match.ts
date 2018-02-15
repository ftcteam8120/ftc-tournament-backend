import {
  findEventById,
  findTeams,
  findWinningAllianceForMatch
} from '../../actions';

import { requireScopes } from '../../utils/requireScopes';
import { Scopes } from '../../v1/scopes';

export const matchType = `
  input SyncAllianceInput {
    teams: [Int]
    surrogates: [Int]
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
    surrogates: [String]
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
    surrogates: [Team]
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
    winning_alliance: Alliance
    red_alliance: Alliance
    blue_alliance: Alliance
  }
`

export const matchResolvers = {
  async event(baseObj, {}, context) {
    if (!requireScopes(context.scopes, Scopes.Events.READ)) throw new Error('Unauthorized');
    return findEventById(baseObj.event);
  },
  async winning_alliance(baseObj, {}, context) {
    return findWinningAllianceForMatch(baseObj);
  }
}

export const allianceResolvers = {
  async teams(baseObj, {}, context) {
    if (!requireScopes(context.scopes, Scopes.Teams.READ)) throw new Error('Unauthorized');
    return findTeams(baseObj.teams);
  },
  async surrogates(baseObj, {}, context) {
    if (!requireScopes(context.scopes, Scopes.Teams.READ)) throw new Error('Unauthorized');
    return findTeams(baseObj.surrogates);
  }
}