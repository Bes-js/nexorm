"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getModel = getModel;
exports.getTarget = getTarget;
exports.getProviderModels = getProviderModels;
exports.initializeBuilder = initializeBuilder;
exports.Schema = Schema;
exports.createTable = createTable;
exports.loadRelationships = loadRelationships;
exports.loadIndexed = loadIndexed;
const sequelize_1 = require("sequelize");
const lodash_1 = __importDefault(require("lodash"));
const crypto_1 = __importDefault(require("crypto"));
const chalk_1 = __importDefault(require("chalk"));
const errorHandler_1 = __importDefault(require("./errorHandler"));
const fileInspector_1 = require("./fileInspector");
var cachedConfig = [];
var sequelizes = [];
var schema = {};
var havePrimaryKey = false;
var haveAutoIncrement = {};
var primaryKeyCount = {};
var idColumn = '';
var isWarned = false;
var hashFieldsArray = [];
var encryptFieldsArray = [];
var decryptFieldsArray = [];
var models = [];
var modelsCache = {};
async function getModel(providerName, modelName) {
    return modelsCache[`${providerName}-${modelName}`]?.model || null;
}
;
async function getTarget(providerName, modelName) {
    return modelsCache[`${providerName}-${modelName}`] || null;
}
;
async function getProviderModels(providerName) {
    return Object.values(modelsCache).filter(model => model.providerName === providerName);
}
async function initializeBuilder(providerName, model, sequelize) {
    if (!providerName)
        providerName = 'nexorm';
    var schemaModel = model?.$schema;
    var config = await (0, fileInspector_1.readConfig)().catch((error) => { return undefined; });
    if (!config)
        throw new errorHandler_1.default('Config file not found, Check nexorm.config file.', '#FF0000');
    var providerConfig = config.find(x => x.$provider == providerName);
    if (!providerConfig)
        throw new errorHandler_1.default(`Provider '${providerName}' not found, Check nexorm.config file or @Provider decorator in '${schemaModel.name}' class.`, '#FF0000');
    var dataName = providerConfig.$provider || providerName || 'nexorm';
    var schema = Reflect.getMetadata(`schema-${schemaModel.name}`, schemaModel) || null;
    if (!schema)
        return;
    Reflect.defineMetadata(`databaseName-${schemaModel.name}`, providerName, schemaModel);
    var convertedSchema = await convertSchema(schema, dataName, schemaModel.name).catch((error) => {
        throw new errorHandler_1.default(`Error converting schema for model '${schemaModel.name}': ${error.message}`, '#FF0000');
    });
    if (!convertedSchema)
        throw new errorHandler_1.default(`Converted schema not found for model '${schemaModel.name}', Check @Schema decorator in '${schemaModel.name}' class.`, '#FF0000');
    var createdAt = Reflect.getMetadata(`createdAt-${schemaModel.name}`, schemaModel) || false;
    var updatedAt = Reflect.getMetadata(`updatedAt-${schemaModel.name}`, schemaModel) || false;
    var deletedAt = Reflect.getMetadata(`deletedAt-${schemaModel.name}`, schemaModel) || false;
    var force = Reflect.getMetadata(`force-${schemaModel.name}`, schemaModel) || false;
    var paranoid = Reflect.getMetadata(`paranoid-${schemaModel.name}`, schemaModel) || false;
    var debug = Reflect.getMetadata(`debug-${schemaModel.name}`, schemaModel) || false;
    var createdModel = await createTable(schemaModel.name, sequelize, {
        createdAt: createdAt,
        updatedAt: updatedAt,
        deletedAt: deletedAt
    }, force, paranoid, convertedSchema, dataName, debug, schemaModel).catch((error) => {
        throw new errorHandler_1.default(`Error creating table for model '${schemaModel.name}': ${error.message}`, '#FF0000');
    });
    modelsCache[`${providerName}-${schemaModel.name}`] = {
        providerName,
        model: createdModel,
        schema: convertedSchema,
        $schema: schemaModel
    };
    return createdModel;
}
;
/* Schema Decorator */
function Schema(target) {
    if (!target)
        throw new errorHandler_1.default('Schema Not Found', '#FF0000');
    var schema = {};
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
            defaultValue: defaultValue?.hasOwnProperty(key) ? defaultValue[key] : null,
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
            get: function () { },
            set: function (value) { }
        };
        schema[key] = objectSchema;
    }
    ;
    Reflect.defineMetadata(`schema-${target.name}`, schema, target);
    schema = {};
}
;
async function createTable(model, sequelize, timestamps, force, paranoid, schema, dataName, debug, target) {
    return await new Promise(async (resolve, reject) => {
        /*
        if (!connections || connections.length == 0) throw new ErrorHandler('Connection not found, Check nexorm.config file.', '#FF0000');
        if (connections.some((item) => item == dataName) == false) return;
        */
        if (!sequelize)
            throw new errorHandler_1.default('Provider not found, Check nexorm.config file.', '#FF0000');
        if (!force)
            force = false;
        if (!paranoid)
            paranoid = false;
        if (timestamps?.deletedAt)
            paranoid = true;
        class ModelSchema extends sequelize_1.Model {
        }
        ;
        ModelSchema.init(schema, {
            freezeTableName: true,
            sequelize: sequelize,
            createdAt: timestamps?.createdAt,
            updatedAt: timestamps?.updatedAt,
            deletedAt: timestamps?.deletedAt,
            modelName: model,
            tableName: model,
            comment: model,
            paranoid: timestamps?.deletedAt ? true : paranoid,
            hasTrigger: true,
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
                                var hash = crypto_1.default.createHash(field.hash.method).update(value).digest(field.hash.digest);
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
                            var hash = crypto_1.default.createHash(field.hash.method).update(value).digest(field.hash.digest);
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
                                var cipher = crypto_1.default.createCipheriv(field.method, Buffer.from(field.cipher, 'utf8'), Buffer.from(field.iv, 'utf8'));
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
                            var cipher = crypto_1.default.createCipheriv(field.method, Buffer.from(field.cipher, 'utf8'), Buffer.from(field.iv, 'utf8'));
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
                                var cipher = crypto_1.default.createDecipheriv(field.method, Buffer.from(field.cipher), Buffer.from(field.iv));
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
                            var cipher = crypto_1.default.createDecipheriv(field.method, Buffer.from(field.cipher), Buffer.from(field.iv));
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
        /*
        try {
            await ModelSchema.sync({
                alter: !force,
                force: force
            });
            if (debug) debugLog(`Model '${model}' created successfully`);
        } catch (error) {
            throw errorParser(error);
        };
        */
        resolve(ModelSchema);
    }).catch((error) => {
        throw new errorHandler_1.default(error, '#FF0000');
    });
}
;
async function loadRelationships(model, sequelize, schema, ModelSchema, providerName) {
    const idColumn = Reflect.getMetadata(`autoIncrement-${model}`, schema) || '';
    if (!idColumn) {
        throw new errorHandler_1.default(`Model '${model}' does not have an auto-increment field defined. Please define an auto-increment field using @AutoIncrement decorator.`, '#FF0000');
    }
    const oneToOne = Reflect.getMetadata(`oneToOne-${model}`, schema) || {};
    const oneToMany = Reflect.getMetadata(`oneToMany-${model}`, schema) || {};
    const manyToMany = Reflect.getMetadata(`manyToMany-${model}`, schema) || {};
    const manyToOne = Reflect.getMetadata(`manyToOne-${model}`, schema) || {};
    const parseReflection = (func) => {
        const stringFunction = func?.toString();
        if (!stringFunction || typeof stringFunction !== 'string')
            return null;
        const matchField = stringFunction.match(/=>\s*([\w.]+)/);
        if (matchField) {
            const getSplitedValue = matchField[1].split('.')[1];
            if (!getSplitedValue || typeof getSplitedValue !== 'string')
                return null;
            return getSplitedValue;
        }
        else {
            return null;
        }
    };
    await Promise.all(Object.entries(oneToOne).map(async ([key, field]) => {
        var TargetName = field.relatedModel()?.name;
        var findedModel = await getTarget(providerName, TargetName);
        var TargetIdColumn = Reflect.getMetadata(`autoIncrement-${TargetName}`, field.relatedModel()) || '';
        var foreignKey = parseReflection(field?.inverse);
        if (!findedModel || !foreignKey)
            return;
        var fieldOptions = field?.options;
        if (fieldOptions) {
            ModelSchema.hasOne(findedModel.model, {
                foreignKey: fieldOptions?.$foreignKey || foreignKey || undefined,
                foreignKeyConstraint: fieldOptions?.$foreignKeyConstraint || undefined,
                sourceKey: fieldOptions?.$sourceKey || undefined,
                as: fieldOptions?.$as || undefined,
                onDelete: fieldOptions.$onDelete || 'CASCADE',
                onUpdate: fieldOptions.$onUpdate || 'CASCADE',
                constraints: fieldOptions.$constraints || undefined,
                hooks: fieldOptions.$hooks || undefined,
                keyType: fieldOptions.$keyType || undefined,
            });
        }
        else {
            ModelSchema.hasOne(findedModel.model, {
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
                foreignKey: foreignKey || undefined,
            });
        }
    }));
    await Promise.all(Object.entries(oneToMany).map(async ([key, field]) => {
        /*
        if (rel.type === 'OneToMany') {
    model.hasMany(targetModel, {
      foreignKey,
      as: rel.propertyKey,
    });
    targetModel.belongsTo(model, {
      foreignKey,
      as: parseReflection(rel.inverse),
    });
  }

  if (rel.type === 'ManyToOne') {
    model.belongsTo(targetModel, {
      foreignKey,
      as: rel.propertyKey,
    });
    targetModel.hasMany(model, {
      foreignKey,
      as: parseReflection(rel.inverse),
    });
  }

BU MANTIĞA GEÇİLİCEK DOĞRU MANTIK BU

    */
        var TargetName = field.relatedModel()?.name;
        var SourcePop = field.sourcePop || '';
        var findedModel = await getTarget(providerName, TargetName);
        var TargetIdColumn = Reflect.getMetadata(`autoIncrement-${TargetName}`, field.relatedModel())[0] || '';
        var foreignKey = parseReflection(field?.inverse);
        if (!findedModel || !foreignKey)
            return;
        var fieldOptions = field?.options;
        if (field?.options) {
            ModelSchema.hasMany(findedModel.model, {
                foreignKey: fieldOptions?.$foreignKey || foreignKey || undefined,
                foreignKeyConstraint: fieldOptions?.$foreignKeyConstraint || undefined,
                sourceKey: fieldOptions?.$sourceKey || undefined,
                as: fieldOptions?.$as || undefined,
                onDelete: fieldOptions.$onDelete || 'CASCADE',
                onUpdate: fieldOptions.$onUpdate || 'CASCADE',
                constraints: fieldOptions.$constraints || undefined,
                hooks: fieldOptions.$hooks || undefined,
                keyType: fieldOptions.$keyType || undefined,
            });
        }
        else {
            ModelSchema.hasMany(findedModel.model, {
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
                foreignKey: foreignKey || undefined,
            });
        }
        ;
    }));
    await Promise.all(Object.entries(manyToMany).map(async ([key, field]) => {
        var TargetName = field.relatedModel()?.name;
        var findedModel = await getTarget(providerName, TargetName);
        var foreignKey = parseReflection(field?.inverse);
        if (!findedModel || !foreignKey)
            return;
        var fieldOptions = field?.options;
        if (field?.options) {
            ModelSchema.belongsToMany(findedModel.model, {
                foreignKey: fieldOptions?.$foreignKey || foreignKey || undefined,
                through: fieldOptions?.$through || `${ModelSchema.toString()}_${TargetName}`,
                otherKey: fieldOptions?.$otherKey || undefined,
                sourceKey: fieldOptions?.$sourceKey || undefined,
                targetKey: fieldOptions?.$targetKey || undefined,
                as: fieldOptions?.$as || undefined,
                onDelete: fieldOptions.$onDelete || 'CASCADE',
                onUpdate: fieldOptions.$onUpdate || 'CASCADE',
                constraints: fieldOptions.$constraints || undefined,
                hooks: fieldOptions.$hooks || undefined,
                timestamps: fieldOptions.$timestamps || undefined,
                uniqueKey: fieldOptions.$uniqueKey || undefined,
                foreignKeyConstraint: fieldOptions?.$foreignKeyConstraint || undefined,
            });
        }
        else {
            ModelSchema.belongsToMany(findedModel.model, {
                through: `${ModelSchema.toString()}_${TargetName}`,
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
                foreignKey: foreignKey || undefined,
            });
        }
    }));
    await Promise.all(Object.entries(manyToOne).map(async ([key, field]) => {
        var TargetName = field.relatedModel()?.name;
        var findedModel = await getTarget(providerName, TargetName);
        var foreignKey = parseReflection(field?.inverse);
        if (!findedModel || !foreignKey)
            return;
        if (field?.options) {
            ModelSchema.belongsTo(findedModel.model, {
                foreignKey: field?.options?.$foreignKey || foreignKey || undefined,
                foreignKeyConstraint: field?.options?.$foreignKeyConstraint || undefined,
                as: field?.options?.$as || undefined,
                targetKey: field?.options?.$targetKey || undefined,
                constraints: field?.options?.$constraints || undefined,
                hooks: field?.options?.$hooks || undefined,
                keyType: field?.options?.$keyType || undefined,
                onDelete: field?.options?.$onDelete || 'CASCADE',
                onUpdate: field?.options?.$onUpdate || 'CASCADE',
            });
        }
        else {
            ModelSchema.belongsTo(findedModel.model, {
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
                foreignKey: foreignKey || undefined,
            });
        }
        ;
    }));
}
;
async function loadIndexed(model, sequelize, schema) {
    var schemaIndexes = Object.keys(schema).filter(x => schema[x]?.index == true);
    var queryInterface = sequelize.getQueryInterface();
    await queryInterface.describeTable(model).then(async (table) => {
        var tableFields = Object.keys(table);
        var schemaFields = Object.keys(schema);
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
}
;
async function convertSchema(schema, dataName, modelName) {
    var newSchema = {};
    var config = await (0, fileInspector_1.readConfig)().catch((error) => { return undefined; });
    if (!config)
        throw new errorHandler_1.default('Config file not found, Check nexorm.config file.', '#FF0000');
    var dbType = config?.find(x => x.$provider == dataName)?.$database;
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
        var dbType = config?.find(x => x.$provider == dataName)?.$database;
        if (!dbType)
            throw new errorHandler_1.default('Database not found, Check nexorm.config file.', '#FF0000');
        var schemaValue = schema[key]?.type;
        var defaultValue = schema[key]?.defaultValue;
        if (schemaValue !== undefined &&
            !lodash_1.default.isArray(schemaValue) &&
            !["String", "Number", "Boolean", "Array", "Object", "Date", "BigInt", "Buffer", "class"].some((query) => String(schemaValue).includes(query)))
            throw new errorHandler_1.default('Invalid Type Or Type Not Found, Use For Example: \'static username = String;\'', '#FF0000');
        var requiredValue = schema[key]?.required;
        if (index == 0) {
            newSchema["ObjectId"] = {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: false,
                defaultValue: crypto_1.default.randomUUID() + Date.now().toString(5),
                primaryKey: havePrimaryKey ? false : true,
                unique: false,
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
                idColumn = key;
            }
            else {
                newSchema[key].type = typeMappings[dbType]?.number;
            }
        }
        else if (String(schemaValue).includes("Boolean")) {
            newSchema[key].type = typeMappings[dbType]?.boolean;
        }
        else if (String(schemaValue).includes("Object") || String(schemaValue).includes("class") || schemaValue == undefined) {
            newSchema[key].type = typeMappings[dbType]?.object;
            newSchema[key].get = function () {
                const val = this.getDataValue(key);
                return val ? JSON.parse(val) : null;
            };
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
            if (String(schemaValue).includes("Object") || String(schemaValue).includes("class") || schemaValue == undefined) {
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
        if (primaryKeyCount[modelName] > 1 && haveAutoIncrement[modelName])
            throw new errorHandler_1.default('Multiple @PrimaryKey Not Supported With @AutoIncrement', '#FF0000');
        if (!haveAutoIncrement[modelName] && schema[key]?.autoIncrement)
            haveAutoIncrement[modelName] = true;
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
        if (schema[key]?.unique) {
            delete newSchema[key].defaultValue;
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
function debugLog(message) {
    console.log(chalk_1.default.blue.bold(`[Nexorm Debug]: ${message}`));
}
;
