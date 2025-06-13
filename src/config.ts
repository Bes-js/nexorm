/* eslint-disable */
import type { NexormConfig, NexormConfigType } from './types';
export type { NexormConfig, NexormConfigType };
export default function defineConfig(config: NexormConfigType | NexormConfig): NexormConfig {
    if (Array.isArray(config)) {
        return config;
    } else {
        return [config];
    }
};