import {
  findTeamsForUser, findEventsForAdmin
} from '../../actions';

import { requireScopes } from '../../utils/requireScopes';
import { Scopes } from '../../v1/scopes';

export const userType = `
  type Email {
    value: String!
    type: String
  }
  type Photo {
    value: String!
  }
  type Name {
    givenName: String
    familyName: String
    middleName: String
  }
  type Profile {
    provider: String
    id: String
    displayName: String
    name: Name
    emails: [Email]
    photos: [Photo]
  }
  type User implements Node {
    id: String!
    teams: [Team]
    events: [Event]
    shortid: String
    username: String
    profile: Profile
  }
`

export const userResolvers = {
  async teams(baseObj, {}, context) {
    if (!requireScopes(context.scopes, Scopes.Teams.READ)) throw new Error('Unauthorized');
    return findTeamsForUser(baseObj.id)
  },
  async events(baseObj, {}, context) {
    if (!requireScopes(context.scopes, Scopes.Events.READ)) throw new Error('Unauthorized');
    return findEventsForAdmin(baseObj.id);
  }
}