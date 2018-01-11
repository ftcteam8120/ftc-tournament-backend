import { rootQueryResolvers } from './RootQuery'
import {
  rootMutationResolvers
} from './RootMutation';

import { eventResolvers, rankingResolvers } from './types/event';
import { teamResolvers } from './types/team';
import { userResolvers } from './types/user';
import { matchResolvers, allianceResolvers } from './types/match';

export default {
  Mutation: rootMutationResolvers,
  Query: rootQueryResolvers,
  Event: eventResolvers,
  Ranking: rankingResolvers,
  Team: teamResolvers,
  User: userResolvers,
  Match: matchResolvers,
  Alliance: allianceResolvers
};
