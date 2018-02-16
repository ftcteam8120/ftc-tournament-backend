import { withFilter } from 'graphql-subscriptions';
import { pubsub, Topics } from '../subscriptions';
import { teamResolvers } from './types/team';
import { Order } from './typeDefs';
import * as _ from 'lodash';

export const rootSubscription = `
  type Subscription {
    matchesUpdated(event: String!, orderBy: MatchesOrder): [Match]
    rankingsUpdated(event: String!): [Ranking]
  }
`;

export const subscriptionResolvers = {
  matchesUpdated: {
    resolve: (payload, args, context, info) => {
      if (args.orderBy) {
        let orders = [];
        let iteratees = [];
        Object.keys(args.orderBy).forEach((key) => {
          if (args.orderBy[key]) {
            iteratees.push(key);
            if (args.orderBy[key] === Order.DESC) {
              orders.push('desc');
            } else {
              orders.push('asc');
            }
          }
        });
        return _.orderBy(payload.matches, iteratees, orders);
      }
      return payload.matches;
    },
    subscribe: withFilter(() => pubsub.asyncIterator(Topics.MATCHES_UPDATED), (payload, variables) => {
      return payload.event === variables.event || payload.eventCode === variables.event;
    })
  },
  rankingsUpdated: {
    resolve: (payload, args, context, info) => {
      return payload.rankings;
    },
    subscribe: withFilter(() => pubsub.asyncIterator(Topics.RANKINGS_UPDATED), (payload, variables) => {
      return payload.event === variables.event || payload.eventCode === variables.event;
    })
  }
};
