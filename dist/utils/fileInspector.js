"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cachedConfig = exports.connections = exports.sequelizes = void 0;
exports.readConfig = readConfig;
exports.connect = connect;
exports.connectAll = connectAll;
exports.closeConnection = closeConnection;
exports.dropProvider = dropProvider;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const chalk_1 = __importDefault(require("chalk"));
const glob = __importStar(require("glob"));
const sequelize_1 = require("sequelize");
const errorHandler_1 = __importDefault(require("./errorHandler"));
const modelBuilder_1 = require("./modelBuilder");
const connectionManager_1 = require("./util/connectionManager");
/* eslint-disable @typescript-eslint/no-var-requires */
/* Operator Deprecation Error */
const originalEmitWarning = process.emitWarning;
process.emitWarning = ((warning, type, code, ctor) => {
    if (code == 'SEQUELIZE0003' || type == 'DeprecationWarning')
        return;
    originalEmitWarning(warning, type, code);
});
var cachedConfig = [];
exports.cachedConfig = cachedConfig;
var sequelizes = [];
exports.sequelizes = sequelizes;
var connections = [];
exports.connections = connections;
async function connectAll() {
    var config = await readConfig().catch((err) => { return undefined; });
    if (!config) {
        throw new errorHandler_1.default("Configuration file not found. Please run 'npx nexorm init' to initialize a new configuration file.", "#FF0000");
    }
    ;
    exports.cachedConfig = cachedConfig = config;
    for (var conf of config) {
        await connect(conf.$provider);
        connectionManager_1.ConnectionManager.markConnected(conf.$provider);
    }
    ;
}
;
async function connect(providerName) {
    if (!providerName)
        providerName = 'nexorm';
    var config = await readConfig();
    exports.cachedConfig = cachedConfig = config;
    var conf = config.find((item) => item.$provider === providerName);
    if (!conf) {
        throw new errorHandler_1.default(`Provider '${providerName}' not found.`, "#FF0000");
    }
    ;
    if (sequelizes.find((item) => item.name === conf?.$provider)) {
        throw new errorHandler_1.default(`Provider '${conf.$provider}' already exists.`, "#FF0000");
    }
    ;
    if (typeof conf.$filePath == 'string' && sequelizes.find((item) => item.filePath === conf?.$filePath)) {
        throw new errorHandler_1.default(`File path '${conf.$filePath}' already exists.`, "#FF0000");
    }
    connectionManager_1.ConnectionManager.markConnecting(conf.$provider);
    try {
        const sequelize = new sequelize_1.Sequelize({
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
            port: conf.$port || parseInt(conf.$connectionURI?.split(":")[1]) || undefined,
            username: conf.$username || conf.$connectionURI?.split(":")[2] || undefined,
            password: conf.$password || conf.$connectionURI?.split(":")[3] || undefined,
            ssl: conf.$ssl,
            dialectOptions: conf.$dialectOptions,
            logging: false,
            define: {
                freezeTableName: true,
            },
            operatorsAliases: {
                '$eq': sequelize_1.Op.eq,
                '$gt': sequelize_1.Op.gt,
                '$gte': sequelize_1.Op.gte,
                '$lt': sequelize_1.Op.lt,
                '$lte': sequelize_1.Op.lte,
                '$ne': sequelize_1.Op.ne,
                '$like': sequelize_1.Op.like,
                '$notLike': sequelize_1.Op.notLike,
                '$startsWith': sequelize_1.Op.startsWith,
                '$endsWith': sequelize_1.Op.endsWith,
                '$substring': sequelize_1.Op.substring,
                '$and': sequelize_1.Op.and,
                '$or': sequelize_1.Op.or,
                '$is': sequelize_1.Op.is,
                '$not': sequelize_1.Op.not,
                '$overlap': sequelize_1.Op.overlap,
                '$contains': sequelize_1.Op.contains,
                '$contained': sequelize_1.Op.contained,
                '$any': sequelize_1.Op.any,
                '$regexp': sequelize_1.Op.regexp,
                '$notRegexp': sequelize_1.Op.notRegexp,
                '$iLike': sequelize_1.Op.iLike,
                '$notILike': sequelize_1.Op.notILike,
                '$adjacent': sequelize_1.Op.adjacent,
                '$in': sequelize_1.Op.in,
                '$notIn': sequelize_1.Op.notIn,
                '$exists': sequelize_1.Op.contains,
                '$between': sequelize_1.Op.between,
                '$notBetween': sequelize_1.Op.notBetween,
                '$elementMatch': sequelize_1.Op.contains,
                '$ceil': sequelize_1.Op.col,
                '$match': sequelize_1.Op.match,
                '$strictLeft': sequelize_1.Op.strictLeft,
                '$strictRight': sequelize_1.Op.strictRight,
                '$noExtendLeft': sequelize_1.Op.noExtendLeft,
                '$noExtendRight': sequelize_1.Op.noExtendRight,
                '$placeholder': sequelize_1.Op.placeholder,
                '$all': sequelize_1.Op.all
            }
        });
        await pushValue({ sequelize, name: conf.$provider, filePath: conf.$filePath });
        connections.push(conf.$provider);
        var entities = conf.$entities || [];
        for (var entity of entities) {
            if (typeof entity == 'string') {
                const files = glob.sync(entity, { cwd: process.cwd() });
                for (const file of files) {
                    const model = await Promise.resolve(`${path_1.default.join(process.cwd(), file)}`).then(s => __importStar(require(s)));
                    if (!model || !model.default) {
                        throw new errorHandler_1.default(`Model file '${file}' does not export a default model.`, "#FF0000");
                    }
                    ;
                    await (0, modelBuilder_1.initializeBuilder)(providerName, model.default, sequelize);
                }
                ;
            }
            else if (typeof entity == 'function') {
                await (0, modelBuilder_1.initializeBuilder)(providerName, entity, sequelize);
            }
            else {
                throw new errorHandler_1.default(`Invalid entity type: ${typeof entity}. Expected string or function.`, "#FF0000");
            }
        }
        ;
        const providerModelList = await (0, modelBuilder_1.getProviderModels)(providerName);
        for (const model of providerModelList) {
            if (!model)
                continue;
            await (0, modelBuilder_1.loadRelationships)(model.model.name, sequelize, model.$schema, model.model, model.providerName);
        }
        ;
        var forceModel = conf.$force || false;
        if (conf.$database === "sqlite") {
            await sequelize.sync({ force: forceModel, alter: !forceModel });
        }
        else {
            await sequelize.authenticate();
            await sequelize.sync({ force: forceModel, alter: !forceModel });
        }
        ;
        for (const model of providerModelList) {
            if (!model)
                continue;
            await (0, modelBuilder_1.loadIndexed)(model.model.name, sequelize, model.schema).catch((err) => {
                console.error(chalk_1.default.red(`Error loading indexed for model '${model.model.name}':`), err);
            });
        }
        ;
        connectionManager_1.ConnectionManager.markConnected(conf.$provider);
        if (conf.$onConnection)
            conf.$onConnection();
    }
    catch (err) {
        connectionManager_1.ConnectionManager.markDisconnected(conf.$provider);
        if (conf.$onError) {
            conf.$onError(err);
        }
        else {
            console.error(`Error connecting to '${conf.$provider}':`, err);
            process.exit();
        }
    }
}
;
async function closeConnection(providerName) {
    var config = await readConfig();
    exports.cachedConfig = cachedConfig = config;
    var conf = config.find((item) => item.$provider === providerName);
    var sequelize = sequelizes.find((item) => item.name === providerName)?.sequelize;
    if (!sequelize) {
        throw new errorHandler_1.default(`Provider '${providerName}' not found.`, "#FF0000");
    }
    ;
    try {
        sequelize.close();
        exports.connections = connections = connections.filter((item) => item !== providerName);
        if (conf?.$onDisconnect)
            conf.$onDisconnect();
    }
    catch (err) {
        if (conf?.$onError) {
            conf.$onError(new Error(`Error closing connection to '${providerName}': ${err}`));
        }
        else {
            console.error(`Error closing connection to '${providerName}':`, err);
            process.exit();
        }
        ;
    }
    connectionManager_1.ConnectionManager.markDisconnected(providerName);
}
;
async function dropProvider(providerName) {
    var config = await readConfig();
    exports.cachedConfig = cachedConfig = config;
    var conf = config.find((item) => item.$provider === providerName);
    var sequelize = sequelizes.find((item) => item.name === providerName)?.sequelize;
    if (!sequelize) {
        throw new errorHandler_1.default(`Provider '${providerName}' not found.`, "#FF0000");
    }
    ;
    try {
        sequelize.drop();
        exports.connections = connections = connections.filter((item) => item !== providerName);
    }
    catch (err) {
        if (conf?.$onError) {
            conf.$onError(new Error(`Error dropping connection to '${providerName}': ${err}`));
            process.exit();
        }
        else {
            console.error(`Error dropping connection to '${providerName}':`, err);
            process.exit();
        }
        ;
    }
}
;
async function readConfig() {
    return new Promise((resolve, reject) => {
        const cwd = process.cwd();
        const tsConfigPath = path_1.default.join(cwd, "nexorm.config.ts");
        const jsConfigPath = path_1.default.join(cwd, "nexorm.config.js");
        const mjsConfigPath = path_1.default.join(cwd, "nexorm.config.mjs");
        const cjsConfigPath = path_1.default.join(cwd, "nexorm.config.cjs");
        const configPaths = [tsConfigPath, jsConfigPath, mjsConfigPath, cjsConfigPath];
        const foundPath = configPaths.find((p) => fs_1.default.existsSync(p));
        if (!foundPath) {
            console.log(chalk_1.default.red.bold("Configuration file not found. Please run 'npx nexorm init' to initialize a new configuration file."));
            process.exit(1);
        }
        const ext = path_1.default.extname(foundPath);
        try {
            if (ext === ".js" || ext === ".cjs") {
                const config = require(foundPath)?.default || require(foundPath);
                if (!config)
                    throw new Error("Config file is empty.");
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
                    }
                    catch {
                        try {
                            require("esbuild-register");
                        }
                        catch {
                            console.log(chalk_1.default.red("TypeScript config requires 'ts-node' or 'esbuild-register'. Please install one."));
                            return process.exit(1);
                        }
                    }
                    const config = require(foundPath)?.default || require(foundPath);
                    if (!config)
                        throw new Error("Config file is empty.");
                    return resolve(config);
                }
                catch (err) {
                    console.log(chalk_1.default.red.bold("Failed to load TypeScript or ESM config."));
                    console.error(err);
                    process.exit(1);
                }
            }
            console.log(chalk_1.default.red.bold("Unsupported config file type."));
            process.exit(1);
        }
        catch (e) {
            console.log(chalk_1.default.red.bold("Unexpected error loading configuration file."));
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
async function pushValue(options) {
    await new Promise((resolve) => {
        sequelizes.push(options);
        resolve(true);
    });
}
;
function isNestProject() {
    try {
        require.resolve('@nestjs/core', { paths: [process.cwd()] });
        return true;
    }
    catch {
        return false;
    }
}
;
