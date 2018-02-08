import {
  findUserById,
  findUsers
} from '../../actions';

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
  type Team implements Node {
    id: String!
    shortid: String
    coaches: [User]
    members: [User]
    twitter: String
    biography: String
    name: String!
    number: Int!
    affiliation: String
    location: Location
    city: String
    state: String
    country: String
    photo_url: String
  }
`

export const teamResolvers = {
  async coaches(baseObj) {
    return findUsers(baseObj.coaches);
  },
  async members(baseObj) {
    return findUsers(baseObj.members);
  }
}