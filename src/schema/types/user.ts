import {
  findTeamsForUser
} from '../../actions';

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
    shortid: String
    username: String
    profile: Profile
  }
`

export const userResolvers = {
  async teams(baseObj) {
    return findTeamsForUser(baseObj.id)
  }
}