import { PubSub } from 'graphql-subscriptions';

export enum Topics {
  MATCHES_UPDATED = 'matchesUpdated',
  RANKINGS_UPDATED = 'rankingsUpdated'
}

export const pubsub = new PubSub();
