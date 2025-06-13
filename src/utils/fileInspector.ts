import fs, { read } from "fs";
import path from "path";
import chalk from "chalk";
import * as glob from "glob";

import type { NexormConfig } from "../types/config";

import { Sequelize, Op } from 'sequelize';
import ErrorHandler from "./errorHandler";
import { getProviderModels, initializeBuilder, loadIndexed, loadRelationships } from "./modelBuilder";
import { ConnectionManager } from "./util/connectionManager";
import { pathToFileURL } from "url";

/* eslint-disable @typescript-eslint/no-var-requires */
/* Operator Deprecation Error */
const originalEmitWarning = process.emitWarning;
process.emitWarning = ((warning: string | Error, type?: string | undefined, code?: string | undefined, ctor?: Function | undefined) => {
  if (code == 'SEQUELIZE0003' || type == 'DeprecationWarning') return; 
  originalEmitWarning(warning, type as any, code);
}) as typeof process.emitWarning;


var cachedConfig = [] as NexormConfig;
var sequelizes: { 
    sequelize: Sequelize;
    name: string; 
    filePath?: string;
}[] = [];

var connections = [] as string[];


async function connectAll() {
    var config = await readConfig().catch((err) => { return undefined; });
    if (!config) {
        throw new ErrorHandler("Configuration file not found. Please run 'npx nexorm init' to initialize a new configuration file.", "#FF0000");
    };

    cachedConfig = config;

    for (var conf of config) {
        await connect(conf.$provider);
        ConnectionManager.markConnected(conf.$provider);
    };

};



async function connect(providerName: string) {
        if (!providerName) providerName = 'nexorm';
        var config = await readConfig();
        cachedConfig = config;
    
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

        ConnectionManager.markConnecting(conf.$provider);

        try {
            const sequelize = new Sequelize({
                dialect: conf.$database,
                dialectModule: conf.$dialectModule,
                database: conf.$databaseTable,
                storage: conf.$filePath,
                protocol: conf.$protocol,
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
                dialectOptions: conf.$dialectOptions,
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

           

            await pushValue({ sequelize, name: conf.$provider, filePath: conf.$filePath });
            connections.push(conf.$provider);

            var entities = conf.$entities || [];
            
            for (var entity of entities) {
              if (typeof entity == 'string') {              
                    const files = glob.sync(entity, { cwd: process.cwd() });

                    for (const file of files) {
                        const model = await import(path.join(process.cwd(), file));
                        if (!model || !model.default) {
                            throw new ErrorHandler(`Model file '${file}' does not export a default model.`, "#FF0000");
                        };                        

                        await initializeBuilder(providerName as string, model.default, sequelize);
                    };
                  } else
                  if (typeof entity == 'function') {
                    await initializeBuilder(providerName as string, entity, sequelize);
                  } else {
                    throw new ErrorHandler(`Invalid entity type: ${typeof entity}. Expected string or function.`, "#FF0000");
                  }
            };

            const providerModelList = await getProviderModels(providerName as string);

            for (const model of providerModelList) {
                if (!model) continue;
                await loadRelationships(model.model.name, sequelize, model.$schema, model.model, model.providerName);
            };


            var forceModel = conf.$force || false;
            if (conf.$database === "sqlite") {
              await sequelize.sync({ force: forceModel, alter: !forceModel });
            } else {
              await sequelize.authenticate();
              await sequelize.sync({ force: forceModel, alter: !forceModel });
            };

            for (const model of providerModelList) {
                if (!model) continue;
                await loadIndexed(model.model.name, sequelize, model.schema).catch((err) => {
                    console.error(chalk.red(`Error loading indexed for model '${model.model.name}':`), err);
                });
            };
            

            ConnectionManager.markConnected(conf.$provider);

            if (conf.$onConnection) conf.$onConnection();
        } catch (err) {
            ConnectionManager.markDisconnected(conf.$provider);
            if (conf.$onError) {
                conf.$onError((err as Error));
            } else {
                console.error(`Error connecting to '${conf.$provider}':`, err);
                process.exit();
            }
        }
};


async function closeConnection(providerName: string) {
    var config = await readConfig();

    cachedConfig = config;

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
    ConnectionManager.markDisconnected(providerName);
};


async function dropProvider(providerName?: string) {
    var config = await readConfig();

    cachedConfig = config;

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





export { sequelizes, readConfig, connections, connect, connectAll, closeConnection, dropProvider, cachedConfig };



async function readConfig(): Promise<NexormConfig> {
    return new Promise((resolve, reject) => {
      const cwd = process.cwd();
      const tsConfigPath = path.join(cwd, "nexorm.config.ts");
      const jsConfigPath = path.join(cwd, "nexorm.config.js");
      const mjsConfigPath = path.join(cwd, "nexorm.config.mjs");
      const cjsConfigPath = path.join(cwd, "nexorm.config.cjs");
  
      const configPaths = [tsConfigPath, jsConfigPath, mjsConfigPath, cjsConfigPath];
      const foundPath = configPaths.find((p) => fs.existsSync(p));
  
      if (!foundPath) {
        console.log(
          chalk.red.bold(
            "Configuration file not found. Please run 'npx nexorm init' to initialize a new configuration file."
          )
        );
        process.exit(1);
      }
  
      const ext = path.extname(foundPath);
  
      try {
        if (ext === ".js" || ext === ".cjs") {
          const config = require(foundPath)?.default || require(foundPath);
          if (!config) throw new Error("Config file is empty.");
          return resolve(config);
        }
  
        if (ext === ".ts" || ext === ".mjs") {
          try {
            try {
              require("ts-node").register({
                transpileOnly: true,
                compilerOptions: {
                  module: "commonjs",
                },
              });
            } catch {
              try {
                require("esbuild-register");
              } catch {
                console.log(chalk.red("TypeScript config requires 'ts-node' or 'esbuild-register'. Please install one."));
                return process.exit(1);
              }
            }
  
            const config = require(foundPath)?.default || require(foundPath);
            if (!config) throw new Error("Config file is empty.");
            return resolve(config);
          } catch (err) {
            console.log(chalk.red.bold("Failed to load TypeScript or ESM config."));
            console.error(err);
            process.exit(1);
          }
        }
  
        console.log(chalk.red.bold("Unsupported config file type."));
        process.exit(1);
      } catch (e) {
        console.log(chalk.red.bold("Unexpected error loading configuration file."));
        console.error(e);
        process.exit(1);
      }
    });
  }



/*
async function readConfig(): Promise<NexormConfig> {

    return await new Promise<NexormConfig>((resolve, reject) => {

    if (!fs.existsSync(path.join(process.cwd(), "nexorm.config.ts")) && !fs.existsSync(path.join(process.cwd(), "nexorm.config.js"))) {
        console.log(chalk.red.bold("Configuration file not found. Please run ' npx nexorm init ' to initialize a new configuration file"));
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
                
                    return require(path.join(process.cwd(), "nexorm.config.ts"))?.default;
            } catch (err) {
                return null;
            }
        })();
    
        if (jsFile) config = jsFile;
        if (tsFile) config = tsFile;
    
        if (!config) {
            console.log(chalk.red.bold("Configuration file not found. Please run ' npx nexorm init ' to initialize a new configuration file."));
            process.exit();
        }
    } catch (e) {
        console.log(chalk.red.bold("Error reading configuration file. Please check if the file is correctly formatted."));
        console.error(e);
        process.exit();
    }
    

    resolve(config as NexormConfig);
 }).catch((err) => {
    console.error(chalk.red.bold("Error reading configuration file. Please check if the file is correctly formatted."));
    console.error(err);
    process.exit();
  });
};
*/



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
  };