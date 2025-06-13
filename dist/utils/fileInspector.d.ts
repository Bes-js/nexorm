import type { NexormConfig } from "../types/config";
import { Sequelize } from 'sequelize';
declare var cachedConfig: NexormConfig;
declare var sequelizes: {
    sequelize: Sequelize;
    name: string;
    filePath?: string;
}[];
declare var connections: string[];
declare function connectAll(): Promise<void>;
declare function connect(providerName: string): Promise<void>;
declare function closeConnection(providerName: string): Promise<void>;
declare function dropProvider(providerName?: string): Promise<void>;
export { sequelizes, readConfig, connections, connect, connectAll, closeConnection, dropProvider, cachedConfig };
declare function readConfig(): Promise<NexormConfig>;
