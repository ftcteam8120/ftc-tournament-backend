import {
  findUserById,
  findUsers,
  findMatchesForTeam,
  findEventsForTeam
} from '../../actions';

import { requireScopes } from '../../utils/requireScopes';
import { Scopes } from '../../v1/scopes';

export const teamType = `
  input SyncTeamInput {
    number: Int!
    name: String
    school: String
    city: String
    state: String
    country: String
  }
  input AddTeamInput {
    shortid: String
    coaches: [String]
    members: [String]
    twitter: String
    biography: String
    name: String!
    number: Int!
    school: String
    city: String
    state: String
    country: String
    photo_url: String
  }
  enum MaterialColor {
    amber
    blue
    blueGrey
    brown
    cyan
    deepOrange
    deepPurple
    green
    grey
    indigo
    lightBlue
    lightGreen
    lime
    orange
    pink
    purple
    red
    teal
    yellow
  }
  type TeamColors {
    primary: MaterialColor
    secondary: MaterialColor
  }
  type Team {
    id: String
    shortid: String
    coaches: [User]
    members: [User]
    matches: [Match]
    events: [Event]
    twitter: String
    biography: String
    name: String!
    number: Int!
    affiliation: String
    location: Location
    city: String
    state: String
    country: String
    website: String
    photo_url: String
    banner_url: String
    colors: TeamColors
  }
`

export const teamResolvers = {
  async coaches(baseObj, {}, context) {
    if (!requireScopes(context.scopes, Scopes.Users.READ)) throw new Error('Unauthorized');
    return findUsers(baseObj.coaches);
  },
  async members(baseObj, {}, context) {
    if (!requireScopes(context.scopes, Scopes.Users.READ)) throw new Error('Unauthorized');
    return findUsers(baseObj.members);
  },
  async events(baseObj, {}, context) {
    if (!requireScopes(context.scopes, Scopes.Events.READ)) throw new Error('Unauthorized');
    return findEventsForTeam(baseObj.id);
  },
  async matches(baseObj, {}, context) {
    if (!requireScopes(context.scopes, Scopes.Matches.READ)) throw new Error('Unauthorized');
    return findMatchesForTeam(baseObj.id);
  }
}