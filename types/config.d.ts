/**
 * Nexorm Configuration
 *
 * @type {NexormConfig} NexormConfigType
 * @property {'nexorm' | string} $provider @default 'nexorm' Provider name
 * @property {'mysql' | 'postgres' | 'sqlite' | 'mariadb' | 'mssql'} $database Database type
 * @property {any} [$dialectModule] Dialect module for database
 * @property {string} [$filePath] @default './nexorm.sqlite' File path for SQLite database
 * @property {'InnoDB' | 'MyISAM' | 'MEMORY' | 'CSV' | 'BLACKHOLE' | 'ARCHIVE' | 'FEDERATED' | 'TOKUDB' | 'Aria' | 'PERFORMANCE_SCHEMA' | 'MRG_MYISAM' | 'ISAM' | 'MERGE' | 'NDB' | 'NDBCLUSTER' | 'EXAMPLE' | 'MEMORY'} [$databaseEngine] Database engine
 * @property {boolean} [$ssl] SSL connection
 * @property {{ $acquire: number, $idle: number, $max: number, $min: number, $evict: number }} [$pool] Connection pool options
 * @property {() => void} [$onConnection] On connection callback
 * @property {(error: Error) => void} [$onError] On error callback
 * @property {string} [$host] Hostname
 * @property {number} [$port] Port number
 * @property {string} [$username] Username
 * @property {string} [$password] Password
 * @property {string} [$connectionURI] Connection URI
 * @property {NexormCacheConfig} [$cache] Cache configuration
 * @property {NexormConfigType[]} NexormConfig
 * @returns {NexormConfigType}
 */
export type NexormConfigType = {
    $provider: 'nexorm' | (string & {});
    $database: 'mysql' | 'postgres' | 'sqlite' | 'mariadb' | 'mssql';
    $dialectModule?: any;
    $autoConnect?: boolean;
    $filePath?: string;
    $databaseEngine?: 'B-tree' | 'InnoDB' | 'MyISAM' | 'MEMORY' | 'CSV' | 'BLACKHOLE' | 'ARCHIVE' | 'FEDERATED' | 'TOKUDB' | 'Aria' | 'PERFORMANCE_SCHEMA' | 'MRG_MYISAM' | 'ISAM' | 'MERGE' | 'NDB' | 'NDBCLUSTER' | 'EXAMPLE' | 'MEMORY' | (string & {});
    $ssl?: boolean;
    $pool?: {
        $acquire?: number;
        $idle?: number;
        $max?: number;
        $min?: number;
        $evict?: number;
    };
    $onConnection?: () => void;
    $onDisconnect?: () => void;
    $onError?: (error: Error) => void;
    $host?: string;
    $port?: number;
    $username?: string;
    $password?: string;
    $connectionURI?: string;
    $cache?: NexormCacheConfig;
};
export type NexormConfig = NexormConfigType[];
export interface NexormCacheConfig {
    $type: 'memory';
    $duration: number;
}
