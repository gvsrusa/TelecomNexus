import { PubSub } from 'graphql-subscriptions';

export const pubsub = new PubSub();

export const NEW_ALERT = 'NEW_ALERT';
export const TELEMETRY_UPDATE = 'TELEMETRY_UPDATE';
