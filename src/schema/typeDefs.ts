import { rootQuery } from './RootQuery';
import { rootMutation } from './RootMutation';
import { eventType } from './types/event';
import { teamType } from './types/team';
import { userType } from './types/user';
import { matchType } from './types/match';

const nodeInterface = `
  interface Node {
    id: String!
    shortid: String
  }
`

export default [
  nodeInterface,
  userType,
  teamType,
  eventType,
  matchType,
  rootQuery,
  rootMutation
];