import { DataTypes, Model as SequelizeModel, Sequelize } from 'sequelize';
import _ from 'lodash';
import crypto, { BinaryToTextEncoding } from 'crypto';
import chalk from 'chalk';
import ErrorHandler from './errorHandler';
import { readConfig } from './fileInspector';
import { errorParser } from './util/errorParser';




var cachedConfig: any[] = [];
var sequelizes: { name: string; sequelize: Sequelize }[] = [];
var schema = {} as [key: any];
var havePrimaryKey = false;
var haveAutoIncrement = {} as any;
var primaryKeyCount = {} as any;
var idColumn: string = '';
var isWarned = false;

var hashFieldsArray = [] as any[];
var encryptFieldsArray = [] as any[];
var decryptFieldsArray = [] as any[];

var models = [] as { name: string; model: any }[];

var modelsCache = {} as { [key: string]: { providerName: string; model: any; schema: any; $schema: any } };


export async function getModel(providerName: string, modelName: string) {
    return modelsCache[`${providerName}-${modelName}`]?.model || null;
};

export async function getTarget(providerName: string, modelName: string) {
    return modelsCache[`${providerName}-${modelName}`] || null;
};

export async function getProviderModels(providerName: string) {
    return Object.values(modelsCache).filter(model => model.providerName === providerName);
}


export async function initializeBuilder(providerName: string, model: any, sequelize: Sequelize) {
    if (!providerName) providerName = 'nexorm';
    
    var schemaModel = model?.$schema;

    var config = await readConfig().catch((error) => { return undefined; });
    if (!config) throw new ErrorHandler('Config file not found, Check nexorm.config file.', '#FF0000');

    var providerConfig = config.find(x => x.$provider == providerName);
    if (!providerConfig) throw new ErrorHandler(`Provider '${providerName}' not found, Check nexorm.config file or @Provider decorator in '${schemaModel.name}' class.`, '#FF0000');

    var dataName = providerConfig.$provider || providerName || 'nexorm';

    var schema = Reflect.getMetadata(`schema-${schemaModel.name}`, schemaModel) || null;
    if (!schema) return;

    Reflect.defineMetadata(`databaseName-${schemaModel.name}`, providerName, schemaModel);

    var convertedSchema = await convertSchema(schema, dataName, schemaModel.name).catch((error) => {
        throw new ErrorHandler(`Error converting schema for model '${schemaModel.name}': ${error.message}`, '#FF0000');
    });
    if (!convertedSchema) throw new ErrorHandler(`Converted schema not found for model '${schemaModel.name}', Check @Schema decorator in '${schemaModel.name}' class.`, '#FF0000');


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
        throw new ErrorHandler(`Error creating table for model '${schemaModel.name}': ${error.message}`, '#FF0000');
    });



    modelsCache[`${providerName}-${schemaModel.name}`] = { 
        providerName, 
        model: createdModel, 
        schema: convertedSchema,
        $schema: schemaModel
    };
    
    

    return createdModel;
};





/* Schema Decorator */

export function Schema(target: any) {
    if (!target) throw new ErrorHandler('Schema Not Found', '#FF0000');
    var schema = {} as [key: any];


    const rows = Reflect.getMetadata(`rows-${target.name}`, target) || [] as any[];

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

        if (isPrimaryKey) havePrimaryKey = true;
        if (hash) hashFieldsArray.push({ key, hash });
        if (encrypt) encryptFieldsArray.push({ key, method: encrypt.method, cipher: encrypt.cipherKey, iv: encrypt.iv });
        if (decrypt) decryptFieldsArray.push({ key, method: decrypt.method, cipher: decrypt.cipherKey, iv: decrypt.iv });

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
            set: function (value: any) { }
        };


        schema[key] = objectSchema;
    };


    Reflect.defineMetadata(`schema-${target.name}`, schema, target);

    schema = {} as [key: any];
};







export async function createTable(model: string, sequelize: Sequelize, timestamps: { createdAt?: string; updatedAt?: string; deletedAt?: string }, force: boolean, paranoid: boolean, schema: any, dataName: string, debug: boolean, target: any) {

    return await new Promise(async (resolve, reject) => {

        /*
        if (!connections || connections.length == 0) throw new ErrorHandler('Connection not found, Check nexorm.config file.', '#FF0000');
        if (connections.some((item) => item == dataName) == false) return;
        */
        if (!sequelize) throw new ErrorHandler('Provider not found, Check nexorm.config file.', '#FF0000');

        if (!force) force = false;
        if (!paranoid) paranoid = false;
        if (timestamps?.deletedAt) paranoid = true;

        class ModelSchema extends SequelizeModel { };
        

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
            hashFieldsArray.forEach((field: { key: string; hash: { method: string; digest: BinaryToTextEncoding } }) => {
                ModelSchema.addHook('beforeSave', async (instance) => {
                    if (_.isArray(instance)) {
                        instance.forEach((item) => {
                            var value = item?.getDataValue(field.key);
                            if (!value) return;
                            if (value) {
                                var hash = crypto.createHash(field.hash.method).update(value).digest(field.hash.digest);
                                item.setDataValue(field.key, hash);
                            };
                        });
                    } else {
                        var value = instance?.getDataValue(field.key);
                        if (!value) return;
                        if (value) {
                            var hash = crypto.createHash(field.hash.method).update(value).digest(field.hash.digest);
                            instance.setDataValue(field.key, hash);
                        };
                    }
                });
            });
        };

        if (encryptFieldsArray.length > 0) {
            encryptFieldsArray.forEach((field: { key: string; method: string; cipher: string; iv: string; }) => {
                ModelSchema.addHook('beforeSave', async (instance) => {

                    if (_.isArray(instance)) {
                        instance.forEach((item) => {
                            var value = item?.getDataValue(field.key);
                            if (!value) return;
                            if (value) {
                                var cipher = crypto.createCipheriv(field.method, Buffer.from(field.cipher, 'utf8'), Buffer.from(field.iv, 'utf8'));
                                var encrypt = cipher.update(value, 'utf8', 'hex');
                                encrypt += cipher.final('hex');
                                item.setDataValue(field.key, encrypt);
                            };
                        });
                    } else {
                        var value = instance?.getDataValue(field.key);
                        if (!value) return;
                        if (value) {
                            var cipher = crypto.createCipheriv(field.method, Buffer.from(field.cipher, 'utf8'), Buffer.from(field.iv, 'utf8'));
                            var encrypt = cipher.update(value, 'utf8', 'hex');
                            encrypt += cipher.final('hex');
                            instance.setDataValue(field.key, encrypt);
                        };
                    }
                });
            });
        };

        if (decryptFieldsArray.length > 0) {
            decryptFieldsArray.forEach((field: { key: string; method: string; cipher: string; iv: string; }) => {
                ModelSchema.addHook('afterFind', async (instance: SequelizeModel, options) => {
                    if (_.isArray(instance)) {
                        instance.forEach((item) => {
                            var value = item?.getDataValue(field.key);
                            if (!value) return;
                            if (value) {
                                var cipher = crypto.createDecipheriv(field.method, Buffer.from(field.cipher), Buffer.from(field.iv));
                                var decrypted = cipher.update(value, 'hex', 'utf8');
                                decrypted += cipher.final('utf8');
                                item.setDataValue(field.key, decrypted);
                            };
                        });
                    } else {
                        var value = instance?.getDataValue(field.key);
                        if (!value) return;
                        if (value) {
                            var cipher = crypto.createDecipheriv(field.method, Buffer.from(field.cipher), Buffer.from(field.iv));
                            var decrypted = cipher.update(value, 'hex', 'utf8');
                            decrypted += cipher.final('utf8');
                            instance.setDataValue(field.key, decrypted);
                        };
                    };
                });
            });
        };





       

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
        throw new ErrorHandler(error, '#FF0000');
    });

};






export async function loadRelationships(model: string, sequelize: Sequelize, schema: any, ModelSchema: any, providerName: string) {
    

    const idColumn = Reflect.getMetadata(`autoIncrement-${model}`, schema) || '';

    if (!idColumn) {
        throw new ErrorHandler(`Model '${model}' does not have an auto-increment field defined. Please define an auto-increment field using @AutoIncrement decorator.`, '#FF0000');
    }

    const oneToOne = Reflect.getMetadata(`oneToOne-${model}`, schema) || {};
    const oneToMany = Reflect.getMetadata(`oneToMany-${model}`, schema) || {};
    const manyToMany = Reflect.getMetadata(`manyToMany-${model}`, schema) || {};
    const manyToOne = Reflect.getMetadata(`manyToOne-${model}`, schema) || {};

    const parseReflection = (func: Function) => {
        const stringFunction = func?.toString();
        if (!stringFunction || typeof stringFunction !== 'string') return null;

        const matchField = stringFunction.match(/=>\s*([\w.]+)/);
        if (matchField) {
            const getSplitedValue = matchField[1].split('.')[1];
            if (!getSplitedValue || typeof getSplitedValue !== 'string') return null;
            return getSplitedValue;
        } else {
            return null;
        }
    };


    await Promise.all(
        Object.entries(oneToOne).map(async ([key, field]: any) => {

            var TargetName = field.relatedModel()?.name;
            var findedModel = await getTarget(providerName,TargetName);
            var TargetIdColumn = Reflect.getMetadata(`autoIncrement-${TargetName}`, field.relatedModel()) || '';
            var foreignKey = parseReflection(field?.inverse);
            if (!findedModel || !foreignKey) return;
            

            var fieldOptions = field?.options as RelationshipOneToOneOptions;

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
            } else {
                ModelSchema.hasOne(findedModel.model, {
                    onDelete: 'CASCADE',
                    onUpdate: 'CASCADE',
                    foreignKey: foreignKey || undefined,
                });
            }

        })
    );

    await Promise.all(
        Object.entries(oneToMany).map(async ([key, field]: any) => {
            

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
            var findedModel = await getTarget(providerName,TargetName);
            var TargetIdColumn = Reflect.getMetadata(`autoIncrement-${TargetName}`, field.relatedModel())[0] || '';
            var foreignKey = parseReflection(field?.inverse);
            if (!findedModel || !foreignKey) return;
            

            var fieldOptions = field?.options as RelationshipOneToManyOptions;

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
            } else {
                ModelSchema.hasMany(findedModel.model, {
                    onDelete: 'CASCADE',
                    onUpdate: 'CASCADE',
                    foreignKey: foreignKey || undefined,
                });
            };

        })
    );

    await Promise.all(
        Object.entries(manyToMany).map(async ([key, field]: any) => {

            var TargetName = field.relatedModel()?.name;
            var findedModel = await getTarget(providerName,TargetName);
            var foreignKey = parseReflection(field?.inverse);
            if (!findedModel || !foreignKey) return;

            var fieldOptions = field?.options as RelationshipManyToManyOptions;

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
            } else {
                ModelSchema.belongsToMany(findedModel.model, {
                    through: `${ModelSchema.toString()}_${TargetName}`,
                    onDelete: 'CASCADE',
                    onUpdate: 'CASCADE',
                    foreignKey: foreignKey || undefined,
                });
            }

        })
    );

    await Promise.all(
        Object.entries(manyToOne).map(async ([key, field]: any) => {

            var TargetName = field.relatedModel()?.name;
            var findedModel = await getTarget(providerName,TargetName);
            var foreignKey = parseReflection(field?.inverse);
            if (!findedModel || !foreignKey) return;

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
            } else {
                ModelSchema.belongsTo(findedModel.model, {
                    onDelete: 'CASCADE',
                    onUpdate: 'CASCADE',
                    foreignKey: foreignKey || undefined,
                });
            };


        })
    );

};


export async function loadIndexed(model: string, sequelize: Sequelize, schema: any) {
    var schemaIndexes = Object.keys(schema).filter(x => schema[x]?.index == true);
    
    var queryInterface = sequelize.getQueryInterface();

    await queryInterface.describeTable(model).then(async (table) => {

        var tableFields = Object.keys(table);
        var schemaFields = Object.keys(schema);

        var indexes = await queryInterface.showIndex(model) as any[];

        await Promise.all(schemaIndexes.map(async (field) => {
            var indexExists = indexes.some((index) => index.name == `${model}_${field}_index`);

            if (!indexExists) {
                await queryInterface.addIndex(model, [field], {
                    name: `${model}_${field}_index`,
                    unique: schema[field]?.unique || false,
                    using: schema[field]?.index || 'BTREE',
                });
            };

        }));

        await Promise.all(schemaFields.filter(x => !tableFields.includes(x)).map(async (field) => {
            await queryInterface.addColumn(model, field, (schema as any)[field]);
        }));

    });

};




async function convertSchema(schema: any, dataName: string, modelName: string) {
    var newSchema = {} as any;
    var config = await readConfig().catch((error) => { return undefined; });
    if (!config) throw new ErrorHandler('Config file not found, Check nexorm.config file.', '#FF0000');
    var dbType = config?.find(x => x.$provider == dataName)?.$database;
    if (!dbType) throw new ErrorHandler(`Provider '${dataName}' not found, Check nexorm.config file or @Provider decorator in '${modelName}' class.`, '#FF0000');


    type DatabaseTypeMap = {
        mysql: { [key: string]: any };
        postgres: { [key: string]: any };
        sqlite: { [key: string]: any };
        mariadb: { [key: string]: any };
        mssql: { [key: string]: any };
    };


    const typeMappings: DatabaseTypeMap = {

        mysql: {
            string: DataTypes.TEXT,
            number: DataTypes.FLOAT,
            boolean: DataTypes.BOOLEAN,
            date: DataTypes.DATE,
            array: DataTypes.TEXT,
            object: DataTypes.TEXT,
            integer: DataTypes.INTEGER,
            buffer: DataTypes.BLOB('long')
        },

        postgres: {
            string: DataTypes.TEXT,
            number: DataTypes.FLOAT,
            boolean: DataTypes.BOOLEAN,
            date: DataTypes.DATE,
            array: DataTypes.JSON,
            object: DataTypes.JSON,
            integer: DataTypes.INTEGER,
            buffer: DataTypes.BLOB('long')
        },

        sqlite: {
            string: DataTypes.STRING,
            number: DataTypes.NUMBER,
            boolean: DataTypes.BOOLEAN,
            date: DataTypes.DATE,
            array: DataTypes.JSON,
            object: DataTypes.JSON,
            integer: DataTypes.INTEGER,
            buffer: DataTypes.BLOB('long')
        },

        mariadb: {
            string: DataTypes.TEXT,
            number: DataTypes.FLOAT,
            boolean: DataTypes.BOOLEAN,
            date: DataTypes.DATE,
            array: DataTypes.JSON,
            object: DataTypes.JSON,
            integer: DataTypes.INTEGER,
            buffer: DataTypes.BLOB('long')
        },

        mssql: {
            string: DataTypes.TEXT,
            number: DataTypes.FLOAT,
            boolean: DataTypes.BOOLEAN,
            date: DataTypes.DATE,
            array: DataTypes.JSON,
            object: DataTypes.JSON,
            integer: DataTypes.INTEGER,
            buffer: DataTypes.BLOB('long')
        },

    };


    var schemaKeys = Object.keys(schema)

    if (schemaKeys.length == 0) throw new ErrorHandler('Schema Not Found', '#FF0000');

    schemaKeys?.forEach((key, index) => {

        var dbType = config?.find(x => x.$provider == dataName)?.$database;
        if (!dbType) throw new ErrorHandler('Database not found, Check nexorm.config file.', '#FF0000');

        var schemaValue = schema[key]?.type;
        var defaultValue = schema[key]?.defaultValue;


        if (
            schemaValue !== undefined &&
            !_.isArray(schemaValue) &&
            !["String", "Number", "Boolean", "Array", "Object", "Date", "BigInt", "Buffer", "class"].some((query) => String(schemaValue).includes(query))
        ) throw new ErrorHandler('Invalid Type Or Type Not Found, Use For Example: \'static username = String;\'', '#FF0000');

        var requiredValue = schema[key]?.required;

        
        if (index == 0) {
          newSchema["ObjectId"] = {
            type: DataTypes.TEXT,
            allowNull: false,
            defaultValue: crypto.randomUUID() + Date.now().toString(5),
            primaryKey: havePrimaryKey ? false : true,
            unique: false,
            comment: 'Nexorm ID',
          };
        };

        if (!newSchema[key]) newSchema[key] = {};

        if (String(schemaValue).includes("Array") || _.isArray(schemaValue)) {
            newSchema[key].type = typeMappings[dbType]?.array;
        } else
            if (String(schemaValue).includes("String")) {
                newSchema[key].type = typeMappings[dbType]?.string;
            } else
                if (String(schemaValue).includes("Number")) {
                    if (schema[key]?.autoIncrement) {
                        newSchema[key].type = typeMappings[dbType]?.integer;
                        newSchema[key].autoIncrement = true;
                        newSchema[key].primaryKey = true;
                        idColumn = key;
                    } else {
                        newSchema[key].type = typeMappings[dbType]?.number;
                    }
                } else
                    if (String(schemaValue).includes("Boolean")) {
                        newSchema[key].type = typeMappings[dbType]?.boolean;
                    } else
                        if (String(schemaValue).includes("Object") || String(schemaValue).includes("class") || schemaValue == undefined) {
                            newSchema[key].type = typeMappings[dbType]?.object;
                            newSchema[key].get = function () {
                                const val = this.getDataValue(key);
                                return val ? JSON.parse(val) : null;
                              };
            
                           
                        } else
                            if (String(schemaValue).includes("Date")) {
                                newSchema[key].type = typeMappings[dbType]?.date;
                            } else
                                if (String(schemaValue).includes("BigInt")) {
                                    newSchema[key].type = typeMappings[dbType]?.integer;
                                    newSchema[key].validate = { isInt: true };
                                } else
                                    if (String(schemaValue).includes("Buffer")) {
                                        newSchema[key].type = typeMappings[dbType]?.buffer;
                                    };

                                   
                                    

        if (defaultValue == null && requiredValue == true && !schema[key]?.autoIncrement) {
            if (String(schemaValue).includes("Object") || String(schemaValue).includes("class") || schemaValue == undefined) {
                schema[key].defaultValue = {};
            } else
                if (
                    String(schemaValue).includes("Array") || _.isArray(schemaValue)
                ) { schema[key].defaultValue = []; } else
                    if (String(schemaValue).includes("String")) { schema[key].defaultValue = ''; } else
                        if (String(schemaValue).includes("Number")) { schema[key].defaultValue = 0; } else
                            if (String(schemaValue).includes("Boolean")) { schema[key].defaultValue = dbType == 'sqlite' ? 0 : false; } else
                                if (String(schemaValue).includes("Date")) { schema[key].defaultValue = new Date(); }
            if (String(schemaValue).includes("BigInt")) { schema[key].defaultValue = 0; }
        };

        if (schema[key]?.autoIncrement && !String(schemaValue).includes("Number") && !String(schemaValue).includes('BigInt')) throw new ErrorHandler('@AutoIncrement Can Only Be Used With Number Or Integer Type', '#FF0000');
        if (schema[key]?.hash && !String(schemaValue).includes("String")) throw new ErrorHandler('@Hash Can Only Be Used With String Type', '#FF0000');
        if (schema[key]?.encrypt && !String(schemaValue).includes("String")) throw new ErrorHandler('@Encrypt Can Only Be Used With String Type', '#FF0000');
        if (schema[key]?.decrypt && !String(schemaValue).includes("String")) throw new ErrorHandler('@Decrypt Can Only Be Used With String Type', '#FF0000');
        if (primaryKeyCount[modelName] > 1 && haveAutoIncrement[modelName]) throw new ErrorHandler('Multiple @PrimaryKey Not Supported With @AutoIncrement', '#FF0000');


        if (!haveAutoIncrement[modelName] && schema[key]?.autoIncrement) haveAutoIncrement[modelName] = true;

        if (!schema[key]?.autoIncrement) newSchema[key].index = schema[key]?.index || false;
        if (!schema[key]?.autoIncrement) newSchema[key].allowNull = requiredValue ? false : true;
        if (!schema[key]?.autoIncrement) newSchema[key].defaultValue = schema[key]?.defaultValue;
        newSchema[key].primaryKey = schema[key]?.primaryKey || false;
        newSchema[key].autoIncrement = schema[key]?.autoIncrement || false;
        if (!schema[key]?.autoIncrement) newSchema[key].unique = schema[key]?.unique || false;
        if (!schema[key]?.autoIncrement) newSchema[key].onUpdate = schema[key]?.onUpdate || null;
        if (!schema[key]?.autoIncrement) newSchema[key].onDelete = schema[key]?.onDelete || null;
        if (!schema[key]?.autoIncrement) newSchema[key].comment = schema[key]?.comment || null;
        if (!schema[key]?.autoIncrement && schema[key]?.enum?.length > 0) newSchema[key].validate = {
            ...newSchema[key].validate, isIn: [schema[key]?.enum]
        };

        if (schema[key]?.primaryKey) {
            newSchema[key].allowNull = false;
            newSchema[key].unique = true;
        };

        if (schema[key]?.unique) {
            delete newSchema[key].defaultValue;
            newSchema[key].unique = true;
        };


    });

    return newSchema;
};










/* Type Definitions */

export type DatabaseTypeMap = {
    mysql: { [key: string]: any };
    postgres: { [key: string]: any };
    sqlite: { [key: string]: any };
    mariadb: { [key: string]: any };
    mssql: { [key: string]: any };
};

/**
* @description 
* @default 
* {
* $onDelete: 'CASCADE',
* $onUpdate: 'CASCADE'
* }
*/
export interface RelationshipOneToManyOptions {
    $as?: string;
    $constraints?: boolean;
    $foreignKey?: string;
    $foreignKeyConstraint?: boolean;
    $hooks?: boolean;
    $keyType?: any;
    $onDelete?: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION';
    $onUpdate?: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION';
    $sourceKey?: string;
};


export interface RelationshipOneToOneOptions {
    $as?: string;
    $constraints?: boolean;
    $foreignKey?: string | object;
    $foreignKeyConstraint?: boolean;
    $hooks?: boolean;
    $keyType?: string;
    $onDelete?: string;
    $onUpdate?: string;
    $sourceKey?: string;
};

export interface RelationshipManyToOneOptions {
    $as?: string;
    $constraints?: boolean;
    $foreignKey?: string | object;
    $foreignKeyConstraint?: boolean;
    $hooks?: boolean;
    $keyType?: string;
    $onDelete?: string;
    $onUpdate?: string;
    $targetKey?: string;
};

export interface RelationshipManyToManyOptions {
    $as?: string;
    $constraints?: boolean;
    $foreignKey?: any;
    $foreignKeyConstraint?: boolean;
    $hooks?: boolean;
    $onDelete?: string;
    $onUpdate?: string;
    $otherKey?: string;
    $sourceKey?: string;
    $targetKey?: string;
    $through?: string;
    $timestamps?: boolean;
    $uniqueKey?: string;
};


function debugLog(message: string) {
    console.log(chalk.blue.bold(`[Nexorm Debug]: ${message}`));
};