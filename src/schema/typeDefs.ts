import { rootQuery } from './RootQuery';
import { rootMutation } from './RootMutation';
import { eventType } from './types/event';
import { teamType } from './types/team';
import { userType } from './types/user';
import { matchType } from './types/match';

export enum Order {
  ASC = 'ASC',
  DESC = 'DESC'
}

const nodeInterface = `
  interface Node {
    id: String!
    shortid: String
  }
  enum Order {
    ASC
    DESC
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