"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connections = exports.sequelizes = void 0;
exports.readConfig = readConfig;
exports.autoConnect = autoConnect;
exports.closeConnection = closeConnection;
exports.dropProvider = dropProvider;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const chalk_1 = __importDefault(require("chalk"));
const sequelize_1 = require("sequelize");
const errorHandler_1 = __importDefault(require("./errorHandler"));
/* eslint-disable @typescript-eslint/no-var-requires */
/* Operator Deprecation Error */
const originalEmitWarning = process.emitWarning;
process.emitWarning = ((warning, type, code, ctor) => {
    if (code == 'SEQUELIZE0003' || type == 'DeprecationWarning')
        return;
    originalEmitWarning(warning, type, code);
});
const config = readConfig();
var sequelizes = [];
exports.sequelizes = sequelizes;
var connections = [];
exports.connections = connections;
async function autoConnect(providerName) {
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
    try {
        const sequelize = new sequelize_1.Sequelize({
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
            port: conf.$port || parseInt(conf.$connectionURI?.split(":")[1]) || undefined,
            username: conf.$username || conf.$connectionURI?.split(":")[2] || undefined,
            password: conf.$password || conf.$connectionURI?.split(":")[3] || undefined,
            ssl: conf.$ssl,
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
        if (conf.$database === "sqlite") {
            sequelize.sync();
        }
        else {
            sequelize.authenticate();
        }
        pushValue({ sequelize, name: conf.$provider, filePath: conf.$filePath });
        connections.push(conf.$provider);
        if (conf.$onConnection)
            conf.$onConnection();
    }
    catch (err) {
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
}
;
async function dropProvider(providerName) {
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
var autoConnection = config.filter((item) => item.$autoConnect === true);
if (autoConnection.length > 0) {
    for (var connection of autoConnection) {
        autoConnect(connection.$provider);
    }
    ;
}
;
function readConfig() {
    if (!fs_1.default.existsSync(path_1.default.join(process.cwd(), "nexorm.config.ts")) && !fs_1.default.existsSync(path_1.default.join(process.cwd(), "nexorm.config.js"))) {
        console.log(chalk_1.default.red.bold("Configuration file not found. Please run ' nexorm init ' to initialize a new configuration file"));
        process.exit();
    }
    ;
    var config = {};
    try {
        const jsFile = (() => {
            try {
                return require(path_1.default.join(process.cwd(), "nexorm.config.js"))?.default;
            }
            catch (err) {
                return null;
            }
        })();
        const tsFile = (() => {
            try {
                if (isNestProject()) {
                    require('ts-node').register();
                    return require(path_1.default.join(process.cwd(), "nexorm.config.ts"))?.default;
                }
                else {
                    return require(path_1.default.join(process.cwd(), "nexorm.config.ts"))?.default;
                }
            }
            catch (err) {
                return null;
            }
        })();
        if (jsFile)
            config = jsFile;
        if (tsFile)
            config = tsFile;
        if (!config) {
            console.log(chalk_1.default.red.bold("Configuration file not found. Please run 'nexorm init' to initialize a new configuration file."));
            process.exit();
        }
    }
    catch (e) {
        console.log(chalk_1.default.red.bold("Error reading configuration file. Please check if the file is correctly formatted."));
        console.error(e);
        process.exit();
    }
    return config;
}
;
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
