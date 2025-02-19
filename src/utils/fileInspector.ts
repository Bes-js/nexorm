import fs from "fs";
import path from "path";
import chalk from "chalk";

import type { NexormConfig } from "../types/config";

import { Sequelize, Op } from 'sequelize';
import ErrorHandler from "./errorHandler";

/* eslint-disable @typescript-eslint/no-var-requires */
/* Operator Deprecation Error */
const originalEmitWarning = process.emitWarning;
process.emitWarning = ((warning: string | Error, type?: string | undefined, code?: string | undefined, ctor?: Function | undefined) => {
  if (code == 'SEQUELIZE0003' || type == 'DeprecationWarning') return; 
  originalEmitWarning(warning, type as any, code);
}) as typeof process.emitWarning;


const config = readConfig();
var sequelizes: { 
    sequelize: Sequelize;
    name: string; 
    filePath?: string;
}[] = [];

var connections = [] as string[];


async function autoConnect(providerName?: string) {
    
        var conf = config.find((item) => item.$provider === providerName);
        if (!conf) {
            throw new ErrorHandler(`Provider '${providerName}' not found.`, "#FF0000");
        };
        
        if (sequelizes.find((item) => item.name === conf?.$provider)) {
            throw new ErrorHandler(`Provider '${conf.$provider}' already exists.`, "#FF0000");
        };

        if (typeof conf.$filePath == 'string' && sequelizes.find((item) => item.filePath === conf?.$filePath)) {
            throw new ErrorHandler(`File path '${conf.$filePath}' already exists.`, "#FF0000");
        }

        try {
            const sequelize = new Sequelize({
                dialect: conf.$database,
                dialectModule: conf.$dialectModule,
                database: conf.$database,
                storage: conf.$filePath,
                pool: {
                    acquire: conf.$pool?.$acquire,
                    idle: conf.$pool?.$idle,
                    max: conf.$pool?.$max,
                    min: conf.$pool?.$min,
                    evict: conf.$pool?.$evict,
                },
                host: conf.$host || conf.$connectionURI?.split(":")[0] || undefined,
                port: conf.$port || parseInt(conf.$connectionURI?.split(":")[1] as string) || undefined,
                username: conf.$username || conf.$connectionURI?.split(":")[2] || undefined,
                password: conf.$password || conf.$connectionURI?.split(":")[3] || undefined,
                ssl: conf.$ssl,
                logging: false,
                define: {
                    freezeTableName: true,
                },
                operatorsAliases: {
                    '$eq': Op.eq,
                    '$gt': Op.gt,
                    '$gte': Op.gte,
                    '$lt': Op.lt,
                    '$lte': Op.lte,
                    '$ne': Op.ne,
                    '$like': Op.like,
                    '$notLike': Op.notLike,
                    '$startsWith': Op.startsWith,
                    '$endsWith': Op.endsWith,
                    '$substring': Op.substring,
                    '$and': Op.and,
                    '$or': Op.or,
                    '$is': Op.is,
                    '$not': Op.not,
                    '$overlap': Op.overlap,
                    '$contains': Op.contains,
                    '$contained': Op.contained,
                    '$any': Op.any,
                    '$regexp': Op.regexp,
                    '$notRegexp': Op.notRegexp,
                    '$iLike': Op.iLike,
                    '$notILike': Op.notILike,
                    '$adjacent': Op.adjacent,
                    '$in': Op.in,
                    '$notIn': Op.notIn,
                    '$exists': Op.contains,
                    '$between': Op.between,
                    '$notBetween': Op.notBetween,
                    '$elementMatch': Op.contains,
                    '$ceil': Op.col,
                    '$match': Op.match,
                    '$strictLeft': Op.strictLeft,
                    '$strictRight': Op.strictRight,
                    '$noExtendLeft': Op.noExtendLeft,
                    '$noExtendRight': Op.noExtendRight,
                    '$placeholder': Op.placeholder,
                    '$all': Op.all
                }
            });

            if (conf.$database === "sqlite") {
                sequelize.sync();
            } else {
                sequelize.authenticate();
            }

            pushValue({ sequelize, name: conf.$provider, filePath: conf.$filePath });
            connections.push(conf.$provider);
            if (conf.$onConnection) conf.$onConnection();
        } catch (err) {
            if (conf.$onError) {
                conf.$onError((err as Error));
            } else {
                console.error(`Error connecting to '${conf.$provider}':`, err);
                process.exit();
            }
        }
};


async function closeConnection(providerName?: string) {
    var conf = config.find((item) => item.$provider === providerName);
    var sequelize = sequelizes.find((item) => item.name === providerName)?.sequelize;

    if (!sequelize) {
        throw new ErrorHandler(`Provider '${providerName}' not found.`, "#FF0000");
    };

    try {
        sequelize.close();
        connections = connections.filter((item) => item !== providerName);
        if (conf?.$onDisconnect) conf.$onDisconnect();
    } catch (err) {
        if (conf?.$onError) {
            conf.$onError(new Error(`Error closing connection to '${providerName}': ${err}`));
        } else {
            console.error(`Error closing connection to '${providerName}':`, err);
            process.exit();
        };
    }
};


async function dropProvider(providerName?: string) {
    var conf = config.find((item) => item.$provider === providerName);
    var sequelize = sequelizes.find((item) => item.name === providerName)?.sequelize;

    if (!sequelize) {
        throw new ErrorHandler(`Provider '${providerName}' not found.`, "#FF0000");
    };

    try {
        sequelize.drop();
        connections = connections.filter((item) => item !== providerName);
    } catch (err) {
        if (conf?.$onError) {
            conf.$onError(new Error(`Error dropping connection to '${providerName}': ${err}`));
            process.exit();
        } else {
            console.error(`Error dropping connection to '${providerName}':`, err);
            process.exit();
        };
    }
};


var autoConnection = config.filter((item) => item.$autoConnect === true);
if (autoConnection.length > 0) {
    for (var connection of autoConnection) {
        autoConnect(connection.$provider);
    };
};



export { sequelizes, readConfig, connections, autoConnect, closeConnection, dropProvider };


function readConfig(): NexormConfig {

    if (!fs.existsSync(path.join(process.cwd(), "nexorm.config.ts")) && !fs.existsSync(path.join(process.cwd(), "nexorm.config.js"))) {
        console.log(chalk.red.bold("Configuration file not found. Please run ' nexorm init ' to initialize a new configuration file"));
        process.exit();
    };

    var config = {} as NexormConfig;

    try {
        const jsFile = (() => {
            try {
                return require(path.join(process.cwd(), "nexorm.config.js"))?.default;
            } catch (err) {
                return null;
            }
        })();
    
        const tsFile = (() => {
            try {
                if (isNestProject()) {
                    require('ts-node').register();
                    return require(path.join(process.cwd(), "nexorm.config.ts"))?.default;
                } else {
                    return require(path.join(process.cwd(), "nexorm.config.ts"))?.default;
                }
            } catch (err) {
                return null;
            }
        })();
    
        if (jsFile) config = jsFile;
        if (tsFile) config = tsFile;
    
        if (!config) {
            console.log(chalk.red.bold("Configuration file not found. Please run 'nexorm init' to initialize a new configuration file."));
            process.exit();
        }
    } catch (e) {
        console.log(chalk.red.bold("Error reading configuration file. Please check if the file is correctly formatted."));
        console.error(e);
        process.exit();
    }
    

    return config;
};



async function pushValue(options:{ sequelize: Sequelize; name: string; filePath?: string; }) {
    await new Promise((resolve) => {
       sequelizes.push(options);
       resolve(true);
    });
};


function isNestProject(): boolean {
    try {
      require.resolve('@nestjs/core', { paths: [process.cwd()] });
      return true;
    } catch {
      return false;
    }
  }