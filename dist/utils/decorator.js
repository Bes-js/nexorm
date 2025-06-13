"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelEngine = exports.Nexorm = exports.models = void 0;
exports.AllowNull = AllowNull;
exports.UUID = UUID;
exports.Enum = Enum;
exports.AutoIncrement = AutoIncrement;
exports.Default = Default;
exports.Required = Required;
exports.Unique = Unique;
exports.Index = Index;
exports.PrimaryKey = PrimaryKey;
exports.ForeignKey = ForeignKey;
exports.Comment = Comment;
exports.Hash = Hash;
exports.Encrypt = Encrypt;
exports.Decrypt = Decrypt;
exports.Reference = Reference;
exports.OneToMany = OneToMany;
exports.OneToOne = OneToOne;
exports.ManyToOne = ManyToOne;
exports.ManyToMany = ManyToMany;
exports.CreatedAt = CreatedAt;
exports.UpdatedAt = UpdatedAt;
exports.DeletedAt = DeletedAt;
exports.IdColumn = IdColumn;
exports.Column = Column;
exports.Paranoid = Paranoid;
exports.Debug = Debug;
exports.Provider = Provider;
exports.Roles = Roles;
exports.Scopes = Scopes;
exports.Model = Model;
require("reflect-metadata");
const node_schedule_1 = require("node-schedule");
const uuid_1 = require("uuid");
const lodash_1 = __importDefault(require("lodash"));
const fileInspector_1 = require("./fileInspector");
const errorHandler_1 = __importDefault(require("./errorHandler"));
const cacheManager_1 = require("./util/cacheManager");
var schema = {};
var havePrimaryKey = false;
var haveAutoIncrement = {};
var primaryKeyCount = {};
var isWarned = false;
var models = [];
exports.models = models;
const export_1 = require("./functions/export");
const chalk_1 = __importDefault(require("chalk"));
const modelBuilder_1 = require("./modelBuilder");
const connectionManager_1 = require("./util/connectionManager");
/**
 * @name AllowNull
 * @description This decorator is used to define a column in the database.
 * @example @AllowNull
 * @public
 * @returns {void}
 */
function AllowNull(target, key) {
    if (!Reflect.hasMetadata(`allowNull-${target.name}`, target)) {
        Reflect.defineMetadata(`allowNull-${target.name}`, [], target);
    }
    const allowNullFields = Reflect.getMetadata(`allowNull-${target.name}`, target);
    allowNullFields.push(key);
    Reflect.defineMetadata(`allowNull-${target.name}`, allowNullFields, target);
}
;
/**
 * @name UUID
 * @description This decorator is used to define a column in the database.
 * @example @UUID(4)
 * @public
 * @param v
 * @returns {Function}
 */
function UUID(v) {
    return function (target, key) {
        var selectedUUID = { key: 'v4' };
        if (v instanceof Object) {
            if (v.v1)
                selectedUUID = { key: 'v1' };
            if (v.v4)
                selectedUUID = { key: 'v4' };
            if (v.v3)
                selectedUUID = { key: 'v3', namespace: v.v3.namespace, name: v.v3.name };
            if (v.v5)
                selectedUUID = { key: 'v5', namespace: v.v5.namespace, name: v.v5.name };
            if (v.v6)
                selectedUUID = { key: 'v6' };
            if (v.v7)
                selectedUUID = { key: 'v7' };
        }
        else {
            if (v == 1)
                selectedUUID = { key: 'v1' };
            if (v == 4)
                selectedUUID = { key: 'v4' };
            if (v == 6)
                selectedUUID = { key: 'v6' };
            if (v == 7)
                selectedUUID = { key: 'v7' };
        }
        ;
        var uuidVersionList = {
            v1: () => (0, uuid_1.v1)(),
            v3: (namespace, name) => (0, uuid_1.v3)(namespace, name),
            v4: () => (0, uuid_1.v4)(),
            v5: (namespace, name) => (0, uuid_1.v5)(namespace, name),
            v6: () => (0, uuid_1.v6)(),
            v7: () => (0, uuid_1.v7)(),
        };
        if (!Reflect.hasMetadata(`defaults-${target.name}`, target)) {
            Reflect.defineMetadata(`defaults-${target.name}`, {}, target);
        }
        const defaults = Reflect.getMetadata(`defaults-${target.name}`, target);
        defaults[key] = uuidVersionList[selectedUUID.key](selectedUUID.namespace || 'nexorm', selectedUUID.name || 'nexorm');
        Reflect.defineMetadata(`defaults-${target.name}`, defaults, target);
    };
}
/**
 * @name Enum
 * @description This decorator is used to define a column in the database.
 * @example @Enum
 * @public
 * @param values
 * @returns {Function}
 */
function Enum(values) {
    return function (target, key) {
        if (!Reflect.hasMetadata(`enum-${target.name}`, target)) {
            Reflect.defineMetadata(`enum-${target.name}`, {}, target);
        }
        const enums = Reflect.getMetadata(`enum-${target.name}`, target);
        enums[key] = values;
        Reflect.defineMetadata(`enum-${target.name}`, enums, target);
    };
}
;
/**
 * @name AutoIncrement
 * @description This decorator is used to define a column in the database.
 * @example @AutoIncrement
 * @public
 * @returns {void}
 */
function AutoIncrement(target, key) {
    if (!Reflect.hasMetadata(`autoIncrement-${target.name}`, target)) {
        Reflect.defineMetadata(`autoIncrement-${target.name}`, [], target);
    }
    ;
    if (!Reflect.hasMetadata(`primaryKey-${target.name}`, target)) {
        Reflect.defineMetadata(`primaryKey-${target.name}`, [], target);
    }
    ;
    if (!Reflect.hasMetadata(`defaults-${target.name}`, target)) {
        Reflect.defineMetadata(`defaults-${target.name}`, {}, target);
    }
    ;
    const autoIncrements = Reflect.getMetadata(`autoIncrement-${target.name}`, target);
    const primaryKey = Reflect.getMetadata(`primaryKey-${target.name}`, target);
    const defaults = Reflect.getMetadata(`defaults-${target.name}`, target);
    autoIncrements.push(key);
    primaryKey.push(key);
    defaults[key] = 0;
    Reflect.defineMetadata(`autoIncrement-${target.name}`, autoIncrements, target);
}
;
/**
 * @name Default
 * @description This decorator is used to define a column in the database.
 * @example @Default
 * @public
 * @param value
 * @returns {Function}
 */
function Default(value) {
    return function (target, key) {
        if (!Reflect.hasMetadata(`defaults-${target.name}`, target)) {
            Reflect.defineMetadata(`defaults-${target.name}`, {}, target);
        }
        const defaults = Reflect.getMetadata(`defaults-${target.name}`, target);
        defaults[key] = value;
        Reflect.defineMetadata(`defaults-${target.name}`, defaults, target);
    };
}
;
/**
 * @name Required
 * @description This decorator is used to define a column in the database.
 * @example @Required
 * @public
 * @returns {void}
 */
function Required(target, key) {
    if (!Reflect.hasMetadata(`required-${target.name}`, target)) {
        Reflect.defineMetadata(`required-${target.name}`, [], target);
    }
    const requiredFields = Reflect.getMetadata(`required-${target.name}`, target);
    requiredFields.push(key);
    Reflect.defineMetadata(`required-${target.name}`, requiredFields, target);
}
;
/**
 * @name Unique
 * @description This decorator is used to define a column in the database.
 * @example @Unique
 * @public
 * @returns {void}
 */
function Unique(target, key) {
    if (!Reflect.hasMetadata(`unique-${target.name}`, target)) {
        Reflect.defineMetadata(`unique-${target.name}`, [], target);
    }
    const uniqueFields = Reflect.getMetadata(`unique-${target.name}`, target);
    uniqueFields.push(key);
    Reflect.defineMetadata(`unique-${target.name}`, uniqueFields, target);
}
;
/**
 * @name Index
 * @description This decorator is used to define a column in the database.
 * @example @Index
 * @public
 * @returns {void}
 */
function Index(target, key) {
    if (!Reflect.hasMetadata(`index-${target.name}`, target)) {
        Reflect.defineMetadata(`index-${target.name}`, [], target);
    }
    const indexFields = Reflect.getMetadata(`index-${target.name}`, target);
    indexFields.push(key);
    Reflect.defineMetadata(`index-${target.name}`, indexFields, target);
}
;
/**
 * @name PrimaryKey
 * @description This decorator is used to define a column in the database.
 * @example @PrimaryKey
 * @public
 * @returns {void}
 */
function PrimaryKey(target, key) {
    if (!Reflect.hasMetadata(`primaryKey-${target.name}`, target)) {
        Reflect.defineMetadata(`primaryKey-${target.name}`, [], target);
    }
    const primaryKeyFields = Reflect.getMetadata(`primaryKey-${target.name}`, target);
    primaryKeyFields.push(key);
    if (primaryKeyCount[target.name] == undefined) {
        primaryKeyCount[target.name] = 1;
    }
    else {
        primaryKeyCount[target.name]++;
    }
    ;
    Reflect.defineMetadata(`primaryKey-${target.name}`, primaryKeyFields, target);
}
;
/**
 * @name ForeignKey
 * @description This decorator is used to define a foreign key in the database.
 * @example @ForeignKey
 * @public
 * @param target
 * @param key
 * @returns {void}
 * @throws {Error}
 **/
function ForeignKey(relatedModel) {
    return function (target, key) {
        if (!Reflect.hasMetadata(`foreignKey-${target.name}`, target)) {
            Reflect.defineMetadata(`foreignKey-${target.name}`, {}, target);
        }
        const foreignKeyFields = Reflect.getMetadata(`foreignKey-${target.name}`, target);
        foreignKeyFields['key'] = key;
        foreignKeyFields['relatedModel'] = relatedModel;
        Reflect.defineMetadata(`foreignKey-${target.name}`, foreignKeyFields, target);
    };
}
;
/**
 * @name Comment
 * @description This decorator is used to define a column in the database.
 * @example @Comment
 * @public
 * @param comment
 * @returns {Function}
 */
function Comment(comment) {
    return function (target, key) {
        if (!Reflect.hasMetadata(`comments-${target.name}`, target)) {
            Reflect.defineMetadata(`comments-${target.name}`, {}, target);
        }
        const comments = Reflect.getMetadata(`comments-${target.name}`, target);
        comments[key] = comment;
        Reflect.defineMetadata(`comments-${target.name}`, comments, target);
    };
}
;
/**
 * @name Hash
 * @description This decorator is used to define a column in the database.
 * @example @Hash
 * @public
 * @param method
 * @param digest
 * @returns {Function}
 */
function Hash(method, digest) {
    if (!method) {
        throw new errorHandler_1.default('Method is required', '#FF0000');
    }
    ;
    if (!digest)
        digest = 'hex';
    return function (target, key) {
        if (!Reflect.hasMetadata(`hash-${target.name}`, target)) {
            Reflect.defineMetadata(`hash-${target.name}`, {}, target);
        }
        const hash = Reflect.getMetadata(`hash-${target.name}`, target);
        hash[key] = { method, digest };
        Reflect.defineMetadata(`hash-${target.name}`, hash, target);
    };
}
;
/**
 * @name Encrypt
 * @description This decorator is used to define a column in the database.
 * @example @Encrypt
 * @public
 * @param method
 * @param cipherKey
 * @param iv
 * @returns {Function}
 * @throws {Error}
 */
function Encrypt(method, cipherKey, iv) {
    if (!method) {
        throw new errorHandler_1.default('Method is required', '#FF0000');
    }
    ;
    if (!cipherKey) {
        throw new errorHandler_1.default('Cipher Key is required', '#FF0000');
    }
    ;
    if (!iv) {
        throw new errorHandler_1.default('IV is required', '#FF0000');
    }
    ;
    return function (target, key) {
        if (!Reflect.hasMetadata(`encrypt-${target.name}`, target)) {
            Reflect.defineMetadata(`encrypt-${target.name}`, {}, target);
        }
        ;
        const encrypt = Reflect.getMetadata(`encrypt-${target.name}`, target);
        encrypt[key] = { method, cipherKey, iv };
        Reflect.defineMetadata(`encrypt-${target.name}`, encrypt, target);
    };
}
;
/**
 * @name Decrypt
 * @description This decorator is used to define a column in the database.
 * @example @Decrypt
 * @public
 * @param method
 * @param cipherKey
 * @param iv
 * @returns {Function}
 * @throws {Error}
 */
function Decrypt(method, cipherKey, iv) {
    if (!method) {
        throw new errorHandler_1.default('Method is required', '#FF0000');
    }
    ;
    if (!cipherKey) {
        throw new errorHandler_1.default('Cipher Key is required', '#FF0000');
    }
    ;
    if (!iv) {
        throw new errorHandler_1.default('IV is required', '#FF0000');
    }
    ;
    return function (target, key) {
        if (!Reflect.hasMetadata(`decrypt-${target.name}`, target)) {
            Reflect.defineMetadata(`decrypt-${target.name}`, {}, target);
        }
        ;
        const decrypt = Reflect.getMetadata(`decrypt-${target.name}`, target);
        decrypt[key] = { method, cipherKey, iv };
        Reflect.defineMetadata(`decrypt-${target.name}`, decrypt, target);
    };
}
;
/**
 * @name Reference
 * @description This decorator is used to define a column in the database.
 * @example @Reference
 * @public
 * @param value
 * @returns {Function}
 */
function Reference(value) {
    return function (target, key) {
        if (!Reflect.hasMetadata(`references-${target.name}`, target)) {
            Reflect.defineMetadata(`references-${target.name}`, {}, target);
        }
        const references = Reflect.getMetadata(`references-${target.name}`, target);
        references[key] = value;
        Reflect.defineMetadata(`references-${target.name}`, references, target);
    };
}
;
;
;
;
;
/* Relationship */
function OneToMany(relatedModel, inverse, options) {
    return function (target, propertyKey) {
        if (!propertyKey) {
            throw new errorHandler_1.default('Property key is required for OneToMany relationship', '#FF0000');
        }
        if (!Reflect.hasMetadata(`oneToMany-${target.name}`, target)) {
            Reflect.defineMetadata(`oneToMany-${target.name}`, {}, target);
        }
        const oneToMany = Reflect.getMetadata(`oneToMany-${target.name}`, target);
        oneToMany[propertyKey] = { relatedModel, inverse, options, sourcePop: String(propertyKey) };
        Reflect.defineMetadata(`oneToMany-${target.name}`, oneToMany, target);
    };
}
function OneToOne(relatedModel, inverse, options) {
    return function (target, propertyKey) {
        if (!propertyKey) {
            throw new errorHandler_1.default('Property key is required for OneToOne relationship', '#FF0000');
        }
        if (!Reflect.hasMetadata(`oneToOne-${target.name}`, target)) {
            Reflect.defineMetadata(`oneToOne-${target.name}`, {}, target);
        }
        const oneToOne = Reflect.getMetadata(`oneToOne-${target.name}`, target);
        oneToOne[propertyKey] = { relatedModel, inverse, options, sourcePop: String(propertyKey) };
        Reflect.defineMetadata(`oneToOne-${target.name}`, oneToOne, target);
    };
}
function ManyToOne(relatedModel, inverse, options) {
    return function (target, propertyKey) {
        if (!propertyKey) {
            throw new errorHandler_1.default('Property key is required for ManyToOne relationship', '#FF0000');
        }
        if (!Reflect.hasMetadata(`manyToOne-${target.name}`, target)) {
            Reflect.defineMetadata(`manyToOne-${target.name}`, {}, target);
        }
        const manyToOne = Reflect.getMetadata(`manyToOne-${target.name}`, target);
        manyToOne[propertyKey] = { relatedModel, inverse, options, sourcePop: String(propertyKey) };
        Reflect.defineMetadata(`manyToOne-${target.name}`, manyToOne, target);
    };
}
function ManyToMany(relatedModel, inverse, options) {
    return function (target, propertyKey) {
        if (!propertyKey) {
            throw new errorHandler_1.default('Property key is required for ManyToMany relationship', '#FF0000');
        }
        if (!Reflect.hasMetadata(`manyToMany-${target.name}`, target)) {
            Reflect.defineMetadata(`manyToMany-${target.name}`, {}, target);
        }
        const manyToMany = Reflect.getMetadata(`manyToMany-${target.name}`, target);
        manyToMany[propertyKey] = { relatedModel, inverse, options, sourcePop: String(propertyKey) };
        Reflect.defineMetadata(`manyToMany-${target.name}`, manyToMany, target);
    };
}
/*        */
function CreatedAt(target, key) {
    if (!String(target[key]).includes('Date'))
        throw new errorHandler_1.default(`The column "${key}" is not a Date type. Please ensure that the column type is correct and follows the expected naming conventions.`, '#FF0000');
    Reflect.defineMetadata(`createdAt-${target.name}`, key, target);
}
;
function UpdatedAt(target, key) {
    if (!String(target[key]).includes('Date'))
        throw new errorHandler_1.default(`The column "${key}" is not a Date type. Please ensure that the column type is correct and follows the expected naming conventions.`, '#FF0000');
    Reflect.defineMetadata(`updatedAt-${target.name}`, key, target);
}
;
function DeletedAt(target, key) {
    if (!String(target[key]).includes('Date'))
        throw new errorHandler_1.default(`The column "${key}" is not a Date type. Please ensure that the column type is correct and follows the expected naming conventions.`, '#FF0000');
    Reflect.defineMetadata(`deletedAt-${target.name}`, key, target);
}
;
function IdColumn(target, key) {
    /* Push to rows */
    if (['name'].includes(String(key)))
        throw new errorHandler_1.default(`The column name "${key}" is invalid. Please ensure that the column name is correct and follows the expected naming conventions.`, '#FF0000');
    if (!Reflect.hasMetadata(`rows-${target.name}`, target)) {
        Reflect.defineMetadata(`rows-${target.name}`, [], target);
    }
    const rows = Reflect.getMetadata(`rows-${target.name}`, target);
    rows.push({ key, keyType: target[key] });
    Reflect.defineMetadata(`rows-${target.name}`, rows, target);
    /* Define AutoIncrement */
    if (!Reflect.hasMetadata(`autoIncrement-${target.name}`, target)) {
        Reflect.defineMetadata(`autoIncrement-${target.name}`, [], target);
    }
    ;
    if (!Reflect.hasMetadata(`primaryKey-${target.name}`, target)) {
        Reflect.defineMetadata(`primaryKey-${target.name}`, [], target);
    }
    ;
    if (!Reflect.hasMetadata(`defaults-${target.name}`, target)) {
        Reflect.defineMetadata(`defaults-${target.name}`, {}, target);
    }
    ;
    const autoIncrements = Reflect.getMetadata(`autoIncrement-${target.name}`, target);
    const primaryKey = Reflect.getMetadata(`primaryKey-${target.name}`, target);
    const defaults = Reflect.getMetadata(`defaults-${target.name}`, target);
    autoIncrements.push(key);
    primaryKey.push(key);
    defaults[key] = 0;
    Reflect.defineMetadata(`autoIncrement-${target.name}`, autoIncrements, target);
}
;
function Column(target, key) {
    if (['name'].includes(String(key)))
        throw new errorHandler_1.default(`The column name "${key}" is invalid. Please ensure that the column name is correct and follows the expected naming conventions.`, '#FF0000');
    if (!Reflect.hasMetadata(`rows-${target.name}`, target)) {
        Reflect.defineMetadata(`rows-${target.name}`, [], target);
    }
    const rows = Reflect.getMetadata(`rows-${target.name}`, target);
    rows.push({ key, keyType: target[key] });
    Reflect.defineMetadata(`rows-${target.name}`, rows, target);
}
;
function Paranoid(target) {
    Reflect.defineMetadata(`paranoid-${target.name}`, true, target);
}
;
function Debug(target) {
    Reflect.defineMetadata(`debug-${target.name}`, true, target);
}
;
function Provider(providerName) {
    return function (target) {
        Reflect.defineMetadata(`databaseName-${target.name}`, providerName, target);
    };
}
;
function Roles(roles) {
    return function (target) {
        Reflect.defineMetadata(`roles-${target.name}`, roles, target);
    };
}
;
function Scopes(scopes) {
    return function (target) {
        Reflect.defineMetadata(`scopes-${target.name}`, scopes, target);
    };
}
;
;
;
;
;
;
;
;
/**
 * Nexorm
 * @description Nexorm Main Class
 * @class Nexorm
 * @public
 * @async
 * @type {Class}
 * @example import Nexorm from 'nexorm';
 * @returns {Class}
 */
class Nexorm {
    /**
     * Nexorm Config
     * @type {NexormConfig}
     * @public
     * @static
     * @example Nexorm.$config
     */
    static $configs = fileInspector_1.cachedConfig;
    /**
     * Nexorm Providers
     * @type {string[]}
     * @public
     * @static
     * @example Nexorm.$providers
     */
    static $providers = fileInspector_1.sequelizes.map(x => x.name);
    /**
     * Nexorm Scheduled Jobs
     * @static
     * @public
     * @example Nexorm.$crons
     * @description Get All Scheduled Jobs
     * @example Nexorm.$crons.$every()
     * @example Nexorm.$crons.$get('jobName')
     * @returns {Object}
     */
    static $crons = {
        /**
         * Get All Scheduled Jobs
         * @returns {Job[]}
         * @example Nexorm.$crons.$every()
         * @description Get All Scheduled Jobs
         */
        $every: () => {
            return Object.values(node_schedule_1.scheduledJobs);
        },
        /**
         * Get Scheduled Job by Name
         * @param {string} name - Job Name
         * @returns {Job | undefined}
         * @example Nexorm.$crons.$get('jobName')
         * @description Get Scheduled Job by Name
         */
        $get: (name) => {
            return node_schedule_1.scheduledJobs[name];
        },
        /**
         * Add a Scheduled Job
         * @param {string} name - Job Name
         * @param {string} cron - Cron Expression
         * @param {() => void} callback - Callback Function
         * @returns {Job}
         * @example Nexorm.$crons.$addSchedule('jobName', '0 0 * * *', () => { console.log('Job executed'); })
         * @description Add a Scheduled Job
         */
        $addSchedule: (name, cron, callback) => {
            if (node_schedule_1.scheduledJobs[name]) {
                throw new errorHandler_1.default(`Cron Job with name ${name} already exists`, '#FF0000');
            }
            ;
            if (!cron || !callback) {
                throw new errorHandler_1.default('Cron Job name, cron expression and callback function are required', '#FF0000');
            }
            ;
            if (typeof cron !== 'string') {
                throw new errorHandler_1.default('Cron Job cron expression must be a string', '#FF0000');
            }
            ;
            if (typeof callback !== 'function') {
                throw new errorHandler_1.default('Cron Job callback must be a function', '#FF0000');
            }
            ;
            (0, node_schedule_1.scheduleJob)(name, cron, callback);
            return node_schedule_1.scheduledJobs[name];
        },
        /**
         * Cancel a Scheduled Job
         * @param {string} name - Job Name
         * @returns {boolean}
         * @example Nexorm.$crons.$cancel('jobName')
         * @description Cancel a Scheduled Job
         */
        $cancel: (name) => {
            if (node_schedule_1.scheduledJobs[name]) {
                node_schedule_1.scheduledJobs[name].cancel();
                delete node_schedule_1.scheduledJobs[name];
                return true;
            }
            ;
            return false;
        },
        /**
         * Cancel All Scheduled Jobs
         * @returns {boolean}
         * @example Nexorm.$crons.$cancelAll()
         * @description Cancel All Scheduled Jobs
         */
        $cancelAll: () => {
            Object.keys(node_schedule_1.scheduledJobs).forEach((name) => {
                node_schedule_1.scheduledJobs[name].cancel();
                delete node_schedule_1.scheduledJobs[name];
            });
            return true;
        },
    };
    /**
     * Nexorm Connections
     * @type {Object}
     * @public
     * @static
     * @example Nexorm.$connections.$size
     * @example Nexorm.$connections.$list
     * @returns {Object}
     * @description Get All Connections
     * @example Nexorm.$connections
     */
    static $connections = { $size: fileInspector_1.connections.length, $list: fileInspector_1.connections };
    /**
     * Connect To Database
     * @param providerName Provider Name
     * @returns Promise<void>
     * @example await Nexorm.$connect('nexorm')
     */
    static async $connect(providerName) {
        if (!providerName)
            providerName = 'nexorm';
        if (fileInspector_1.connections.find(x => x == providerName)) {
            throw new errorHandler_1.default('Connection Already Exists, Try Again by Trying Other Providers Or You\'re Already Connected', '#FF0000');
        }
        ;
        return await (0, fileInspector_1.connect)(providerName);
    }
    ;
    /**
     * Disconnect From Database
     * @param providerName Provider Name
     * @returns Promise<void>
     * @example await Nexorm.$disconnect('nexorm')
     */
    static async $disconnect(providerName) {
        if (!providerName)
            providerName = 'nexorm';
        if (!fileInspector_1.connections.find(x => x == providerName)) {
            throw new errorHandler_1.default('Connection Not Found, Try Again by Trying Other Providers Or You\'re Already Disconnected', '#FF0000');
        }
        ;
        await (0, fileInspector_1.closeConnection)(providerName);
    }
    ;
    /**
     * Drop Database
     * @param providerName Provider Name
     * @returns Promise<void>
     * @example await Nexorm.$drop('nexorm')
     */
    static async $drop(providerName) {
        if (!providerName)
            providerName = 'nexorm';
        if (!fileInspector_1.connections.find(x => x == providerName)) {
            throw new errorHandler_1.default('Connection Not Found, Try Again by Trying Other Providers Or You\'re Already Disconnected', '#FF0000');
        }
        ;
        await (0, fileInspector_1.dropProvider)(providerName);
    }
    ;
    /**
     * Close All Connections
     * @returns Promise<void>
     * @example await Nexorm.$closeAllConnections()
     * @description Close All Connections
     */
    static async $closeAllConnections() {
        for (var i = 0; i < fileInspector_1.connections.length; i++) {
            await (0, fileInspector_1.closeConnection)(fileInspector_1.connections[i]);
        }
        ;
    }
    ;
    /**
     * Connect All Providers
     * @returns Promise<void>
     * @example await Nexorm.$connectAll()
     * @description Connect All Providers
     */
    static async $connectAll() {
        await (0, fileInspector_1.connectAll)();
    }
    ;
    /**
     * Transaction
     * @param providerName Provider Name
     * @returns Promise<Transaction>
     * @example await Nexorm.$transaction('nexorm')
     * @description Create a Transaction
     */
    static async $transaction(providerName) {
        if (!providerName)
            providerName = 'nexorm';
        await connectionManager_1.ConnectionManager.waitUntilConnected(providerName);
        const sequelize = fileInspector_1.sequelizes.find(x => x.name === providerName);
        if (!sequelize || !sequelize.sequelize) {
            throw new errorHandler_1.default(`Sequelize provider "${providerName}" not found.`, '#FF0000');
        }
        ;
        const trx = await sequelize.sequelize.transaction();
        const wrapped = returnTransaction(trx, providerName);
        return wrapped;
    }
    ;
}
exports.Nexorm = Nexorm;
;
function returnTransaction(transaction, providerName) {
    const DynamicClass = class {
        trx;
        $id;
        $provider;
        $commit;
        $rollback;
        $afterCommit;
        constructor() {
            this.trx = transaction;
            this.$id = transaction.id;
            this.$provider = providerName;
            this.$commit = () => transaction.commit();
            this.$rollback = () => transaction.rollback();
            this.$afterCommit = (callback) => {
                if (typeof callback !== 'function') {
                    throw new errorHandler_1.default('Callback must be a function', '#FF0000');
                }
                ;
                transaction.afterCommit(callback);
            };
            Object.defineProperty(this, 'trx', {
                enumerable: false,
                writable: false,
                configurable: false,
            });
        }
    };
    Object.defineProperty(DynamicClass, 'name', { value: 'Transaction' });
    return new DynamicClass();
}
;
async function getConfigByProvider(providerName) {
    const config = await (0, fileInspector_1.readConfig)().catch((err) => { return undefined; });
    if (!config) {
        throw new errorHandler_1.default('Nexorm Config Not Found, Please Create a Config File', '#FF0000');
    }
    ;
    var providerConfig = config.find((x) => x.$provider == providerName);
    if (!providerConfig) {
        throw new errorHandler_1.default(`Nexorm Config Not Found For Provider: ${providerName}, Please Create a Config File`, '#FF0000');
    }
    ;
    return providerConfig;
}
;
;
function Model(Schema) {
    const modelEngine = new ModelEngine(Schema);
    const engine = modelEngine.initialize();
    const DynamicModel = class {
        #isNew = false;
        constructor(dataValue) {
            this.#isNew = true;
            /* Define Properties */
            if (dataValue) {
                Object.keys(dataValue)
                    .filter((key) => !['length', 'name', 'prototype'].includes(key))
                    .forEach((key) => {
                    this[key] = dataValue ? dataValue[key] : undefined;
                });
            }
            ;
            /* Hide Properties */
            Object.defineProperty(this, '$toObject', { enumerable: false, configurable: false, writable: false });
            Object.defineProperty(this, '$save', { enumerable: false, configurable: false, writable: false });
            Object.defineProperty(this, '$get', { enumerable: false, configurable: false, writable: false });
            Object.defineProperty(this, '$set', { enumerable: false, configurable: false, writable: false });
            Object.defineProperty(this, '$clear', { enumerable: false, configurable: false, writable: false });
            Object.defineProperty(this, '$toJSON', { enumerable: false, configurable: false, writable: false });
            Object.defineProperty(this, '$toStringify', { enumerable: false, configurable: false, writable: false });
            Object.defineProperty(this, '$isNew', { enumerable: false, configurable: false, writable: false });
        }
        ;
        /* Initialize Engine */
        $get = (property) => {
            var value = this[property];
            if (value) {
                return value;
            }
            ;
            return null;
        };
        $set = (property, value) => {
            this[property] = value;
            return this[property];
        };
        $clear = () => {
            Object.keys(this).forEach((key) => {
                if (String(key).startsWith('$') ||
                    String(key) == 'length' ||
                    String(key) == 'name' ||
                    String(key) == 'prototype' ||
                    String(key) == 'constructor' ||
                    ['toObject', 'save', 'toJSON', 'toStringify', 'clear', 'get', 'set', 'isNew'].includes(String(key)))
                    return;
                delete this[key];
            });
        };
        $toJSON = () => {
            try {
                return JSON.parse(JSON.stringify(this.$toObject()));
            }
            catch (error) {
                return {};
            }
        };
        $toStringify = () => {
            try {
                return JSON.stringify(this.$toObject());
            }
            catch (error) {
                return '';
            }
        };
        $toObject = () => Object.assign({}, this);
        $isNew = () => {
            return this.#isNew;
        };
        $save = async (dataValue) => {
            if (!dataValue)
                dataValue = {};
            await this.#constructorInitialize();
            await connectionManager_1.ConnectionManager.connectIfNotConnected(engine.$provider);
            if (engine.$config && engine.$config.$autoConnect) {
                await connectionManager_1.ConnectionManager.connectIfNotConnected(engine.$provider);
            }
            else {
                await connectionManager_1.ConnectionManager.waitUntilConnected(engine.$provider);
            }
            ;
            if (engine.$debugMode)
                debugLog(`Saving Data: ${engine.$schema.name} - dataValue: ${JSON.stringify(dataValue)}`);
            var dataValues = this.#isNew ?
                await engine.$build({ ...this.$toObject(), ...dataValue }) :
                await engine.$update({ $where: { ObjectId: this?.ObjectId }, $update: { $set: { ...this.$toObject(), ...dataValue } } });
            if (this.#isNew)
                this.#isNew = false;
            if (dataValues) {
                Object.keys(dataValues).forEach((key) => {
                    if (String(key).startsWith('$') ||
                        String(key) == 'length' ||
                        String(key) == 'name' ||
                        String(key) == 'prototype' ||
                        String(key) == 'constructor' ||
                        ['toObject', 'save', 'toJSON', 'toStringify', 'clear', 'get', 'set', 'isNew'].includes(String(key)))
                        return;
                    this[key] = dataValues[key];
                });
            }
            ;
            return dataValues;
        };
        /*                          */
        static $search = async (values) => {
            await this.#initialize();
            if (engine.$config && engine.$config.$autoConnect) {
                await connectionManager_1.ConnectionManager.connectIfNotConnected(engine.$provider);
            }
            else {
                await connectionManager_1.ConnectionManager.waitUntilConnected(engine.$provider);
            }
            ;
            return engine.$search(values);
        };
        static $searchFirst = async () => {
            await this.#initialize();
            if (engine.$config && engine.$config.$autoConnect) {
                await connectionManager_1.ConnectionManager.connectIfNotConnected(engine.$provider);
            }
            else {
                await connectionManager_1.ConnectionManager.waitUntilConnected(engine.$provider);
            }
            ;
            return engine.$searchFirst();
        };
        static $searchOne = async (values) => {
            await this.#initialize();
            if (engine.$config && engine.$config.$autoConnect) {
                await connectionManager_1.ConnectionManager.connectIfNotConnected(engine.$provider);
            }
            else {
                await connectionManager_1.ConnectionManager.waitUntilConnected(engine.$provider);
            }
            ;
            return engine.$searchOne(values);
        };
        static $searchById = async (values) => {
            await this.#initialize();
            if (engine.$config && engine.$config.$autoConnect) {
                await connectionManager_1.ConnectionManager.connectIfNotConnected(engine.$provider);
            }
            else {
                await connectionManager_1.ConnectionManager.waitUntilConnected(engine.$provider);
            }
            ;
            return engine.$searchById(values);
        };
        static $searchByIds = async (values) => {
            await this.#initialize();
            if (engine.$config && engine.$config.$autoConnect) {
                await connectionManager_1.ConnectionManager.connectIfNotConnected(engine.$provider);
            }
            else {
                await connectionManager_1.ConnectionManager.waitUntilConnected(engine.$provider);
            }
            ;
            return engine.$searchByIds(values);
        };
        static $searchAndCount = async (values) => {
            await this.#initialize();
            if (engine.$config && engine.$config.$autoConnect) {
                await connectionManager_1.ConnectionManager.connectIfNotConnected(engine.$provider);
            }
            else {
                await connectionManager_1.ConnectionManager.waitUntilConnected(engine.$provider);
            }
            ;
            return engine.$searchAndCount(values);
        };
        static $everything = async () => {
            await this.#initialize();
            if (engine.$config && engine.$config.$autoConnect) {
                await connectionManager_1.ConnectionManager.connectIfNotConnected(engine.$provider);
            }
            else {
                await connectionManager_1.ConnectionManager.waitUntilConnected(engine.$provider);
            }
            ;
            return engine.$everything();
        };
        static $count = async (values) => {
            await this.#initialize();
            if (engine.$config && engine.$config.$autoConnect) {
                await connectionManager_1.ConnectionManager.connectIfNotConnected(engine.$provider);
            }
            else {
                await connectionManager_1.ConnectionManager.waitUntilConnected(engine.$provider);
            }
            ;
            return engine.$count(values);
        };
        static $query = async (values) => {
            await this.#initialize();
            if (engine.$config && engine.$config.$autoConnect) {
                await connectionManager_1.ConnectionManager.connectIfNotConnected(engine.$provider);
            }
            else {
                await connectionManager_1.ConnectionManager.waitUntilConnected(engine.$provider);
            }
            ;
            return engine.$query(values);
        };
        static $distinct = async (values) => {
            await this.#initialize();
            if (engine.$config && engine.$config.$autoConnect) {
                await connectionManager_1.ConnectionManager.connectIfNotConnected(engine.$provider);
            }
            else {
                await connectionManager_1.ConnectionManager.waitUntilConnected(engine.$provider);
            }
            ;
            return engine.$distinct(values);
        };
        static $scope = (scope, values) => {
            return engine.$scope(scope, values);
        };
        static $build = async (values) => {
            await this.#initialize();
            if (engine.$config && engine.$config.$autoConnect) {
                await connectionManager_1.ConnectionManager.connectIfNotConnected(engine.$provider);
            }
            else {
                await connectionManager_1.ConnectionManager.waitUntilConnected(engine.$provider);
            }
            ;
            return engine.$build(values);
        };
        static $buildMany = async (values) => {
            await this.#initialize();
            if (engine.$config && engine.$config.$autoConnect) {
                await connectionManager_1.ConnectionManager.connectIfNotConnected(engine.$provider);
            }
            else {
                await connectionManager_1.ConnectionManager.waitUntilConnected(engine.$provider);
            }
            ;
            return engine.$buildMany(values);
        };
        static $searchAndReplace = async (values) => {
            await this.#initialize();
            if (engine.$config && engine.$config.$autoConnect) {
                await connectionManager_1.ConnectionManager.connectIfNotConnected(engine.$provider);
            }
            else {
                await connectionManager_1.ConnectionManager.waitUntilConnected(engine.$provider);
            }
            ;
            return engine.$searchAndReplace(values);
        };
        static $update = async (values) => {
            await this.#initialize();
            if (engine.$config && engine.$config.$autoConnect) {
                await connectionManager_1.ConnectionManager.connectIfNotConnected(engine.$provider);
            }
            else {
                await connectionManager_1.ConnectionManager.waitUntilConnected(engine.$provider);
            }
            ;
            return engine.$update(values);
        };
        static $updateMany = async (values) => {
            await this.#initialize();
            if (engine.$config && engine.$config.$autoConnect) {
                await connectionManager_1.ConnectionManager.connectIfNotConnected(engine.$provider);
            }
            else {
                await connectionManager_1.ConnectionManager.waitUntilConnected(engine.$provider);
            }
            ;
            return engine.$updateMany(values);
        };
        static $upsert = async (values) => {
            await this.#initialize();
            if (engine.$config && engine.$config.$autoConnect) {
                await connectionManager_1.ConnectionManager.connectIfNotConnected(engine.$provider);
            }
            else {
                await connectionManager_1.ConnectionManager.waitUntilConnected(engine.$provider);
            }
            ;
            return engine.$upsert(values);
        };
        static $delete = async (values) => {
            await this.#initialize();
            if (engine.$config && engine.$config.$autoConnect) {
                await connectionManager_1.ConnectionManager.connectIfNotConnected(engine.$provider);
            }
            else {
                await connectionManager_1.ConnectionManager.waitUntilConnected(engine.$provider);
            }
            ;
            return engine.$delete(values);
        };
        static $deleteMany = async (values) => {
            await this.#initialize();
            if (engine.$config && engine.$config.$autoConnect) {
                await connectionManager_1.ConnectionManager.connectIfNotConnected(engine.$provider);
            }
            else {
                await connectionManager_1.ConnectionManager.waitUntilConnected(engine.$provider);
            }
            ;
            return engine.$deleteMany(values);
        };
        static $restore = async (values) => {
            await this.#initialize();
            if (engine.$config && engine.$config.$autoConnect) {
                await connectionManager_1.ConnectionManager.connectIfNotConnected(engine.$provider);
            }
            else {
                await connectionManager_1.ConnectionManager.waitUntilConnected(engine.$provider);
            }
            ;
            return engine.$restore(values);
        };
        static $softDelete = async (values) => {
            await this.#initialize();
            if (engine.$config && engine.$config.$autoConnect) {
                await connectionManager_1.ConnectionManager.connectIfNotConnected(engine.$provider);
            }
            else {
                await connectionManager_1.ConnectionManager.waitUntilConnected(engine.$provider);
            }
            ;
            return engine.$softDelete(values);
        };
        static $softDeleteMany = async (values) => {
            await this.#initialize();
            if (engine.$config && engine.$config.$autoConnect) {
                await connectionManager_1.ConnectionManager.connectIfNotConnected(engine.$provider);
            }
            else {
                await connectionManager_1.ConnectionManager.waitUntilConnected(engine.$provider);
            }
            ;
            return engine.$softDeleteMany(values);
        };
        static $truncate = async () => {
            await this.#initialize();
            if (engine.$config && engine.$config.$autoConnect) {
                await connectionManager_1.ConnectionManager.connectIfNotConnected(engine.$provider);
            }
            else {
                await connectionManager_1.ConnectionManager.waitUntilConnected(engine.$provider);
            }
            ;
            return engine.$truncate();
        };
        static $cache = engine.$cache;
        static $debugMode = engine.$debugMode;
        static $hooks = engine.$hooks;
        static $middlewares = engine.$middlewares;
        static $model = engine.$model;
        static $schema = engine.$schema;
        static $provider = engine.$provider;
        static $config = engine.$config;
        /* Initialize */
        /**
         * Initialize the model
         * @returns Promise<boolean>
         * @private
         */
        /********/
        static async #initialize() {
            if (this.$config)
                return true;
            var config = await getConfigByProvider(engine.$provider).catch((err) => { });
            if (!config)
                return false;
            engine.$config = config;
            this.$config = config;
            return true;
        }
        ;
        async #constructorInitialize() {
            if (engine.$config)
                return true;
            var config = await getConfigByProvider(engine.$provider).catch((err) => { });
            if (!config)
                return false;
            engine.$config = config;
        }
        ;
    };
    Object.defineProperty(DynamicModel, 'name', { value: Schema.name });
    return DynamicModel;
}
;
;
class ModelEngine {
    Schema;
    $type;
    $model;
    $middlewares = [];
    $cache = new cacheManager_1.CacheManager();
    $config;
    ;
    $debugMode = false;
    $schema;
    $provider;
    constructor(Schema) {
        this.Schema = Schema;
        this.$provider = Reflect.getMetadata(`databaseName-${Schema.name}`, Schema) || 'nexorm';
        this.$schema = Schema;
        this.$middlewares = [];
        if (!String(Schema).includes("class"))
            throw new errorHandler_1.default('Schema Must Be A Static Class', '#FF0000');
        var debug = Reflect.getMetadata(`debug-${this.$schema.name}`, this.$schema) || false;
        this.$debugMode = debug;
    }
    ;
    initialize() {
        return this;
    }
    ;
    /**
     * Scope
     *
     */
    $scope(scopes, ...args) {
        var scope = {};
        if (typeof scopes === 'string') {
            var getScopes = Reflect.getMetadata(`scopes-${this.$schema.name}`, this.$schema) || {};
            if (!getScopes[scopes]) {
                throw new errorHandler_1.default(`Scope ${scopes} Not Found`, '#FF0000');
            }
            ;
            if (typeof getScopes[scopes] == 'function') {
                scope = getScopes[scopes](...args);
            }
            else {
                scope = getScopes[scopes];
            }
        }
        else if (lodash_1.default.isArray(scopes)) {
            var getScopes = Reflect.getMetadata(`scopes-${this.$schema.name}`, this.$schema) || {};
            for (var i = 0; i < scopes.length; i++) {
                if (!getScopes[scopes[i]]) {
                    throw new errorHandler_1.default(`Scope ${scopes[i]} Not Found`, '#FF0000');
                }
                ;
                if (typeof getScopes[scopes[i]] == 'function') {
                    scope = { ...scope, ...getScopes[scopes[i]](...args) };
                }
                else {
                    scope = { ...scope, ...getScopes[scopes[i]] };
                }
            }
            ;
        }
        ;
        if (Object.keys(scope).length === 0) {
            throw new errorHandler_1.default('Scope Not Found', '#FF0000');
        }
        ;
        return {
            /* İnitalize yapılcak ModelEngine Kımsındaki gibi wait untilli yer gibi */
            $searchOne: async (query) => {
                var searchQuery = { ...scope?.$where, ...query?.$where };
                var optionsQuery = { ...scope?.$options, ...query?.$options };
                if (this.$config && this.$config.$autoConnect) {
                    await connectionManager_1.ConnectionManager.connectIfNotConnected(this.$provider);
                }
                else {
                    await connectionManager_1.ConnectionManager.waitUntilConnected(this.$provider);
                }
                ;
                if (this.$debugMode)
                    debugLog(`Searching One Data: ${this.$schema.name} - $where: ${JSON.stringify(searchQuery)} - $options: ${JSON.stringify(optionsQuery)}`);
                const dataValues = await this.$searchOne({ $where: searchQuery, $options: optionsQuery });
                return dataValues;
            },
            $search: async (query) => {
                var searchQuery = { ...scope?.$where, ...query?.$where };
                var optionsQuery = { ...scope?.$options, ...query?.$options };
                if (this.$config && this.$config.$autoConnect) {
                    await connectionManager_1.ConnectionManager.connectIfNotConnected(this.$provider);
                }
                else {
                    await connectionManager_1.ConnectionManager.waitUntilConnected(this.$provider);
                }
                ;
                if (this.$debugMode)
                    debugLog(`Searching Data: ${this.$schema.name} - $where: ${JSON.stringify(searchQuery)} - $options: ${JSON.stringify(optionsQuery)}`);
                const dataValues = await this.$search({ $where: searchQuery, $options: optionsQuery });
                return dataValues;
            },
            $update: async (query) => {
                var updateQuery = { ...scope?.$where, ...query?.$where };
                var updateOptions = { ...query?.$update };
                var rulesQuery = { ...query?.$rules };
                if (this.$config && this.$config.$autoConnect) {
                    await connectionManager_1.ConnectionManager.connectIfNotConnected(this.$provider);
                }
                else {
                    await connectionManager_1.ConnectionManager.waitUntilConnected(this.$provider);
                }
                ;
                if (this.$debugMode)
                    debugLog(`Updating Data: ${this.$schema.name} - $where: ${JSON.stringify(updateQuery)} - $update: ${JSON.stringify(updateOptions)} - $rules: ${JSON.stringify(rulesQuery)}`);
                const dataValues = await this.$update({ $where: updateQuery, $update: updateOptions, $rules: rulesQuery });
                return dataValues;
            },
            $updateMany: async (query) => {
                var updateQuery = { ...scope?.$where, ...query?.$where };
                var updateOptions = { ...query?.$update };
                var rulesQuery = { ...query?.$rules };
                if (this.$config && this.$config.$autoConnect) {
                    await connectionManager_1.ConnectionManager.connectIfNotConnected(this.$provider);
                }
                else {
                    await connectionManager_1.ConnectionManager.waitUntilConnected(this.$provider);
                }
                ;
                if (this.$debugMode)
                    debugLog(`Updating Many Data: ${this.$schema.name} - $where: ${JSON.stringify(updateQuery)} - $update: ${JSON.stringify(updateOptions)} - $rules: ${JSON.stringify(rulesQuery)}`);
                const dataValues = await this.$updateMany({ $where: updateQuery, $update: updateOptions, $rules: rulesQuery });
                return dataValues;
            },
            $delete: async (query) => {
                var deleteQuery = { ...scope?.$where, ...query?.$where };
                if (this.$config && this.$config.$autoConnect) {
                    await connectionManager_1.ConnectionManager.connectIfNotConnected(this.$provider);
                }
                else {
                    await connectionManager_1.ConnectionManager.waitUntilConnected(this.$provider);
                }
                ;
                if (this.$debugMode)
                    debugLog(`Deleting Data: ${this.$schema.name} - $where: ${JSON.stringify(deleteQuery)}`);
                const dataValues = await this.$delete({ $where: deleteQuery });
                return dataValues;
            },
            $deleteMany: async (query) => {
                var deleteQuery = { ...scope?.$where, ...query?.$where };
                ;
                if (this.$config && this.$config.$autoConnect) {
                    await connectionManager_1.ConnectionManager.connectIfNotConnected(this.$provider);
                }
                else {
                    await connectionManager_1.ConnectionManager.waitUntilConnected(this.$provider);
                }
                ;
                if (this.$debugMode)
                    debugLog(`Deleting Many Data: ${this.$schema.name} - $where: ${JSON.stringify(deleteQuery)}`);
                const dataValues = await this.$deleteMany({ $where: deleteQuery });
                return dataValues;
            },
            $count: async (query) => {
                var countQuery = { ...scope?.$where, ...query?.$where };
                var optionsQuery = { ...scope?.$options, ...query?.$options };
                if (this.$config && this.$config.$autoConnect) {
                    await connectionManager_1.ConnectionManager.connectIfNotConnected(this.$provider);
                }
                else {
                    await connectionManager_1.ConnectionManager.waitUntilConnected(this.$provider);
                }
                ;
                if (this.$debugMode)
                    debugLog(`Counting Data: ${this.$schema.name} - $where: ${JSON.stringify(countQuery)} - $options: ${JSON.stringify(optionsQuery)}`);
                const dataValues = await this.$count({ $where: countQuery, $options: optionsQuery });
                return dataValues;
            },
            $searchAndCount: async (query) => {
                var searchQuery = { ...scope?.$where, ...query?.$where };
                if (this.$config && this.$config.$autoConnect) {
                    await connectionManager_1.ConnectionManager.connectIfNotConnected(this.$provider);
                }
                else {
                    await connectionManager_1.ConnectionManager.waitUntilConnected(this.$provider);
                }
                ;
                if (this.$debugMode)
                    debugLog(`Searching And Counting Data: ${this.$schema.name} - $where: ${JSON.stringify(searchQuery)}`);
                const dataValues = await this.$searchAndCount({ $where: searchQuery });
                return dataValues;
            },
            $restore: async (query) => {
                var restoreQuery = { ...scope?.$where, ...query?.$where };
                if (this.$config && this.$config.$autoConnect) {
                    await connectionManager_1.ConnectionManager.connectIfNotConnected(this.$provider);
                }
                else {
                    await connectionManager_1.ConnectionManager.waitUntilConnected(this.$provider);
                }
                ;
                if (this.$debugMode)
                    debugLog(`Restoring Data: ${this.$schema.name} - $where: ${JSON.stringify(restoreQuery)}`);
                return await this.$restore({ $where: restoreQuery });
            },
            $softDelete: async (query) => {
                var softDeleteQuery = { ...scope?.$where, ...query?.$where };
                if (this.$config && this.$config.$autoConnect) {
                    await connectionManager_1.ConnectionManager.connectIfNotConnected(this.$provider);
                }
                else {
                    await connectionManager_1.ConnectionManager.waitUntilConnected(this.$provider);
                }
                ;
                if (this.$debugMode)
                    debugLog(`Soft Deleting Data: ${this.$schema.name} - $where: ${JSON.stringify(softDeleteQuery)}`);
                const dataValues = await this.$softDelete({ $where: softDeleteQuery });
                return dataValues;
            },
            $softDeleteMany: async (query) => {
                var softDeleteQuery = { ...scope?.$where, ...query?.$where };
                if (this.$config && this.$config.$autoConnect) {
                    await connectionManager_1.ConnectionManager.connectIfNotConnected(this.$provider);
                }
                else {
                    await connectionManager_1.ConnectionManager.waitUntilConnected(this.$provider);
                }
                ;
                if (this.$debugMode)
                    debugLog(`Soft Deleting Many Data: ${this.$schema.name} - $where: ${JSON.stringify(softDeleteQuery)}`);
                const dataValues = await this.$softDeleteMany({ $where: softDeleteQuery });
                return dataValues;
            },
            $upsert: async (query) => {
                var upsertQuery = { ...scope?.$where, ...query?.$where };
                var updateQuery = { ...query?.$update };
                var rulesQuery = { ...query?.$rules };
                if (this.$config && this.$config.$autoConnect) {
                    await connectionManager_1.ConnectionManager.connectIfNotConnected(this.$provider);
                }
                else {
                    await connectionManager_1.ConnectionManager.waitUntilConnected(this.$provider);
                }
                ;
                if (this.$debugMode)
                    debugLog(`Upserting Data: ${this.$schema.name} - $where: ${JSON.stringify(upsertQuery)} - $update: ${JSON.stringify(query?.$update)} - $rules: ${JSON.stringify(query?.$rules)}`);
                const dataValues = await this.$upsert({ $where: upsertQuery, $update: updateQuery, $rules: rulesQuery });
                return dataValues;
            },
            $distinct: async (query) => {
                var distinctQuery = { ...scope?.$where, ...query?.$where };
                var fieldsQuery = query?.$field || [];
                if (this.$config && this.$config.$autoConnect) {
                    await connectionManager_1.ConnectionManager.connectIfNotConnected(this.$provider);
                }
                else {
                    await connectionManager_1.ConnectionManager.waitUntilConnected(this.$provider);
                }
                ;
                if (this.$debugMode)
                    debugLog(`Distinct Data: ${this.$schema.name} - $where: ${JSON.stringify(distinctQuery)}`);
                const dataValues = await this.$distinct({ $where: distinctQuery, $field: fieldsQuery });
                return dataValues;
            }
        };
    }
    ;
    async $searchAndReplace(query) {
        var execute = await this.#execute();
        if (this.$debugMode)
            debugLog(`Replacing Data: ${this.$schema.name} - $where: ${JSON.stringify(query?.$where)} - $replace: ${JSON.stringify(query?.$replace)} - $options: ${JSON.stringify(query?.$options)} - $rules: ${JSON.stringify(query?.$rules)}`);
        if (query && !query.$options)
            query.$options = {};
        return execute.update(query?.$where, {
            $set: {
                ...query?.$replace,
            }
        }, query?.$rules, { $upsert: true, ...query?.$options });
    }
    ;
    /**
     * Search
     * @param query Query
     * @param query.$where Where
     * @param query.$options Options
     * @returns Promise<StaticProps<ExtendType<SchemaProps,{IdParam: string}>>
     * @example model.$search({ $where: { name: 'John' } })
     * @async
     * @public
     * @type {Function}
     */
    async $search(query) {
        var execute = await this.#execute();
        if (this.$debugMode)
            debugLog(`Searching Data: ${this.$schema.name} - $where: ${JSON.stringify(query?.$where)} - $options: ${JSON.stringify(query?.$options)}`);
        const dataValues = await execute.search(query?.$where, query?.$options);
        const Engine = this;
        const response = dataValues.map((data) => returnClass(this.Schema, Engine, data, [
            '$clone', '$delete',
            '$expiresAt', '$get',
            '$isDeleted', '$isModified',
            '$isValid', '$refresh',
            '$reload', '$restore',
            '$role', '$save', '$set',
            '$softDelete', '$toJSON',
            '$toObject', '$toStringify',
            '$update',
        ]));
        return response;
    }
    ;
    /**
     * Search First
     * @returns Promise<StaticProps<ExtendType<SchemaProps,{IdParam: string}>>
     * @example model.$searchFirst()
     * @async
     * @public
     * @type {Function}
     */
    async $searchFirst() {
        var execute = await this.#execute();
        if (this.$debugMode)
            debugLog(`Searching First Data: ${this.$schema.name}`);
        const dataValues = await execute.searchOne({}, {});
        const Engine = this;
        const response = returnClass(this.Schema, Engine, dataValues, [
            '$clone', '$delete',
            '$expiresAt', '$get',
            '$isDeleted', '$isModified',
            '$isValid', '$refresh',
            '$reload', '$restore',
            '$role', '$save', '$set',
            '$softDelete', '$toJSON',
            '$toObject', '$toStringify',
            '$update'
        ]);
        return response;
    }
    ;
    /**
     * Search One
     * @param query Query
     * @param query.$where Where
     * @param query.$options Options
     * @returns Promise<StaticProps<ExtendType<SchemaProps,{IdParam: string}>>
     * @example model.$searchOne({ $where: { name: 'John' } })
     * @async
     * @public
     * @type {Function}
     */
    async $searchOne(query) {
        var execute = await this.#execute();
        if (this.$debugMode)
            debugLog(`Searching One Data: ${this.$schema.name} - $where: ${JSON.stringify(query?.$where)} - $options: ${JSON.stringify(query?.$options)}`);
        const dataValues = await execute.searchOne(query?.$where, query?.$options);
        const Engine = this;
        const response = returnClass(this.Schema, Engine, dataValues, [
            '$clone', '$delete',
            '$expiresAt', '$get',
            '$isDeleted', '$isModified',
            '$isValid', '$refresh',
            '$reload', '$restore',
            '$role', '$save', '$set',
            '$softDelete', '$toJSON',
            '$toObject', '$toStringify',
            '$update'
        ]);
        return response;
    }
    ;
    /**
     * Search By Id
     * @param id ID
     * @returns Promise<StaticProps<ExtendType<SchemaProps,{<IdParam>:string}>>
     * @example model.$searchById('1')
     * @async
     * @public
     * @type {Function}
     */
    async $searchById(id) {
        var idColumn = Reflect.getMetadata(`autoIncrement-${this.$schema.name}`, this.$schema) || '';
        var execute = await this.#execute();
        if (!id)
            throw new errorHandler_1.default('ID Not Found, Fill ID.', '#FF0000');
        if (idColumn == '')
            throw new errorHandler_1.default('ID Column Not Found, Check Schema.', '#FF0000');
        if (this.$debugMode)
            debugLog(`Searching By ID: ${this.$schema.name} - $where: { ${idColumn}: ${id} }`);
        const dataValues = await execute.searchOne({ [idColumn]: id });
        const Engine = this;
        const response = returnClass(this.Schema, Engine, dataValues, [
            '$clone', '$delete',
            '$expiresAt', '$get',
            '$isDeleted', '$isModified',
            '$isValid', '$refresh',
            '$reload', '$restore',
            '$role', '$save', '$set',
            '$softDelete', '$toJSON',
            '$toObject', '$toStringify',
            '$update'
        ]);
        return response;
    }
    ;
    /**
     * Search By Ids
     * @param ids Nexorm IDs
     * @returns Promise<StaticProps<ExtendType<SchemaProps,{IdParam: string}>>
     * @example model.$searchByIds(['1','2','3'])
     * @async
     * @public
     * @type {Function}
     */
    async $searchByIds(ids) {
        var idColumn = Reflect.getMetadata(`autoIncrement-${this.$schema.name}`, this.$schema) || '';
        var execute = await this.#execute();
        if (idColumn == '')
            throw new errorHandler_1.default('ID Column Not Found, Check Schema.', '#FF0000');
        if (!ids || ids.length == 0)
            throw new errorHandler_1.default('IDs Not Found, Fill IDs.', '#FF0000');
        if (ids.length > 1000)
            throw new errorHandler_1.default('IDs Too Many, Max 1000 IDs.', '#FF0000');
        if (this.$debugMode)
            debugLog(`Searching By IDs: ${this.$schema.name} - $where: { ${idColumn} { $in: ${ids} } }`);
        const dataValues = await execute.search({ [idColumn]: { $in: ids } });
        const Engine = this;
        const response = dataValues.map((data) => returnClass(this.Schema, Engine, data, [
            '$clone', '$delete',
            '$expiresAt', '$get',
            '$isDeleted', '$isModified',
            '$isValid', '$refresh',
            '$reload', '$restore',
            '$role', '$save', '$set',
            '$softDelete', '$toJSON',
            '$toObject', '$toStringify',
            '$update'
        ]));
        return response;
    }
    ;
    /**
     * Search And Count
     * @param query Query
     * @param query.$where Where
     * @returns Promise<[StaticProps<ExtendType<SchemaProps,{IdParam: string}>>[], number]>
     * @example model.$searchAndCount({ $where: { name: 'John' } })
     * @async
     * @public
     * @type {Function}
     */
    async $searchAndCount(query) {
        var execute = await this.#execute();
        if (this.$debugMode)
            debugLog(`Searching And Counting Data: ${this.$schema.name} - $where: ${JSON.stringify(query?.$where)}`);
        var counts = await execute.count(query?.$where, {});
        var dataValue = await execute.search(query?.$where, {});
        const Engine = this;
        const response = dataValue.map((data) => returnClass(this.Schema, Engine, data, [
            '$clone', '$delete',
            '$expiresAt', '$get',
            '$isDeleted', '$isModified',
            '$isValid', '$refresh',
            '$reload', '$restore',
            '$role', '$save', '$set',
            '$softDelete', '$toJSON',
            '$toObject', '$toStringify',
            '$update'
        ]));
        return [response, counts];
    }
    ;
    /**
     * Create
     * @param data Data
     * @returns Promise<StaticProps<ExtendType<SchemaProps,{IdParam: string}>>
     * @example model.$create({ name: 'John' })
     * @async
     * @public
     * @type {Function}
     */
    async $everything() {
        var execute = await this.#execute();
        if (this.$debugMode)
            debugLog(`Searching Everything: ${this.$schema.name}`);
        const dataValues = await execute.search({}, {});
        const Engine = this;
        const response = dataValues.map((data) => returnClass(this.Schema, Engine, data, [
            '$clone', '$delete',
            '$expiresAt', '$get',
            '$isDeleted', '$isModified',
            '$isValid', '$refresh',
            '$reload', '$restore',
            '$role', '$save', '$set',
            '$softDelete', '$toJSON',
            '$toObject', '$toStringify',
            '$update',
        ]));
        return response;
    }
    ;
    /**
     * Build
     * @param data Data
     * @returns Promise<StaticProps<ExtendType<SchemaProps,{IdParam: string}>>
     * @example model.$build({ name: 'John' })
     * @async
     * @public
     * @type {Function}
     */
    async $build(query) {
        var execute = await this.#execute();
        if (this.$debugMode)
            debugLog(`Building Data: ${this.$schema.name} - Data: ${JSON.stringify(query?.$data)} - $options: ${JSON.stringify(query?.$options)}`);
        if (query && !query.$options)
            query.$options = { $hooks: true };
        if (query && !query.$data)
            throw new errorHandler_1.default('Data Not Found, Fill Data.', '#FF0000');
        const dataValues = await execute.build(query?.$data, query?.$options);
        const Engine = this;
        const response = returnClass(this.Schema, Engine, dataValues, [
            '$clone', '$delete',
            '$expiresAt', '$get',
            '$isDeleted', '$isModified',
            '$isValid', '$refresh',
            '$reload', '$restore',
            '$role', '$save', '$set',
            '$softDelete', '$toJSON',
            '$toObject', '$toStringify',
            '$update'
        ]);
        return response;
    }
    ;
    /**
     * Build Many
     * @param data Data
     * @returns Promise<StaticProps<ExtendType<SchemaProps,{IdParam: string}>>
     * @example model.$buildMany([{ name: 'John' }, { name: 'Doe' }])
     * @async
     * @public
     * @type {Function}
     */
    async $buildMany(query) {
        var execute = await this.#execute();
        if (this.$debugMode)
            debugLog(`Building Many Data: ${this.$schema.name} - Data: ${JSON.stringify(query?.$data)} - $options: ${JSON.stringify(query?.$options)}`);
        if (query && !query.$options)
            query.$options = { $hooks: true };
        if (query && !query.$data)
            throw new errorHandler_1.default('Data Not Found, Fill Data.', '#FF0000');
        const dataValues = await execute.buildMany(query?.$data, query?.$options);
        const Engine = this;
        const response = dataValues.map((data) => returnClass(this.Schema, Engine, data, [
            '$clone', '$delete',
            '$expiresAt', '$get',
            '$isDeleted', '$isModified',
            '$isValid', '$refresh',
            '$reload', '$restore',
            '$role', '$save', '$set',
            '$softDelete', '$toJSON',
            '$toObject', '$toStringify',
            '$update'
        ]));
        return response;
    }
    ;
    /**
     * Update
     * @param query Query
     * @param query.$where Where
     * @param query.$update Update
     * @param query.$rules Rules
     * @param query.$options Options
     * @returns Promise<StaticProps<ExtendType<SchemaProps,{IdParam: string}>>
     * @example model.$update({ $where: { name: 'John' }, $update: { $set: { name: 'Five' } } })
     * @async
     * @public
     * @type {Function}
     */
    async $update(query) {
        var execute = await this.#execute();
        if (this.$debugMode)
            debugLog(`Updating Data: ${this.$schema.name} - $where: ${JSON.stringify(query?.$where)} - $update: ${JSON.stringify(query?.$update)} - $options: ${JSON.stringify(query?.$options)} - $rules: ${JSON.stringify(query?.$rules)}`);
        if (query && !query.$options)
            query.$options = {};
        const dataValues = await execute.update(query?.$where, query?.$update, query?.$rules, query?.$options);
        const Engine = this;
        const response = returnClass(this.Schema, Engine, dataValues, [
            '$clone', '$delete',
            '$expiresAt', '$get',
            '$isDeleted', '$isModified',
            '$isValid', '$refresh',
            '$reload', '$restore',
            '$role', '$save', '$set',
            '$softDelete', '$toJSON',
            '$toObject', '$toStringify',
            '$update'
        ]);
        return response;
    }
    ;
    /**
     * Update Many
     * @param query Query
     * @param query.$where Where
     * @param query.$update Update
     * @param query.$rules Rules
     * @param query.$options Options
     * @returns Promise<StaticProps<ExtendType<SchemaProps,{IdParam: string}>>
     * @example model.$updateMany({ $where: { name: 'John' }, $update: { $set: { name: 'Five' } } })
     * @async
     * @public
     * @type {Function}
     */
    async $updateMany(query) {
        var execute = await this.#execute();
        if (this.$debugMode)
            debugLog(`Updating Many Data: ${this.$schema.name} - $where: ${JSON.stringify(query?.$where)} - $update: ${JSON.stringify(query?.$update)} - $options: ${JSON.stringify(query?.$options)} - $rules: ${JSON.stringify(query?.$rules)}`);
        return execute.update(query?.$where, query?.$update, query?.$rules, { $multi: true, ...query?.$options });
    }
    ;
    /**
     * Delete
     * @param query Query
     * @param query.$where Where
     * @param query.$options Options
     * @returns Promise<boolean>
     * @example model.$delete({ $where: { name: 'John' } })
     * @async
     * @public
     * @type {Function}
     * @returns {Promise<boolean>}
     */
    async $delete(query) {
        if (typeof query?.$options?.$force == 'boolean')
            query.$options.$force = true;
        var execute = await this.#execute();
        if (this.$debugMode)
            debugLog(`Deleting Data: ${this.$schema.name} - $where: ${JSON.stringify(query?.$where)} - $options: ${JSON.stringify(query?.$options)}`);
        return execute.delete(query?.$where, query?.$options, false);
    }
    ;
    /**
     * Delete Many
     * @param query Query
     * @param query.$where Where
     * @param query.$options Options
     * @returns Promise<number>
     * @example model.$deleteMany({ $where: { name: 'John' } })
     * @async
     * @public
     * @type {Function}
     * @returns {Promise<number>}
     */
    async $deleteMany(query) {
        if (typeof query?.$options?.$force == 'boolean')
            query.$options.$force = true;
        var execute = await this.#execute();
        if (this.$debugMode)
            debugLog(`Deleting Many Data: ${this.$schema.name} - $where: ${JSON.stringify(query?.$where)} - $options: ${JSON.stringify(query?.$options)}`);
        return execute.delete(query?.$where, query?.$options, true);
    }
    ;
    /**
     * Soft Delete
     * @param query Query
     * @param query.$where Where
     * @param query.$options Options
     * @returns Promise<boolen>
     * @example model.$softDelete({ $where: { name: 'John' } })
     * @async
     * @public
     * @type {Function}
     * @returns {Promise<boolean>}
     */
    async $softDelete(query) {
        var execute = await this.#execute();
        if (this.$debugMode)
            debugLog(`Soft Deleting Data: ${this.$schema.name} - $where: ${JSON.stringify(query?.$where)} - $options: ${JSON.stringify(query?.$options)}`);
        return execute.delete(query?.$where, { $force: false, ...query?.$options }, false);
    }
    ;
    /**
     * Soft Delete Many
     * @param query Query
     * @param query.$where Where
     * @param query.$options Options
     * @returns Promise<boolean>
     * @example model.$softDeleteMany({ $where: { name: 'John' } })
     * @async
     * @public
     * @type {Function}
     * @returns {Promise<boolean>}
     */
    async $softDeleteMany(query) {
        var execute = await this.#execute();
        if (this.$debugMode)
            debugLog(`Soft Deleting Many Data: ${this.$schema.name} - $where: ${JSON.stringify(query?.$where)} - $options: ${JSON.stringify(query?.$options)}`);
        return execute.delete(query?.$where, { $force: false, ...query?.$options }, true);
    }
    ;
    /**
     * Restore
     * @param query Query
     * @param query.$where Where
     * @param query.$options Options
     * @returns Promise<void>
     * @example model.$restore({ $where: { name: 'John' } })
     * @async
     * @public
     * @type {Function}
     * @returns {Promise<void>}
     */
    async $restore(query) {
        var execute = await this.#execute();
        if (this.$debugMode)
            debugLog(`Restoring Data: ${this.$schema.name} - $where: ${JSON.stringify(query?.$where)} - $options: ${JSON.stringify(query?.$options)}`);
        return execute.restore(query?.$where, query?.$options);
    }
    async $count(query) {
        var execute = await this.#execute();
        if (this.$debugMode)
            debugLog(`Counting Data: ${this.$schema.name} - $where: ${JSON.stringify(query?.$where)} - $options: ${JSON.stringify(query?.$options)}`);
        return execute.count(query?.$where);
    }
    ;
    /**
     * Upsert
     * @param query Query
     * @param query.$where Where
     * @param query.$update Update
     * @param query.$rules Rules
     * @param query.$options Options
     * @returns Promise<StaticProps<ExtendType<SchemaProps,{IdParam: string}>>
     * @example model.$upsert({ $where: { name: 'John' }, $update: { $set: { name: 'Five' } } })
     * @async
     * @public
     * @type {Function}
     */
    async $upsert(query) {
        var execute = await this.#execute();
        if (this.$debugMode)
            debugLog(`Upserting Data: ${this.$schema.name} - $where: ${JSON.stringify(query.$where)} - $update: ${JSON.stringify(query.$update)} - $options: ${JSON.stringify(query.$options)} - $rules: ${JSON.stringify(query.$rules)}`);
        const dataValues = await execute.update(query.$where, query.$update, query.$rules, { $upsert: true, ...query.$options });
        const Engine = this;
        const response = returnClass(this.Schema, Engine, dataValues, [
            '$clone', '$delete',
            '$expiresAt', '$get',
            '$isDeleted', '$isModified',
            '$isValid', '$refresh',
            '$reload', '$restore',
            '$role', '$save', '$set',
            '$softDelete', '$toJSON',
            '$toObject', '$toStringify',
            '$update'
        ]);
        return response;
    }
    ;
    /**
     * Query
     * @param query Query
     * @returns Promise<any>
     * @example model.$query('SELECT * FROM users')
     * @async
     * @public
     * @type {Function}
     */
    async $query(query) {
        var execute = await this.#execute();
        if (this.$debugMode)
            debugLog(`Querying Data: ${this.$schema.name} - Query: ${query}`);
        return execute.query(query);
    }
    ;
    /**
     * Distinct
     * @param query Query
     * @param query.$field Field
     * @param query.$where Where
     * @param query.$options Options
     * @returns Promise<any[][]>
     * @example model.$distinct({ $field: ['name'] })
     * @example model.$distinct({ $field: ['name'], $where: { age: { $gt: 18 } } })
     * @async
     * @public
     * @type {Function}
     */
    async $distinct(query) {
        var execute = await this.#execute();
        if (this.$debugMode)
            debugLog(`Distinct Data: ${this.$schema.name} - $field: ${JSON.stringify(query.$field)} - $where: ${JSON.stringify(query.$where)} - $options: ${JSON.stringify(query.$options)}`);
        return Object.values(await execute.distinct(query.$field, query.$where, query.$options) || []);
    }
    ;
    /**
     * Truncate
     * @returns Promise<void>
     * @example model.$truncate()
     * @async
     * @public
     * @type {Function}
     */
    async $truncate() {
        var execute = await this.#execute();
        if (this.$debugMode)
            debugLog(`Truncating Data: ${this.$schema.name}`);
        return execute.truncate();
    }
    ;
    /**
     * Hooks
     * @description Nexorm Hooks
     * @public
     * @async
     * @example model.$hooks.$beforeCreate((values, fields) => {})
     * @example model.$hooks.$afterCreate((values, fields) => {})
     */
    $hooks = {
        /**
         * Before Create Hook
         * @param callback Callback Function
         * @returns void
         * @example model.$hooks.$beforeCreate((values, fields) => {})
         * @description Before Create Hook
         * @public
         * @async
         * @type {Function}
         * @returns {void}
         * @param values
         * @param fields
         */
        $beforeCreate: (callback) => {
            this.$model?.beforeCreate((instance, options) => {
                if (this.$debugMode)
                    debugLog(`Before Create Hook: ${this.$schema.name} - Data: ${JSON.stringify(instance.dataValues)} - Fields: ${JSON.stringify(options.fields)}`);
                callback(instance.dataValues, options.fields);
            });
        },
        /**
         * After Create Hook
         * @param callback Callback Function
         * @returns void
         * @example model.$hooks.$afterCreate((values, fields) => {})
         * @description After Create Hook
         * @public
         * @async
         * @type {Function}
         * @returns {void}
         * @param values
         * @param fields
         */
        $afterCreate: (callback) => {
            this.$model?.afterCreate((instance, options) => {
                if (this.$debugMode)
                    debugLog(`After Create Hook: ${this.$schema.name} - Data: ${JSON.stringify(instance.dataValues)} - Fields: ${JSON.stringify(options.fields)}`);
                callback(instance.dataValues, options.fields);
            });
        },
        /**
         * After Update Hook
         * @param callback Callback Function
         * @returns void
         * @example model.$hooks.$afterUpdate((values, fields) => {})
         * @description After Update Hook
         * @public
         * @async
         * @type {Function}
         * @returns {void}
         * @param values
         * @param fields
         */
        $afterUpdate: (callback) => {
            this.$model?.afterUpdate((instance, options) => {
                if (this.$debugMode)
                    debugLog(`After Update Hook: ${this.$schema.name} - Data: ${JSON.stringify(instance.dataValues)} - Fields: ${JSON.stringify(options.fields)}`);
                callback(instance.dataValues, options.fields);
            });
        },
        /**
         * Before Destroy Hook
         * @param callback Callback Function
         * @returns void
         * @example model.$hooks.$beforeDestroy((values) => {})
         * @description Before Destroy Hook
         * @public
         * @async
         * @type {Function}
         * @returns {void}
         * @param values
         */
        $beforeDestroy: (callback) => {
            this.$model?.beforeDestroy((instance, options) => {
                if (this.$debugMode)
                    debugLog(`Before Destroy Hook: ${this.$schema.name} - Data: ${JSON.stringify(instance.dataValues)}`);
                callback(instance.dataValues);
            });
        },
        /**
         * After Destroy Hook
         * @param callback Callback Function
         * @returns void
         * @example model.$hooks.$afterDestroy((values) => {})
         * @description After Destroy Hook
         * @public
         * @async
         * @type {Function}
         * @returns {void}
         * @param values
         */
        $afterDestroy: (callback) => {
            this.$model?.afterDestroy((instance, options) => {
                if (this.$debugMode)
                    debugLog(`After Destroy Hook: ${this.$schema.name} - Data: ${JSON.stringify(instance.dataValues)}`);
                callback(instance.dataValues);
            });
        },
        /**
         * Before Update Hook
         * @param callback Callback Function
         * @returns void
         * @example model.$hooks.$beforeUpdate((values, fields) => {})
         * @description Before Update Hook
         * @public
         * @async
         * @type {Function}
         * @returns {void}
         * @param values
         * @param fields
         */
        $beforeUpdate: (callback) => {
            this.$model?.beforeUpdate((instance, options) => {
                if (this.$debugMode)
                    debugLog(`Before Update Hook: ${this.$schema.name} - Data: ${JSON.stringify(instance.dataValues)} - Fields: ${JSON.stringify(options.fields)}`);
                callback(instance.dataValues, options.fields);
            });
        },
        /**
         * Before Save Hook
         * @param callback Callback Function
         * @returns void
         * @example model.$hooks.$beforeSave((values, fields) => {})
         * @description Before Save Hook
         * @public
         * @async
         * @type {Function}
         * @returns {void}
         * @param values
         * @param fields
         */
        $beforeSave: (callback) => {
            this.$model?.beforeSave((instance, options) => {
                if (this.$debugMode)
                    debugLog(`Before Save Hook: ${this.$schema.name} - Data: ${JSON.stringify(instance.dataValues)} - Fields: ${JSON.stringify(options.fields)}`);
                callback(instance.dataValues, options.fields);
            });
        },
        /**
         * After Save Hook
         * @param callback Callback Function
         * @returns void
         * @example model.$hooks.$afterSave((values, fields) => {})
         * @description After Save Hook
         * @public
         * @async
         * @type {Function}
         * @returns {void}
         * @param values
         * @param fields
         */
        $afterSave: (callback) => {
            this.$model?.afterSave((instance, options) => {
                if (this.$debugMode)
                    debugLog(`After Save Hook: ${this.$schema.name} - Data: ${JSON.stringify(instance.dataValues)} - Fields: ${JSON.stringify(options.fields)}`);
                callback(instance.dataValues, options.fields);
            });
        },
        /**
         * Before Bulk Create Hook
         * @param callback Callback Function
         * @returns void
         * @example model.$hooks.$beforeBulkCreate((values) => {})
         * @description Before Bulk Create Hook
         * @public
         * @async
         * @type {Function}
         * @returns {void}
         * @param values
         * @param fields
         */
        $beforeBulkCreate: (callback) => {
            this.$model?.beforeBulkCreate((instance, options) => {
                if (this.$debugMode)
                    debugLog(`Before Bulk Create Hook: ${this.$schema.name} - Data: ${JSON.stringify(instance)} - Fields: ${JSON.stringify(options.fields)}`);
                callback(instance.map((data) => data.dataValues), options.fields);
            });
        },
        /**
         * After Bulk Create Hook
         * @param callback Callback Function
         * @returns void
         * @example model.$hooks.$afterBulkCreate((values) => {})
         * @description After Bulk Create Hook
         * @public
         * @async
         * @type {Function}
         * @returns {void}
         * @param values
         * @param fields
         */
        $afterBulkCreate: (callback) => {
            this.$model?.afterBulkCreate((instance, options) => {
                if (this.$debugMode)
                    debugLog(`After Bulk Create Hook: ${this.$schema.name} - Data: ${JSON.stringify(instance)} - Fields: ${JSON.stringify(options.fields)}`);
                callback(instance.map((data) => data.dataValues), options.fields);
            });
        },
        /**
         * Before Bulk Update Hook
         * @param callback Callback Function
         * @returns void
         * @example model.$hooks.$beforeBulkUpdate((values, fields) => {})
         * @description Before Bulk Update Hook
         * @public
         * @async
         * @type {Function}
         * @returns {void}
         * @param values
         * @param fields
         */
        $beforeBulkUpdate: (callback) => {
            this.$model?.beforeBulkUpdate((options) => {
                if (this.$debugMode)
                    debugLog(`Before Bulk Update Hook: ${this.$schema.name} - Fields: ${JSON.stringify(options.fields)}`);
                callback(this.$schema.name, options.fields);
            });
        },
        /**
         * After Bulk Update Hook
         * @param callback Callback Function
         * @returns void
         * @example model.$hooks.$afterBulkUpdate((values, fields) => {})
         * @description After Bulk Update Hook
         * @public
         * @async
         * @type {Function}
         * @returns {void}
         * @param values
         * @param fields
         */
        $afterBulkUpdate: (callback) => {
            this.$model?.afterBulkUpdate((options) => {
                if (this.$debugMode)
                    debugLog(`After Bulk Update Hook: ${this.$schema.name} - Fields: ${JSON.stringify(options.fields)}`);
                callback(this.$schema.name, options.fields);
            });
        },
        /**
         * Before Bulk Destroy Hook
         * @param callback Callback Function
         * @returns void
         * @example model.$hooks.$beforeBulkDestroy((values) => {})
         * @description Before Bulk Destroy Hook
         * @public
         * @async
         * @type {Function}
         * @returns {void}
         * @param values
         * @param fields
         */
        $beforeBulkDestroy: (callback) => {
            this.$model?.beforeBulkDestroy((options) => {
                if (this.$debugMode)
                    debugLog(`Before Bulk Destroy Hook: ${this.$schema.name} - Fields: ${JSON.stringify(options.fields)}`);
                callback(this.$schema.name, options.fields);
            });
        },
        /**
         * After Bulk Destroy Hook
         * @param callback Callback Function
         * @returns void
         * @example model.$hooks.$afterBulkDestroy((values) => {})
         * @description After Bulk Destroy Hook
         * @public
         * @async
         * @type {Function}
         * @returns {void}
         * @param values
         * @param fields
         */
        $afterBulkDestroy: (callback) => {
            this.$model?.afterBulkDestroy((options) => {
                if (this.$debugMode)
                    debugLog(`After Bulk Destroy Hook: ${this.$schema.name}`);
                callback(this.$schema.name);
            });
        },
        /**
         * Before Find Hook
         * @param callback Callback Function
         * @returns void
         * @example model.$hooks.$beforeFind((values) => {})
         * @description Before Find Hook
         * @public
         * @async
         * @type {Function}
         * @returns {void}
         * @param values
         */
        $beforeFind: (callback) => {
            this.$model?.beforeFind((options) => {
                if (this.$debugMode)
                    debugLog(`Before Find Hook: ${this.$schema.name} - Data: ${JSON.stringify(options.where)}`);
                callback(options.where);
            });
        },
        /**
         * After Find Hook
         * @param callback Callback Function
         * @returns void
         * @example model.$hooks.$afterFind((values) => {})
         * @description After Find Hook
         * @public
         * @async
         * @type {Function}
         * @returns {void}
         * @param values
         */
        $afterFind: (callback) => {
            this.$model?.afterFind((instance, options) => {
                if (this.$debugMode)
                    debugLog(`After Find Hook: ${this.$schema.name} - Data: ${JSON.stringify(instance.dataValues)}`);
                callback(instance.dataValues);
            });
        }
    };
    async #execute() {
        var configData = await (0, fileInspector_1.readConfig)().catch((err) => { return undefined; });
        var providerName = Reflect.getMetadata(`databaseName-${this.$schema.name}`, this.$schema) || 'nexorm';
        var config = configData?.find((config) => config.$provider === providerName);
        if (!config || !configData)
            throw new errorHandler_1.default('Nexorm Config Not Found', '#FF0000');
        this.$config = config;
        var model = await (0, modelBuilder_1.getModel)(providerName, this.$schema.name).catch((err) => { return undefined; });
        if (!model)
            throw new errorHandler_1.default(`Model Not Found: ${this.$schema.name}, Make Sure $entities Section Is Correct`, '#FF0000');
        if (this.$debugMode)
            debugLog(`Executing Model: ${this.$schema.name} - Provider: ${providerName}`);
        this.$model = model;
        return {
            search: async (filter, options) => {
                return await (0, export_1.search)(this.$model, filter, options, this.$cache, this.$config) || [];
            },
            searchOne: async (filter, options) => {
                return await (0, export_1.searchOne)(this.$model, filter, options, this.$cache, this.$config) || null;
            },
            build: async (data, options) => {
                return await (0, export_1.build)(this.$model, data, options);
            },
            buildMany: async (data, options) => {
                return await (0, export_1.buildMany)(this.$model, data, options);
            },
            update: async (where, update, rules, options) => {
                return await (0, export_1.updateOne)(this.$model, where, update, rules, options, this.$schema);
            },
            delete: async (where, options, multiple) => {
                if (multiple)
                    return await (0, export_1.deleteMany)(this.$model, where, options);
                return (await (0, export_1.deleteMany)(this.$model, where, options) ? true : false);
            },
            restore: async (where, options) => {
                return await (0, export_1.restore)(this.$model, where, options);
            },
            count: async (where, options) => {
                return await (0, export_1.count)(this.$model, where, options);
            },
            query: async (query) => {
                return await this.$model?.sequelize?.query(query);
            },
            distinct: async (field, where, options) => {
                return await (0, export_1.distinct)(this.$model, field, where, options, this.$cache, this.$config);
            },
            truncate: async () => {
                return await this.$model?.sequelize?.truncate();
            },
        };
    }
}
exports.ModelEngine = ModelEngine;
function debugLog(message) {
    console.log(chalk_1.default.blue.bold(`[Nexorm Debug]: ${message}`));
}
;
/*
type ArrayProperties = '$first' | '$last' | '$count' | '$exists' | '$limit' | '$sort' | '$skip' | '$paginate' | '$offset' | '$chunk';


function returnArrayClass<SchemaProps>(
  schema: SchemaProps,
  Engine: ModelEngine<SchemaProps>,
  dataValues?: Record<string, any>,
  loadProperties?: Properties[]
) {

  const DynamicArrayClass = class extends Array {
    #isModified: boolean = false;
    #isValid: boolean = true;
    #isDeleted: boolean = false;

    constructor(items: any[]) {
      super(...items);
    };

      $first = () => {
        return this.length > 0 ? this[0] : null as StaticProps<Omit<SchemaProps, 'prototype'>> | null;
      };

      $last = () => {
        return this.length > 0 ? this[this.length - 1] : null as StaticProps<Omit<SchemaProps, 'prototype'>> | null;
      };

      $random = () => {
        if (this.length === 0) return null;
        const randomIndex = Math.floor(Math.random() * this.length);
        return this[randomIndex] as StaticProps<Omit<SchemaProps, 'prototype'>>;
      };

      $count = () => {
        return this.length;
      };

      $getByIndex = (index: number) => {
        if (index < 0 || index >= this.length) return null;
        return this[index];
      };

      $offset = (offset: number) => {
        if (offset < 0 || offset >= this.length) return [];
        return this.slice(offset);
      };

      $limit = (limit: number) => {
        if (limit < 0 || limit > this.length) return [];
        return this.slice(0, limit);
      };

      $sort = (compareFn?: (a: any, b: any) => number) => {
        return this.slice().sort(compareFn);
      };

      $skip = (count: number) => {
        if (count < 0 || count >= this.length) return [];
        return this.slice(count);
      };

      $paginate = (page: number, pageSize: number) => {
        if (page < 1 || pageSize < 1) return [];
        const start = (page - 1) * pageSize;
        return this.slice(start, start + pageSize);
      };

      $chunk = (size: number) => {
        if (size <= 0) return [];
        const chunks = _.chunk(this, size);
        return chunks;
      };

      $isEmpty = () => {
        return this.length === 0;
      };

      $isNotEmpty = () => {
        return this.length > 0;
      };

      $fields = () => {
        return Object.keys(this.$first() || {}).filter(key => !['length', 'name', 'prototype'].includes(key));
      };

      $hasDuplicate = (property: keyof Omit<SchemaProps, 'prototype'>) => {
        const values = this.map(item => item[property]);
        const uniqueValues = new Set(values);
        return values.length !== uniqueValues.size;
      };

      $summarize = () => {
        return {
          $count: this.$count(),
          $first: this.$first(),
          $last: this.$last(),
          $isEmpty: this.$isEmpty(),
          isNotEmpty: this.$isNotEmpty(),
          $fiels: this.$fields(),
        };
      };

      $exists = (item: any) => {
        return this.includes(item);
      };

      $slice = (start: number, end?: number) => {
        if (start < 0 || start >= this.length) return [];
        if (end !== undefined && (end < start || end > this.length)) return [];
        return this.slice(start, end);
      };

      $pluck = (property: keyof Omit<SchemaProps, 'prototype'>) => {
        if (!property) return [];
        return this.map((item: any) => item[property]).filter((value: any) => value !== undefined);
      };

      $toStringify = () => {
        try {
          return JSON.stringify(this);
        } catch (error) {
          return null;
        }
      }

      $toJSON = () => {
        try {
          return JSON.parse(JSON.stringify(this)) as StaticProps<Omit<SchemaProps, 'prototype'>>[]
        } catch (error) {
          return null;
        }
      };

      $toObject = () => {
        return this.map(item => Object.assign({}, item)) as StaticProps<Omit<SchemaProps, 'prototype'>>[];
      };
    };
  };
*/
function returnClass(schema, Engine, dataValues, loadProperties) {
    const DynamicClass = class {
        #isModified = false;
        #isValid = true;
        #isDeleted = false;
        constructor(dataValue) {
            if (dataValue) {
                Object.keys(dataValue)
                    .filter((key) => !['length', 'name', 'prototype'].includes(key))
                    .forEach((key) => {
                    Object.defineProperty(this, key, {
                        value: dataValue[key],
                        enumerable: true,
                        configurable: (String(key) !== 'ObjectId'),
                        writable: (String(key) !== 'ObjectId')
                    });
                });
            }
            ;
            const availableMethods = {
                $toObject: () => {
                    return Object.assign({}, this);
                },
                $toJSON: () => {
                    try {
                        return JSON.parse(JSON.stringify(Object.assign({}, this)));
                    }
                    catch (error) {
                        return null;
                    }
                },
                $toStringify: () => {
                    try {
                        return JSON.stringify(Object.assign({}, this));
                    }
                    catch (error) {
                        return null;
                    }
                },
                $save: async (dataValue) => {
                    if (Engine.$debugMode)
                        debugLog(`Saving Data: ${Engine.$schema.name} - dataValue: ${JSON.stringify(dataValue)}`);
                    this.#isModified = true;
                    return await Engine.$update({
                        $where: { ObjectId: this?.ObjectId },
                        $update: { $set: { ...Object.assign({}, this), ...dataValue } },
                        $options: { $upsert: true }
                    });
                },
                $clone: () => {
                    return returnClass(schema, Engine, Object.assign({}, this), loadProperties);
                },
                $softDelete: async () => {
                    if (Engine.$debugMode)
                        debugLog(`Soft Deleting Data: ${Engine.$schema.name} - ObjectId: ${this?.ObjectId}`);
                    if (this?.ObjectId === undefined) {
                        throw new errorHandler_1.default('Data not found, please check the ObjectId', '#FF0000');
                    }
                    this.#isDeleted = true;
                    return await Engine.$softDelete({ $where: { ObjectId: this?.ObjectId } });
                },
                $delete: async () => {
                    if (Engine.$debugMode)
                        debugLog(`Deleting Data: ${Engine.$schema.name} - ObjectId: ${this?.ObjectId}`);
                    if (this?.ObjectId === undefined) {
                        throw new errorHandler_1.default('Data not found, please check the ObjectId', '#FF0000');
                    }
                    this.#isDeleted = true;
                    return await Engine.$delete({ $where: { ObjectId: this?.ObjectId }, $options: { $force: true } });
                },
                $get: (property) => {
                    if (property in this) {
                        return this[property];
                    }
                    ;
                    return null;
                },
                $set: (property, value) => {
                    if (property in this) {
                        this[property] = value;
                        this.#isModified = true;
                        return this[property];
                    }
                    ;
                    return null;
                },
                $expiresAt: async (uniqueCronName, spec, options) => {
                    if (!spec)
                        throw new errorHandler_1.default('Cron Expression Is Required', '#FF0000');
                    if (this?.ObjectId === undefined) {
                        throw new errorHandler_1.default('Data not found, please check the ObjectId', '#FF0000');
                    }
                    (0, node_schedule_1.scheduleJob)(uniqueCronName, spec, async () => {
                        if (Engine.$debugMode)
                            debugLog(`Running Expiration Job: ${Engine.$schema.name} - CronName: ${uniqueCronName} - Cron: ${spec}`);
                        if (dataValue) {
                            if (Engine.$debugMode)
                                debugLog(`Expiration Job Data: ${Engine.$schema.name} - Data: ${JSON.stringify(dataValue)}`);
                            this.#isDeleted = true;
                            await Engine.$delete({ $where: { ObjectId: this?.ObjectId }, $options: { $force: (options?.$force || false) } });
                        }
                        ;
                        if (Engine.$debugMode)
                            debugLog(`Expiration Job Completed: ${Engine.$schema.name} - CronName: ${uniqueCronName} - Cron: ${spec}`);
                        if (!options?.$continuity) {
                            const job = node_schedule_1.scheduledJobs[uniqueCronName];
                            if (job) {
                                job.cancel();
                                delete node_schedule_1.scheduledJobs[uniqueCronName];
                            }
                            ;
                        }
                        ;
                    });
                    return {
                        $cancel: () => {
                            const job = node_schedule_1.scheduledJobs[uniqueCronName];
                            if (job) {
                                job.cancel();
                                delete node_schedule_1.scheduledJobs[uniqueCronName];
                                if (Engine.$debugMode)
                                    debugLog(`Canceled Expiration Job: ${Engine.$schema.name} - CronName: ${uniqueCronName}`);
                            }
                            ;
                            return true;
                        },
                    };
                },
                $isDeleted: () => {
                    return this.#isDeleted;
                },
                $isModified: () => {
                    return this.#isModified;
                },
                $isValid: () => {
                    return this.#isValid;
                },
                $refresh: async () => {
                    if (Engine.$debugMode)
                        debugLog(`Reloading Data: ${Engine.$schema.name}`);
                    if (this?.ObjectId === undefined) {
                        throw new errorHandler_1.default('Data not found, please check the ObjectId', '#FF0000');
                    }
                    var reloadedData = await Engine.$searchOne({ $where: { ObjectId: this?.ObjectId } });
                    if (reloadedData) {
                        Object.assign(this, reloadedData);
                        return this;
                    }
                    return null;
                },
                $reload: async (keys) => {
                    if (Engine.$debugMode)
                        debugLog(`Reloading Data: ${Engine.$schema.name}`);
                    if (this?.ObjectId === undefined) {
                        throw new errorHandler_1.default('Data not found, please check the ObjectId', '#FF0000');
                    }
                    var reloadedData = await Engine.$searchOne({ $where: { ObjectId: this?.ObjectId } });
                    if (!reloadedData)
                        return null;
                    for (var key of keys) {
                        if (reloadedData && reloadedData[key] !== undefined) {
                            this[key] = reloadedData[key];
                        }
                    }
                    return this;
                },
                $role: (role) => {
                    if (!dataValues)
                        return null;
                    var getRoles = Reflect.getMetadata(`roles-${Engine.$schema.name}`, Engine.$schema) || {};
                    if (!getRoles[role]) {
                        return { ...dataValues };
                    }
                    var roles = Object.entries(getRoles[role]);
                    var roleResponse = {};
                    for (var [key, value] of roles) {
                        if (value && dataValues[key])
                            roleResponse[key] = dataValues[key];
                    }
                    return roleResponse;
                },
                $update: async (updateQuery) => {
                    if (Engine.$debugMode)
                        debugLog(`Updating Data: ${Engine.$schema.name} - Update Query: ${JSON.stringify(updateQuery)}`);
                    if (this?.ObjectId === undefined) {
                        throw new errorHandler_1.default('Data not found, please check the ObjectId', '#FF0000');
                    }
                    return await Engine.$update({
                        $where: { ObjectId: this.ObjectId },
                        $update: updateQuery,
                    });
                },
                $restore: async () => {
                    if (Engine.$debugMode)
                        debugLog(`Restoring Data: ${Engine.$schema.name} - ObjectId: ${this?.ObjectId}`);
                    if (this?.ObjectId === undefined) {
                        throw new errorHandler_1.default('Data not found, please check the ObjectId', '#FF0000');
                    }
                    return await Engine.$restore({ $where: { ObjectId: this?.ObjectId } });
                },
            };
            if (loadProperties && loadProperties.length > 0) {
                loadProperties.forEach((property) => {
                    const method = availableMethods[property];
                    if (method) {
                        if (Engine.$debugMode)
                            debugLog(`Defining Method: ${Engine.$schema.name} - Method: ${property}`);
                        Object.defineProperty(this, property, {
                            value: method,
                            enumerable: false,
                            configurable: false,
                            writable: false,
                        });
                    }
                });
            }
        }
        ;
    };
    Object.defineProperty(DynamicClass, 'name', { value: Engine.$schema.name });
    return new DynamicClass(dataValues);
}
;
