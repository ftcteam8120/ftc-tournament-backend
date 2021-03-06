import { rootQueryResolvers } from './RootQuery'
import { rootMutationResolvers } from './RootMutation';
import { subscriptionResolvers } from './RootSubscription';

import { eventResolvers, rankingResolvers } from './types/event';
import { teamResolvers } from './types/team';
import { userResolvers } from './types/user';
import { matchResolvers, allianceResolvers } from './types/match';

// Custom scalar values
import { dateScalarResolver } from './dateScalar';

export default {
  Mutation: rootMutationResolvers,
  Query: rootQueryResolvers,
  Event: eventResolvers,
  Ranking: rankingResolvers,
  Date: dateScalarResolver,
  Team: teamResolvers,
  User: userResolvers,
  Match: matchResolvers,
  Alliance: allianceResolvers,
  Subscription: subscriptionResolvers
};
