import type { NexormConfig } from "../types/config";
import { Sequelize } from 'sequelize';
declare var sequelizes: {
    sequelize: Sequelize;
    name: string;
    filePath?: string;
}[];
declare var connections: string[];
declare function autoConnect(providerName?: string): Promise<void>;
declare function closeConnection(providerName?: string): Promise<void>;
declare function dropProvider(providerName?: string): Promise<void>;
export { sequelizes, readConfig, connections, autoConnect, closeConnection, dropProvider };
declare function readConfig(): NexormConfig;
