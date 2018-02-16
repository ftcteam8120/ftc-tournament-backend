import { rootQuery } from './RootQuery';
import { rootMutation } from './RootMutation';
import { rootSubscription } from './RootSubscription';
import { eventType } from './types/event';
import { teamType } from './types/team';
import { userType } from './types/user';
import { matchType } from './types/match';

export enum Order {
  ASC = 'ASC',
  DESC = 'DESC'
}

const nodeInterface = `
  scalar Date
  interface Node {
    id: String!
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
  rootMutation,
  rootSubscription
];