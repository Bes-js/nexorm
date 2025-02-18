"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Model = exports.Nexorm = void 0;
exports.AllowNull = AllowNull;
exports.UUID = UUID;
exports.Enum = Enum;
exports.AutoIncrement = AutoIncrement;
exports.Default = Default;
exports.Required = Required;
exports.Unique = Unique;
exports.Index = Index;
exports.PrimaryKey = PrimaryKey;
exports.Comment = Comment;
exports.Hash = Hash;
exports.Encrypt = Encrypt;
exports.Decrypt = Decrypt;
exports.Reference = Reference;
exports.Column = Column;
exports.Force = Force;
exports.Paranoid = Paranoid;
exports.Timestamps = Timestamps;
exports.Debug = Debug;
exports.Provider = Provider;
exports.Schema = Schema;
require("reflect-metadata");
const sequelize_1 = require("sequelize");
const uuid_1 = require("uuid");
const node_crypto_1 = __importDefault(require("node:crypto"));
const lodash_1 = __importDefault(require("lodash"));
const fileInspector_1 = require("./fileInspector");
const errorHandler_1 = __importDefault(require("./errorHandler"));
const cacheManager_1 = __importDefault(require("./util/cacheManager"));
var schema = {};
var havePrimaryKey = false;
var haveAutoIncrement = false;
var primaryKeyCount = 0;
var isWarned = false;
var hashFieldsArray = [];
var encryptFieldsArray = [];
var decryptFieldsArray = [];
const export_1 = require("./functions/export");
const chalk_1 = __importDefault(require("chalk"));
const errorParser_1 = require("./util/errorParser");
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
    primaryKeyCount++;
    Reflect.defineMetadata(`primaryKey-${target.name}`, primaryKeyFields, target);
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
        throw new Error('Method is required');
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
        throw new Error('Method is required');
    }
    ;
    if (!cipherKey) {
        throw new Error('Cipher Key is required');
    }
    ;
    if (!iv) {
        throw new Error('IV is required');
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
        throw new Error('Method is required');
    }
    ;
    if (!cipherKey) {
        throw new Error('Cipher Key is required');
    }
    ;
    if (!iv) {
        throw new Error('IV is required');
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
function Column(target, key) {
    if (!Reflect.hasMetadata(`rows-${target.name}`, target)) {
        Reflect.defineMetadata(`rows-${target.name}`, [], target);
    }
    const rows = Reflect.getMetadata(`rows-${target.name}`, target);
    rows.push({ key, keyType: target[key] });
    Reflect.defineMetadata(`rows-${target.name}`, rows, target);
}
;
function Force(target) {
    Reflect.defineMetadata(`force-${target.name}`, true, target);
}
;
function Paranoid(target) {
    Reflect.defineMetadata(`paranoid-${target.name}`, true, target);
}
;
function Timestamps(target) {
    Reflect.defineMetadata(`timestamps-${target.name}`, true, target);
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
function Schema(target) {
    if (!target)
        throw new errorHandler_1.default('Schema Not Found', '#FF0000');
    const rows = Reflect.getMetadata(`rows-${target.name}`, target) || [];
    for (var row of rows) {
        var key = row.key;
        var type = row.keyType;
        var defaultValue = Reflect.getMetadata(`defaults-${target.name}`, target) || null;
        var requiredFields = Reflect.getMetadata(`required-${target.name}`, target) || [];
        var autoIncrementFields = Reflect.getMetadata(`autoIncrement-${target.name}`, target) || [];
        var uniqueFields = Reflect.getMetadata(`unique-${target.name}`, target) || [];
        var indexFields = Reflect.getMetadata(`index-${target.name}`, target) || [];
        var primaryKeyFields = Reflect.getMetadata(`primaryKey-${target.name}`, target) || [];
        var allowNullFields = Reflect.getMetadata(`allowNull-${target.name}`, target) || [];
        var onUpdateFields = Reflect.getMetadata(`onUpdate-${target.name}`, target) || [];
        var onDeleteFields = Reflect.getMetadata(`onDelete-${target.name}`, target) || [];
        var comments = Reflect.getMetadata(`comments-${target.name}`, target) || [];
        var hashFields = Reflect.getMetadata(`hash-${target.name}`, target) || [];
        var encryptFields = Reflect.getMetadata(`encrypt-${target.name}`, target) || [];
        var decryptFields = Reflect.getMetadata(`decrypt-${target.name}`, target) || [];
        var references = Reflect.getMetadata(`references-${target.name}`, target) || [];
        var enums = Reflect.getMetadata(`enum-${target.name}`, target) || [];
        var isRequired = requiredFields.includes(key);
        var isAutoIncrement = autoIncrementFields.includes(key);
        var isUnique = uniqueFields.includes(key);
        var isIndex = indexFields.includes(key);
        var isPrimaryKey = primaryKeyFields.includes(key);
        var isAllowNull = allowNullFields.includes(key);
        var onUpdate = onUpdateFields[key];
        var onDelete = onDeleteFields[key];
        var comment = comments[key];
        var hash = hashFields[key];
        var encrypt = encryptFields[key];
        var decrypt = decryptFields[key];
        var reference = references[key];
        var enumValues = enums[key];
        if (isPrimaryKey)
            havePrimaryKey = true;
        if (hash)
            hashFieldsArray.push({ key, hash });
        if (encrypt)
            encryptFieldsArray.push({ key, method: encrypt.method, cipher: encrypt.cipherKey, iv: encrypt.iv });
        if (decrypt)
            decryptFieldsArray.push({ key, method: decrypt.method, cipher: decrypt.cipherKey, iv: decrypt.iv });
        var objectSchema = {
            type: type,
            index: isIndex,
            allowNull: isAllowNull || false,
            defaultValue: defaultValue[key] || null,
            primaryKey: isPrimaryKey,
            autoIncrement: isAutoIncrement,
            unique: isUnique,
            onUpdate: onUpdate,
            onDelete: onDelete,
            comment: comment,
            hash: hash,
            encrypt: encrypt,
            decrypt: decrypt,
            references: reference,
            enum: enumValues,
        };
        schema[key] = objectSchema;
    }
    ;
    var providerName = Reflect.getMetadata(`provider-${target.name}`, target) || "nexorm";
    var newSchema = convertSchema(schema, providerName, target.name);
    schema = newSchema;
    Reflect.defineMetadata(`schema-${target.name}`, newSchema, target);
    schema = {};
}
;
async function createTable(model, timestamps, force, paranoid, schema, dataName, debug) {
    return await new Promise(async (resolve, reject) => {
        var sequelize = fileInspector_1.sequelizes.find(x => x.name == dataName)?.sequelize;
        if (fileInspector_1.connections.length == 0)
            throw new errorHandler_1.default('Connection not found, Check nexorm.config file.', '#FF0000');
        if (fileInspector_1.connections.some((item) => item == dataName) == false)
            return;
        if (!sequelize)
            throw new errorHandler_1.default('Provider not found, Check nexorm.config file.', '#FF0000');
        if (!timestamps)
            timestamps = false;
        if (!force)
            force = false;
        if (!paranoid)
            paranoid = false;
        var schemaIndexes = Object.keys(schema).filter(x => schema[x]?.index == true);
        class ModelSchema extends sequelize_1.Model {
        }
        ;
        ModelSchema.init(schema, {
            freezeTableName: true,
            sequelize: sequelize,
            timestamps: timestamps,
            modelName: model,
            tableName: model,
            comment: model,
            paranoid: paranoid,
        });
        if (hashFieldsArray.length > 0) {
            hashFieldsArray.forEach((field) => {
                ModelSchema.addHook('beforeSave', async (instance) => {
                    if (lodash_1.default.isArray(instance)) {
                        instance.forEach((item) => {
                            var value = item?.getDataValue(field.key);
                            if (!value)
                                return;
                            if (value) {
                                var hash = node_crypto_1.default.createHash(field.hash.method).update(value).digest(field.hash.digest);
                                item.setDataValue(field.key, hash);
                            }
                            ;
                        });
                    }
                    else {
                        var value = instance?.getDataValue(field.key);
                        if (!value)
                            return;
                        if (value) {
                            var hash = node_crypto_1.default.createHash(field.hash.method).update(value).digest(field.hash.digest);
                            instance.setDataValue(field.key, hash);
                        }
                        ;
                    }
                });
            });
        }
        ;
        if (encryptFieldsArray.length > 0) {
            encryptFieldsArray.forEach((field) => {
                ModelSchema.addHook('beforeSave', async (instance) => {
                    if (lodash_1.default.isArray(instance)) {
                        instance.forEach((item) => {
                            var value = item?.getDataValue(field.key);
                            if (!value)
                                return;
                            if (value) {
                                var cipher = node_crypto_1.default.createCipheriv(field.method, Buffer.from(field.cipher, 'utf8'), Buffer.from(field.iv, 'utf8'));
                                var encrypt = cipher.update(value, 'utf8', 'hex');
                                encrypt += cipher.final('hex');
                                item.setDataValue(field.key, encrypt);
                            }
                            ;
                        });
                    }
                    else {
                        var value = instance?.getDataValue(field.key);
                        if (!value)
                            return;
                        if (value) {
                            var cipher = node_crypto_1.default.createCipheriv(field.method, Buffer.from(field.cipher, 'utf8'), Buffer.from(field.iv, 'utf8'));
                            var encrypt = cipher.update(value, 'utf8', 'hex');
                            encrypt += cipher.final('hex');
                            instance.setDataValue(field.key, encrypt);
                        }
                        ;
                    }
                });
            });
        }
        ;
        if (decryptFieldsArray.length > 0) {
            decryptFieldsArray.forEach((field) => {
                ModelSchema.addHook('afterFind', async (instance, options) => {
                    if (lodash_1.default.isArray(instance)) {
                        instance.forEach((item) => {
                            var value = item?.getDataValue(field.key);
                            if (!value)
                                return;
                            if (value) {
                                var cipher = node_crypto_1.default.createDecipheriv(field.method, Buffer.from(field.cipher), Buffer.from(field.iv));
                                var decrypted = cipher.update(value, 'hex', 'utf8');
                                decrypted += cipher.final('utf8');
                                item.setDataValue(field.key, decrypted);
                            }
                            ;
                        });
                    }
                    else {
                        var value = instance?.getDataValue(field.key);
                        if (!value)
                            return;
                        if (value) {
                            var cipher = node_crypto_1.default.createDecipheriv(field.method, Buffer.from(field.cipher), Buffer.from(field.iv));
                            var decrypted = cipher.update(value, 'hex', 'utf8');
                            decrypted += cipher.final('utf8');
                            instance.setDataValue(field.key, decrypted);
                        }
                        ;
                    }
                    ;
                });
            });
        }
        ;
        /*
         * Sync the model schema with the database.
         * This will create the table if it doesn't exist, and update it if it does.
         */
        try {
            await ModelSchema.sync({
                alter: !force,
                force: force
            });
            if (debug)
                debugLog(`Model '${model}' created successfully`);
        }
        catch (error) {
            console.log(error);
            throw (0, errorParser_1.errorParser)(error);
        }
        ;
        var queryInterface = sequelize.getQueryInterface();
        await queryInterface.describeTable(model).then(async (table) => {
            var tableFields = Object.keys(table);
            var schemaFields = Object.keys(schema);
            var attributesFields = Object.keys(ModelSchema.getAttributes());
            var indexes = await queryInterface.showIndex(model);
            await Promise.all(schemaIndexes.map(async (field) => {
                var indexExists = indexes.some((index) => index.name == `${model}_${field}_index`);
                if (!indexExists) {
                    await queryInterface.addIndex(model, [field], {
                        name: `${model}_${field}_index`,
                        unique: schema[field]?.unique || false,
                        using: schema[field]?.index || 'BTREE',
                    });
                }
                ;
            }));
            await Promise.all(schemaFields.filter(x => !tableFields.includes(x)).map(async (field) => {
                await queryInterface.addColumn(model, field, schema[field]);
            }));
        });
        resolve(ModelSchema);
    }).catch((error) => {
        throw new errorHandler_1.default(error, '#FF0000');
    });
}
;
function convertSchema(schema, dataName, modelName) {
    var newSchema = {};
    var dbType = (0, fileInspector_1.readConfig)().find(x => x.$provider == dataName)?.$database;
    if (!dbType)
        throw new errorHandler_1.default(`Provider '${dataName}' not found, Check nexorm.config file or @Provider decorator in '${modelName}' class.`, '#FF0000');
    const typeMappings = {
        mysql: {
            string: sequelize_1.DataTypes.TEXT,
            number: sequelize_1.DataTypes.FLOAT,
            boolean: sequelize_1.DataTypes.BOOLEAN,
            date: sequelize_1.DataTypes.DATE,
            array: sequelize_1.DataTypes.TEXT,
            object: sequelize_1.DataTypes.TEXT,
            integer: sequelize_1.DataTypes.INTEGER,
            buffer: sequelize_1.DataTypes.BLOB('long')
        },
        postgres: {
            string: sequelize_1.DataTypes.TEXT,
            number: sequelize_1.DataTypes.FLOAT,
            boolean: sequelize_1.DataTypes.BOOLEAN,
            date: sequelize_1.DataTypes.DATE,
            array: sequelize_1.DataTypes.JSON,
            object: sequelize_1.DataTypes.JSON,
            integer: sequelize_1.DataTypes.INTEGER,
            buffer: sequelize_1.DataTypes.BLOB('long')
        },
        sqlite: {
            string: sequelize_1.DataTypes.STRING,
            number: sequelize_1.DataTypes.NUMBER,
            boolean: sequelize_1.DataTypes.BOOLEAN,
            date: sequelize_1.DataTypes.DATE,
            array: sequelize_1.DataTypes.JSON,
            object: sequelize_1.DataTypes.JSON,
            integer: sequelize_1.DataTypes.INTEGER,
            buffer: sequelize_1.DataTypes.BLOB('long')
        },
        mariadb: {
            string: sequelize_1.DataTypes.TEXT,
            number: sequelize_1.DataTypes.FLOAT,
            boolean: sequelize_1.DataTypes.BOOLEAN,
            date: sequelize_1.DataTypes.DATE,
            array: sequelize_1.DataTypes.JSON,
            object: sequelize_1.DataTypes.JSON,
            integer: sequelize_1.DataTypes.INTEGER,
            buffer: sequelize_1.DataTypes.BLOB('long')
        },
        mssql: {
            string: sequelize_1.DataTypes.TEXT,
            number: sequelize_1.DataTypes.FLOAT,
            boolean: sequelize_1.DataTypes.BOOLEAN,
            date: sequelize_1.DataTypes.DATE,
            array: sequelize_1.DataTypes.JSON,
            object: sequelize_1.DataTypes.JSON,
            integer: sequelize_1.DataTypes.INTEGER,
            buffer: sequelize_1.DataTypes.BLOB('long')
        },
    };
    var schemaKeys = Object.keys(schema);
    if (schemaKeys.length == 0)
        throw new errorHandler_1.default('Schema Not Found', '#FF0000');
    schemaKeys?.forEach((key, index) => {
        var dbType = (0, fileInspector_1.readConfig)().find(x => x.$provider == dataName)?.$database;
        if (!dbType)
            throw new errorHandler_1.default('Database not found, Check nexorm.config file.', '#FF0000');
        var schemaValue = schema[key]?.type;
        var defaultValue = schema[key]?.defaultValue;
        if (schemaValue == undefined ||
            !["String", "Number", "Boolean", "Array", "Object", "Date", "BigInt", "Buffer"].some((query) => String(schemaValue).includes(query)))
            throw new errorHandler_1.default('Invalid Type Or Type Not Found, Use For Example: \'static username = String\'', '#FF0000');
        var requiredValue = schema[key]?.required;
        if (index == 0) {
            newSchema["nexorm_id"] = {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: false,
                defaultValue: node_crypto_1.default.randomUUID(),
                primaryKey: havePrimaryKey ? false : true,
                unique: true,
                comment: 'Nexorm ID',
            };
        }
        ;
        if (!newSchema[key])
            newSchema[key] = {};
        if (String(schemaValue).includes("Array") || lodash_1.default.isArray(schemaValue)) {
            newSchema[key].type = typeMappings[dbType]?.array;
        }
        else if (String(schemaValue).includes("String")) {
            newSchema[key].type = typeMappings[dbType]?.string;
        }
        else if (String(schemaValue).includes("Number")) {
            if (schema[key]?.autoIncrement) {
                newSchema[key].type = typeMappings[dbType]?.integer;
                newSchema[key].autoIncrement = true;
                newSchema[key].primaryKey = true;
            }
            else {
                newSchema[key].type = typeMappings[dbType]?.number;
            }
        }
        else if (String(schemaValue).includes("Boolean")) {
            newSchema[key].type = typeMappings[dbType]?.boolean;
        }
        else if (String(schemaValue).includes("Object")) {
            newSchema[key].type = typeMappings[dbType]?.object;
        }
        else if (String(schemaValue).includes("Date")) {
            newSchema[key].type = typeMappings[dbType]?.date;
        }
        else if (String(schemaValue).includes("BigInt")) {
            newSchema[key].type = typeMappings[dbType]?.integer;
            newSchema[key].validate = { isInt: true };
        }
        else if (String(schemaValue).includes("Buffer")) {
            newSchema[key].type = typeMappings[dbType]?.buffer;
        }
        ;
        if (defaultValue == null && requiredValue == true && !schema[key]?.autoIncrement) {
            if (String(schemaValue).includes("Object")) {
                schema[key].defaultValue = {};
            }
            else if (String(schemaValue).includes("Array") || lodash_1.default.isArray(schemaValue)) {
                schema[key].defaultValue = [];
            }
            else if (String(schemaValue).includes("String")) {
                schema[key].defaultValue = '';
            }
            else if (String(schemaValue).includes("Number")) {
                schema[key].defaultValue = 0;
            }
            else if (String(schemaValue).includes("Boolean")) {
                schema[key].defaultValue = dbType == 'sqlite' ? 0 : false;
            }
            else if (String(schemaValue).includes("Date")) {
                schema[key].defaultValue = new Date();
            }
            if (String(schemaValue).includes("BigInt")) {
                schema[key].defaultValue = 0;
            }
        }
        ;
        if (schema[key]?.autoIncrement && !String(schemaValue).includes("Number") && !String(schemaValue).includes('BigInt'))
            throw new errorHandler_1.default('@AutoIncrement Can Only Be Used With Number Or Integer Type', '#FF0000');
        if (schema[key]?.hash && !String(schemaValue).includes("String"))
            throw new errorHandler_1.default('@Hash Can Only Be Used With String Type', '#FF0000');
        if (schema[key]?.encrypt && !String(schemaValue).includes("String"))
            throw new errorHandler_1.default('@Encrypt Can Only Be Used With String Type', '#FF0000');
        if (schema[key]?.decrypt && !String(schemaValue).includes("String"))
            throw new errorHandler_1.default('@Decrypt Can Only Be Used With String Type', '#FF0000');
        if (primaryKeyCount > 1 && haveAutoIncrement)
            throw new errorHandler_1.default('Multiple @PrimaryKey Not Supported With @AutoIncrement', '#FF0000');
        if (!haveAutoIncrement && schema[key]?.autoIncrement)
            haveAutoIncrement = true;
        if (!schema[key]?.autoIncrement)
            newSchema[key].index = schema[key]?.index || false;
        if (!schema[key]?.autoIncrement)
            newSchema[key].allowNull = requiredValue ? false : true;
        if (!schema[key]?.autoIncrement)
            newSchema[key].defaultValue = schema[key]?.defaultValue;
        newSchema[key].primaryKey = schema[key]?.primaryKey || false;
        newSchema[key].autoIncrement = schema[key]?.autoIncrement || false;
        if (!schema[key]?.autoIncrement)
            newSchema[key].unique = schema[key]?.unique || false;
        if (!schema[key]?.autoIncrement)
            newSchema[key].onUpdate = schema[key]?.onUpdate || null;
        if (!schema[key]?.autoIncrement)
            newSchema[key].onDelete = schema[key]?.onDelete || null;
        if (!schema[key]?.autoIncrement)
            newSchema[key].comment = schema[key]?.comment || null;
        if (!schema[key]?.autoIncrement && schema[key]?.enum?.length > 0)
            newSchema[key].validate = {
                ...newSchema[key].validate, isIn: [schema[key]?.enum]
            };
        if (schema[key]?.primaryKey) {
            newSchema[key].allowNull = false;
            newSchema[key].unique = true;
        }
        ;
    });
    return newSchema;
}
;
;
;
;
;
;
;
/*
type IncludeOption = {
  $model: any;
  $as?: string;
  $attributes?: string[] | { $exclude?: string[]; $include?: string[] };
}[];
*/
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
    static $configs = (0, fileInspector_1.readConfig)();
    /**
     * Nexorm Providers
     * @type {string[]}
     * @public
     * @static
     * @example Nexorm.$providers
     */
    static $providers = fileInspector_1.sequelizes.map(x => x.name);
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
        await (0, fileInspector_1.autoConnect)(providerName);
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
        var notConnected = Nexorm.$providers.filter(x => !fileInspector_1.connections.find(y => y == x));
        for (var i = 0; i < notConnected.length; i++) {
            await (0, fileInspector_1.autoConnect)(notConnected[i]);
        }
        ;
    }
    ;
}
exports.Nexorm = Nexorm;
;
class Model {
    Schema;
    $type;
    $model;
    $middlewares = [];
    $cache = new cacheManager_1.default();
    $config;
    $debugMode = false;
    schema;
    model;
    constructor(Schema) {
        this.Schema = Schema;
        this.schema = Schema;
        this.$middlewares = [];
        this.$config = (0, fileInspector_1.readConfig)()?.find(x => x.$provider == databaseName);
        if (!String(Schema).includes("class"))
            throw new errorHandler_1.default('Schema Must Be A Static Class', '#FF0000');
        var databaseName = Reflect.getMetadata(`databaseName-${this.schema.name}`, this.schema) || "nexorm";
        if (!databaseName)
            throw new errorHandler_1.default('Database Not Found, Check nexorm.config file.', '#FF0000');
        if (!fileInspector_1.connections.find(x => x == databaseName))
            return;
        var schema = Reflect.getMetadata(`schema-${this.schema.name}`, this.schema) || {};
        var timestamps = Reflect.getMetadata(`timestamps-${this.schema.name}`, this.schema) || false;
        var force = Reflect.getMetadata(`force-${this.schema.name}`, this.schema) || false;
        var paranoid = Reflect.getMetadata(`paranoid-${this.schema.name}`, this.schema) || false;
        var debug = Reflect.getMetadata(`debug-${this.schema.name}`, this.schema) || false;
        this.$debugMode = debug;
        this.model = createTable(this.schema.name, timestamps, force, paranoid, schema, databaseName, debug).then((model) => {
            if (this.$debugMode)
                debugLog(`Table Created & Synced: ${this.schema.name}`);
            return model;
        }).catch((err) => {
            throw (0, errorParser_1.errorParser)(err);
        });
        this.$model = fileInspector_1.sequelizes.find((x) => x.name == databaseName)?.sequelize.models[this.schema?.name];
    }
    ;
    /**
     * Search
     * @param query Query
     * @param query.$where Where
     * @param query.$options Options
     * @returns Promise<StaticProps<ExtendType<SchemaProps,{nexorm_id:string}>>
     * @example model.$search({ $where: { name: 'John' } })
     * @async
     * @public
     * @type {Function}
     */
    async $search(query) {
        var execute = await this.#execute();
        if (this.$debugMode)
            debugLog(`Searching Data: ${this.schema.name} - $where: ${JSON.stringify(query?.$where)} - $options: ${JSON.stringify(query?.$options)}`);
        return (execute.search(query?.$where, query?.$options) || []);
    }
    ;
    /**
     * Search First
     * @returns Promise<StaticProps<ExtendType<SchemaProps,{nexorm_id:string}>>
     * @example model.$searchFirst()
     * @async
     * @public
     * @type {Function}
     */
    async $searchFirst() {
        var execute = await this.#execute();
        if (this.$debugMode)
            debugLog(`Searching First Data: ${this.schema.name}`);
        return execute.searchOne({}, {});
    }
    ;
    /**
     * Search One
     * @param query Query
     * @param query.$where Where
     * @param query.$options Options
     * @returns Promise<StaticProps<ExtendType<SchemaProps,{nexorm_id:string}>>
     * @example model.$searchOne({ $where: { name: 'John' } })
     * @async
     * @public
     * @type {Function}
     */
    async $searchOne(query) {
        var execute = await this.#execute();
        if (this.$debugMode)
            debugLog(`Searching One Data: ${this.schema.name} - $where: ${JSON.stringify(query?.$where)} - $options: ${JSON.stringify(query?.$options)}`);
        return execute.searchOne(query?.$where, query?.$options);
    }
    ;
    /**
     * Search By Id
     * @param nexorm_id Nexorm ID
     * @returns Promise<StaticProps<ExtendType<SchemaProps,{nexorm_id:string}>>
     * @example model.$searchById('1')
     * @async
     * @public
     * @type {Function}
     */
    async $searchById(nexorm_id) {
        var execute = await this.#execute();
        if (this.$debugMode)
            debugLog(`Searching By ID: ${this.schema.name} - $where: { nexorm_id: ${nexorm_id} }`);
        return execute.searchOne({ nexorm_id });
    }
    ;
    /**
     * Search By Ids
     * @param ids Nexorm IDs
     * @returns Promise<StaticProps<ExtendType<SchemaProps,{nexorm_id:string}>>
     * @example model.$searchByIds(['1','2','3'])
     * @async
     * @public
     * @type {Function}
     */
    async $searchByIds(ids) {
        var execute = await this.#execute();
        if (this.$debugMode)
            debugLog(`Searching By IDs: ${this.schema.name} - $where: { nexorm_id: { $in: ${ids} } }`);
        return execute.search({ nexorm_id: { $in: ids } });
    }
    ;
    /**
     * Search And Count
     * @param query Query
     * @param query.$where Where
     * @returns Promise<[StaticProps<ExtendType<SchemaProps,{nexorm_id:string}>>[], number]>
     * @example model.$searchAndCount({ $where: { name: 'John' } })
     * @async
     * @public
     * @type {Function}
     */
    async $searchAndCount(query) {
        var execute = await this.#execute();
        if (this.$debugMode)
            debugLog(`Searching And Counting Data: ${this.schema.name} - $where: ${JSON.stringify(query?.$where)}`);
        var counts = await execute.count(query?.$where, {});
        var data = await execute.search(query?.$where, {});
        return [data, counts];
    }
    ;
    /**
     * Create
     * @param data Data
     * @returns Promise<StaticProps<ExtendType<SchemaProps,{nexorm_id:string}>>
     * @example model.$create({ name: 'John' })
     * @async
     * @public
     * @type {Function}
     */
    async $everything() {
        var execute = await this.#execute();
        if (this.$debugMode)
            debugLog(`Searching Everything: ${this.schema.name}`);
        return execute.search({}, {});
    }
    ;
    /**
     * Build
     * @param data Data
     * @returns Promise<StaticProps<ExtendType<SchemaProps,{nexorm_id:string}>>
     * @example model.$build({ name: 'John' })
     * @async
     * @public
     * @type {Function}
     */
    async $build(data) {
        var execute = await this.#execute();
        if (this.$debugMode)
            debugLog(`Building Data: ${this.schema.name} - Data: ${JSON.stringify(data)}`);
        return execute.build(data);
    }
    ;
    /**
     * Build Many
     * @param data Data
     * @returns Promise<StaticProps<ExtendType<SchemaProps,{nexorm_id:string}>>
     * @example model.$buildMany([{ name: 'John' }, { name: 'Doe' }])
     * @async
     * @public
     * @type {Function}
     */
    async $buildMany(data) {
        var execute = await this.#execute();
        if (this.$debugMode)
            debugLog(`Building Many Data: ${this.schema.name} - Data: ${JSON.stringify(data)}`);
        return execute.buildMany(data);
    }
    ;
    /**
     * Update
     * @param query Query
     * @param query.$where Where
     * @param query.$update Update
     * @param query.$rules Rules
     * @param query.$options Options
     * @returns Promise<StaticProps<ExtendType<SchemaProps,{nexorm_id:string}>>
     * @example model.$update({ $where: { name: 'John' }, $update: { $set: { name: 'Five' } } })
     * @async
     * @public
     * @type {Function}
     */
    async $update(query) {
        var execute = await this.#execute();
        if (this.$debugMode)
            debugLog(`Updating Data: ${this.schema.name} - $where: ${JSON.stringify(query?.$where)} - $update: ${JSON.stringify(query?.$update)} - $options: ${JSON.stringify(query?.$options)} - $rules: ${JSON.stringify(query?.$rules)}`);
        if (query && !query.$options)
            query.$options = {};
        return execute.update(query?.$where, query?.$update, query?.$rules, query?.$options);
    }
    ;
    /**
     * Update Many
     * @param query Query
     * @param query.$where Where
     * @param query.$update Update
     * @param query.$rules Rules
     * @param query.$options Options
     * @returns Promise<StaticProps<ExtendType<SchemaProps,{nexorm_id:string}>>
     * @example model.$updateMany({ $where: { name: 'John' }, $update: { $set: { name: 'Five' } } })
     * @async
     * @public
     * @type {Function}
     */
    async $updateMany(query) {
        var execute = await this.#execute();
        if (this.$debugMode)
            debugLog(`Updating Many Data: ${this.schema.name} - $where: ${JSON.stringify(query?.$where)} - $update: ${JSON.stringify(query?.$update)} - $options: ${JSON.stringify(query?.$options)} - $rules: ${JSON.stringify(query?.$rules)}`);
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
            debugLog(`Deleting Data: ${this.schema.name} - $where: ${JSON.stringify(query?.$where)} - $options: ${JSON.stringify(query?.$options)}`);
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
            debugLog(`Deleting Many Data: ${this.schema.name} - $where: ${JSON.stringify(query?.$where)} - $options: ${JSON.stringify(query?.$options)}`);
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
            debugLog(`Soft Deleting Data: ${this.schema.name} - $where: ${JSON.stringify(query?.$where)} - $options: ${JSON.stringify(query?.$options)}`);
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
            debugLog(`Soft Deleting Many Data: ${this.schema.name} - $where: ${JSON.stringify(query?.$where)} - $options: ${JSON.stringify(query?.$options)}`);
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
            debugLog(`Restoring Data: ${this.schema.name} - $where: ${JSON.stringify(query?.$where)} - $options: ${JSON.stringify(query?.$options)}`);
        return execute.restore(query?.$where, query?.$options);
    }
    async $count(query) {
        var execute = await this.#execute();
        if (this.$debugMode)
            debugLog(`Counting Data: ${this.schema.name} - $where: ${JSON.stringify(query?.$where)} - $options: ${JSON.stringify(query?.$options)}`);
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
     * @returns Promise<StaticProps<ExtendType<SchemaProps,{nexorm_id:string}>>
     * @example model.$upsert({ $where: { name: 'John' }, $update: { $set: { name: 'Five' } } })
     * @async
     * @public
     * @type {Function}
     */
    async $upsert(query) {
        var execute = await this.#execute();
        if (this.$debugMode)
            debugLog(`Upserting Data: ${this.schema.name} - $where: ${JSON.stringify(query.$where)} - $update: ${JSON.stringify(query.$update)} - $options: ${JSON.stringify(query.$options)} - $rules: ${JSON.stringify(query.$rules)}`);
        return execute.update(query.$where, query.$update, query.$rules, { $upsert: true, ...query.$options });
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
            debugLog(`Querying Data: ${this.schema.name} - Query: ${query}`);
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
            debugLog(`Distinct Data: ${this.schema.name} - $field: ${JSON.stringify(query.$field)} - $where: ${JSON.stringify(query.$where)} - $options: ${JSON.stringify(query.$options)}`);
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
            debugLog(`Truncating Data: ${this.schema.name}`);
        return execute.truncate();
    }
    ;
    /* Private Functions */
    /* Next Update */
    /*
    private async runMiddlewares(params: any, handler: (params: any) => Promise<any>) {
      let index = -1;
  
      const next = async (currentParams: any): Promise<any> => {
        index++;
        if (index < this.$middlewares.length) {
          return this.$middlewares[index](currentParams, next);
        }
        return handler(currentParams);
      };
  
      return next(params);
    };
    */
    /* Plugins */
    /* Next Update */
    /*
    $use(plugin: (
      params:  BuildProps<ExtendType<Omit<SchemaProps,'prototype'>,{nexorm_id:string}>>,
      action: '$search' | '$searchOne' | '$searchById' | '$searchByIds' | '$everything' | '$build' | '$buildMany' | '$update' | '$updateMany' | '$delete' | '$deleteMany' | '$softDelete' | '$softDeleteMany' | '$restore' | '$count' | '$upsert' | '$query' | '$distinct' | '$truncate',
      next:(params: BuildProps<ExtendType<Omit<SchemaProps,'prototype'>,{nexorm_id:string}>>) => Promise<void>
    ) => void) {
      this.$middlewares.push(plugin);
    };
    */
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
                    debugLog(`Before Create Hook: ${this.schema.name} - Data: ${JSON.stringify(instance.dataValues)} - Fields: ${JSON.stringify(options.fields)}`);
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
                    debugLog(`After Create Hook: ${this.schema.name} - Data: ${JSON.stringify(instance.dataValues)} - Fields: ${JSON.stringify(options.fields)}`);
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
                    debugLog(`After Update Hook: ${this.schema.name} - Data: ${JSON.stringify(instance.dataValues)} - Fields: ${JSON.stringify(options.fields)}`);
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
                    debugLog(`Before Destroy Hook: ${this.schema.name} - Data: ${JSON.stringify(instance.dataValues)}`);
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
                    debugLog(`After Destroy Hook: ${this.schema.name} - Data: ${JSON.stringify(instance.dataValues)}`);
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
                    debugLog(`Before Update Hook: ${this.schema.name} - Data: ${JSON.stringify(instance.dataValues)} - Fields: ${JSON.stringify(options.fields)}`);
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
                    debugLog(`Before Save Hook: ${this.schema.name} - Data: ${JSON.stringify(instance.dataValues)} - Fields: ${JSON.stringify(options.fields)}`);
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
                    debugLog(`After Save Hook: ${this.schema.name} - Data: ${JSON.stringify(instance.dataValues)} - Fields: ${JSON.stringify(options.fields)}`);
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
                    debugLog(`Before Bulk Create Hook: ${this.schema.name} - Data: ${JSON.stringify(instance)} - Fields: ${JSON.stringify(options.fields)}`);
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
                    debugLog(`After Bulk Create Hook: ${this.schema.name} - Data: ${JSON.stringify(instance)} - Fields: ${JSON.stringify(options.fields)}`);
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
                    debugLog(`Before Bulk Update Hook: ${this.schema.name} - Fields: ${JSON.stringify(options.fields)}`);
                callback(this.schema.name, options.fields);
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
                    debugLog(`After Bulk Update Hook: ${this.schema.name} - Fields: ${JSON.stringify(options.fields)}`);
                callback(this.schema.name, options.fields);
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
                    debugLog(`Before Bulk Destroy Hook: ${this.schema.name} - Fields: ${JSON.stringify(options.fields)}`);
                callback(this.schema.name, options.fields);
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
                    debugLog(`After Bulk Destroy Hook: ${this.schema.name}`);
                callback(this.schema.name);
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
                    debugLog(`Before Find Hook: ${this.schema.name} - Data: ${JSON.stringify(options.where)}`);
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
                    debugLog(`After Find Hook: ${this.schema.name} - Data: ${JSON.stringify(instance.dataValues)}`);
                callback(instance.dataValues);
            });
        }
    };
    async #execute() {
        var cacheModel = await this.model;
        this.model = cacheModel;
        return {
            search: async (filter, options) => {
                return await (0, export_1.search)(this.model, filter, options, this.$cache, this.$config) || [];
            },
            searchOne: async (filter, options) => {
                return await (0, export_1.searchOne)(this.model, filter, options, this.$cache, this.$config) || null;
            },
            build: async (data) => {
                return await (0, export_1.build)(this.model, data);
            },
            buildMany: async (data) => {
                return await (0, export_1.buildMany)(this.model, data);
            },
            update: async (where, update, rules, options) => {
                return await (0, export_1.updateOne)(this.model, where, update, rules, options, this.schema);
            },
            delete: async (where, options, multiple) => {
                if (multiple)
                    return await (0, export_1.deleteMany)(this.model, where, options);
                return (await (0, export_1.deleteMany)(this.model, where, options) ? true : false);
            },
            restore: async (where, options) => {
                return await (0, export_1.restore)(this.model, where, options);
            },
            count: async (where, options) => {
                return await (0, export_1.count)(this.model, where, options);
            },
            query: async (query) => {
                return await this.$model?.sequelize?.query(query);
            },
            distinct: async (field, where, options) => {
                return await (0, export_1.distinct)(this.model, field, where, options, this.$cache, this.$config);
            },
            truncate: async () => {
                return await this.$model?.sequelize?.truncate();
            },
        };
    }
}
exports.Model = Model;
function debugLog(message) {
    console.log(chalk_1.default.blue.bold(`[Nexorm Debug]: ${message}`));
}
;
