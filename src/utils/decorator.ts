import 'reflect-metadata';
import { DataTypes, Model as SequelizeModel } from 'sequelize';
import { 
  v1 as uuidv1, 
  v3 as uuidv3,
  v4 as uuidv4,
  v5 as uuidv5,
  v6 as uuidv6,
  v7 as uuidv7,
} from 'uuid';
import crypto, { BinaryToTextEncoding } from 'node:crypto';
import _, { uniq } from 'lodash';
import { sequelizes, readConfig, autoConnect, connections, closeConnection, dropProvider } from './fileInspector';
import ErrorHandler from './errorHandler';
import CacheManager from './util/cacheManager';


var schema = {} as [key: any];
var havePrimaryKey = false;
var haveAutoIncrement = {} as any;
var primaryKeyCount = {} as any;
var isWarned = false;

var hashFieldsArray = [] as any[];
var encryptFieldsArray = [] as any[];
var decryptFieldsArray = [] as any[];

import {
  build,
  buildMany,
  count,
  deleteMany,
  distinct,
  restore,
  search,
  searchOne,
  updateOne
} from './functions/export';
import chalk from 'chalk';
import { NexormConfig, NexormConfigType } from '../types/config';
import { errorParser } from './util/errorParser';


/**
 * @name AllowNull
 * @description This decorator is used to define a column in the database.
 * @example @AllowNull
 * @public
 * @returns {void}
 */
export function AllowNull(target: any, key: string): void {
  if (!Reflect.hasMetadata(`allowNull-${target.name}`, target)) {
    Reflect.defineMetadata(`allowNull-${target.name}`, [], target);
  }
  const allowNullFields = Reflect.getMetadata(`allowNull-${target.name}`, target);
  allowNullFields.push(key);
  Reflect.defineMetadata(`allowNull-${target.name}`, allowNullFields, target);
};


/**
 * @name UUID
 * @description This decorator is used to define a column in the database.
 * @example @UUID(4)
 * @public
 * @param v
 * @returns {Function}
 */
export function UUID(v?: 1 | 4 | 6 | 7 | { 
  v1?: boolean;
  v3?: { namespace: string; name: string; };
  v4?: boolean;
  v5?: { namespace: string; name: string; };
  v6?: boolean;
  v7?: boolean;
}): Function {
  return function (target: any, key: string) {
    var selectedUUID: { 
      key: 'v1' | 'v3' | 'v4' | 'v5' | 'v6' | 'v7'; 
      namespace?: string; 
      name?: string; } = { key: 'v4' };

    if (v instanceof Object) {
      if (v.v1) selectedUUID = { key: 'v1' };
      if (v.v4) selectedUUID = { key: 'v4' };
      if (v.v3) selectedUUID = { key: 'v3', namespace: v.v3.namespace, name: v.v3.name };
      if (v.v5) selectedUUID = { key: 'v5', namespace: v.v5.namespace, name: v.v5.name };
      if (v.v6) selectedUUID = { key: 'v6' };
      if (v.v7) selectedUUID = { key: 'v7' };
    } else {
      if (v == 1) selectedUUID = { key: 'v1' };
      if (v == 4) selectedUUID = { key: 'v4' };
      if (v == 6) selectedUUID = { key: 'v6' };
      if (v == 7) selectedUUID = { key: 'v7' };
    };

    var uuidVersionList = {
      v1: () => uuidv1(),
      v3: (namespace: string, name: string) => uuidv3(namespace, name),
      v4: () => uuidv4(),
      v5: (namespace: string, name: string) => uuidv5(namespace, name),
      v6: () => uuidv6(),
      v7: () => uuidv7(),
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
export function Enum(values: any[]): Function {
  return function (target: any, key: string) {
    if (!Reflect.hasMetadata(`enum-${target.name}`, target)) {
      Reflect.defineMetadata(`enum-${target.name}`, {}, target);
    }
    const enums = Reflect.getMetadata(`enum-${target.name}`, target);
    enums[key] = values;
    Reflect.defineMetadata(`enum-${target.name}`, enums, target);
  };
};


/**
 * @name AutoIncrement
 * @description This decorator is used to define a column in the database.
 * @example @AutoIncrement
 * @public
 * @returns {void}
 */
export function AutoIncrement(target: any, key: string): void {
  if (!Reflect.hasMetadata(`autoIncrement-${target.name}`, target)) {
    Reflect.defineMetadata(`autoIncrement-${target.name}`, [], target);
  };
  if (!Reflect.hasMetadata(`primaryKey-${target.name}`, target)) {
    Reflect.defineMetadata(`primaryKey-${target.name}`, [], target);
  };
  if (!Reflect.hasMetadata(`defaults-${target.name}`, target)) {
    Reflect.defineMetadata(`defaults-${target.name}`, {}, target);
  };
  const autoIncrements = Reflect.getMetadata(`autoIncrement-${target.name}`, target);
  const primaryKey = Reflect.getMetadata(`primaryKey-${target.name}`, target);
  const defaults = Reflect.getMetadata(`defaults-${target.name}`, target);
  autoIncrements.push(key);
  primaryKey.push(key);
  defaults[key] = 0;
  Reflect.defineMetadata(`autoIncrement-${target.name}`, autoIncrements, target);
};



/**
 * @name Default
 * @description This decorator is used to define a column in the database.
 * @example @Default
 * @public
 * @param value
 * @returns {Function}
 */
export function Default(value: any): Function {
  return function (target: any, key: string) {
    if (!Reflect.hasMetadata(`defaults-${target.name}`, target)) {
      Reflect.defineMetadata(`defaults-${target.name}`, {}, target);
    }
    const defaults = Reflect.getMetadata(`defaults-${target.name}`, target);
    defaults[key] = value;
    Reflect.defineMetadata(`defaults-${target.name}`, defaults, target);
  };
};



/**
 * @name Required
 * @description This decorator is used to define a column in the database.
 * @example @Required
 * @public
 * @returns {void}
 */
export function Required(target: any, key: string): void {
  if (!Reflect.hasMetadata(`required-${target.name}`, target)) {
    Reflect.defineMetadata(`required-${target.name}`, [], target);
  }
  const requiredFields = Reflect.getMetadata(`required-${target.name}`, target);
  requiredFields.push(key);
  Reflect.defineMetadata(`required-${target.name}`, requiredFields, target);
};



/**
 * @name Unique
 * @description This decorator is used to define a column in the database.
 * @example @Unique
 * @public
 * @returns {void}
 */
export function Unique(target: any, key: string): void {
  if (!Reflect.hasMetadata(`unique-${target.name}`, target)) {
    Reflect.defineMetadata(`unique-${target.name}`, [], target);
  }
  const uniqueFields = Reflect.getMetadata(`unique-${target.name}`, target);
  uniqueFields.push(key);
  Reflect.defineMetadata(`unique-${target.name}`, uniqueFields, target);
};




/**
 * @name Index
 * @description This decorator is used to define a column in the database.
 * @example @Index
 * @public
 * @returns {void}
 */
export function Index(target: any, key: string): void {
  if (!Reflect.hasMetadata(`index-${target.name}`, target)) {
    Reflect.defineMetadata(`index-${target.name}`, [], target);
  }
  const indexFields = Reflect.getMetadata(`index-${target.name}`, target);
  indexFields.push(key);
  Reflect.defineMetadata(`index-${target.name}`, indexFields, target);
};



/**
 * @name PrimaryKey
 * @description This decorator is used to define a column in the database.
 * @example @PrimaryKey
 * @public
 * @returns {void}
 */
export function PrimaryKey(target: any, key: string): void {
  if (!Reflect.hasMetadata(`primaryKey-${target.name}`, target)) {
    Reflect.defineMetadata(`primaryKey-${target.name}`, [], target);
  }
  const primaryKeyFields = Reflect.getMetadata(`primaryKey-${target.name}`, target);
  primaryKeyFields.push(key);
  if (primaryKeyCount[target.name] == undefined) {
    primaryKeyCount[target.name] = 1;
  } else {
    primaryKeyCount[target.name]++;
  };
  Reflect.defineMetadata(`primaryKey-${target.name}`, primaryKeyFields, target);
};




/**
 * @name Comment
 * @description This decorator is used to define a column in the database.
 * @example @Comment
 * @public
 * @param comment
 * @returns {Function}
 */
export function Comment(comment: string): Function {
  return function (target: any, key: string) {
    if (!Reflect.hasMetadata(`comments-${target.name}`, target)) {
      Reflect.defineMetadata(`comments-${target.name}`, {}, target);
    }
    const comments = Reflect.getMetadata(`comments-${target.name}`, target);
    comments[key] = comment;
    Reflect.defineMetadata(`comments-${target.name}`, comments, target);
  };
};




/**
 * @name Hash
 * @description This decorator is used to define a column in the database.
 * @example @Hash
 * @public
 * @param method
 * @param digest
 * @returns {Function}
 */
export function Hash(method: string, digest?: crypto.BinaryToTextEncoding): Function {
  if (!method) {
    throw new Error('Method is required');
  };

  if (!digest) digest = 'hex';

  return function (target: any, key: string) {
    if (!Reflect.hasMetadata(`hash-${target.name}`, target)) {
      Reflect.defineMetadata(`hash-${target.name}`, {}, target);
    }
    const hash = Reflect.getMetadata(`hash-${target.name}`, target);
    hash[key] = { method, digest };
    Reflect.defineMetadata(`hash-${target.name}`, hash, target);
  };

};



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
export function Encrypt(method: string, cipherKey: string, iv: string): Function {
  if (!method) {
    throw new Error('Method is required');
  };

  if (!cipherKey) {
    throw new Error('Cipher Key is required');
  };

  if (!iv) {
    throw new Error('IV is required');
  };

  return function (target: any, key: string) {
    if (!Reflect.hasMetadata(`encrypt-${target.name}`, target)) {
      Reflect.defineMetadata(`encrypt-${target.name}`, {}, target);
    };
    const encrypt = Reflect.getMetadata(`encrypt-${target.name}`, target);
    encrypt[key] = { method, cipherKey, iv };
    Reflect.defineMetadata(`encrypt-${target.name}`, encrypt, target);
  };
};



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
export function Decrypt(method: string, cipherKey: string, iv: string): Function {
  if (!method) {
    throw new Error('Method is required');
  };

  if (!cipherKey) {
    throw new Error('Cipher Key is required');
  };

  if (!iv) {
    throw new Error('IV is required');
  };

  return function (target: any, key: string) {
    if (!Reflect.hasMetadata(`decrypt-${target.name}`, target)) {
      Reflect.defineMetadata(`decrypt-${target.name}`, {}, target);
    };
    const decrypt = Reflect.getMetadata(`decrypt-${target.name}`, target);
    decrypt[key] = { method, cipherKey, iv };
    Reflect.defineMetadata(`decrypt-${target.name}`, decrypt, target);
  };
};



/**
 * @name Reference
 * @description This decorator is used to define a column in the database.
 * @example @Reference
 * @public
 * @param value
 * @returns {Function}
 */
export function Reference(value: { model: string | string[], key: string }): Function {
  return function (target: any, key: string) {
    if (!Reflect.hasMetadata(`references-${target.name}`, target)) {
      Reflect.defineMetadata(`references-${target.name}`, {}, target);
    }
    const references = Reflect.getMetadata(`references-${target.name}`, target);
    references[key] = value;
    Reflect.defineMetadata(`references-${target.name}`, references, target);
  };
};











export function Column(target: any, key: any) {

  if (!Reflect.hasMetadata(`rows-${target.name}`, target)) {
    Reflect.defineMetadata(`rows-${target.name}`, [], target);
  }
  const rows = Reflect.getMetadata(`rows-${target.name}`, target);
  rows.push({ key, keyType: target[key] });
  Reflect.defineMetadata(`rows-${target.name}`, rows, target);

};

export function Force(target: any) {
  Reflect.defineMetadata(`force-${target.name}`, true, target);
};

export function Paranoid(target: any) {
  Reflect.defineMetadata(`paranoid-${target.name}`, true, target);
};

export function Timestamps(target: any) {
  Reflect.defineMetadata(`timestamps-${target.name}`, true, target);
};

export function Debug(target: any) {
  Reflect.defineMetadata(`debug-${target.name}`, true, target);
};

export function Provider(providerName: string) {
  return function(target: any) {      
    Reflect.defineMetadata(`databaseName-${target.name}`, providerName, target);
  };
};

export function Schema(target: any) {
    if (!target) throw new ErrorHandler('Schema Not Found', '#FF0000');
    

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
      };


      schema[key] = objectSchema;
    };
    
    var providerName = Reflect.getMetadata(`provider-${target.name}`, target) || "nexorm";
    

    var newSchema = convertSchema(schema, providerName, target.name);
    
    schema = newSchema;

    Reflect.defineMetadata(`schema-${target.name}`, newSchema, target);
    
    schema = {} as [key: any];
};



async function createTable(model: string, timestamps: boolean, force: boolean, paranoid: boolean, schema: any, dataName: string, debug: boolean) {
  
  return await new Promise(async (resolve, reject) => {
    
    var sequelize = sequelizes.find(x => x.name == dataName)?.sequelize;
    if (connections.length == 0) throw new ErrorHandler('Connection not found, Check nexorm.config file.', '#FF0000');
    if (connections.some((item) => item == dataName) == false) return;
    if (!sequelize) throw new ErrorHandler('Provider not found, Check nexorm.config file.', '#FF0000');

    if (!timestamps) timestamps = false;
    if (!force) force = false;
    if (!paranoid) paranoid = false;
    

    var schemaIndexes = Object.keys(schema).filter(x => schema[x]?.index == true);


    class ModelSchema extends SequelizeModel { };
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
                var cipher = crypto.createCipheriv(field.method, Buffer.from(field.cipher,'utf8'), Buffer.from(field.iv,'utf8'));
                var encrypt = cipher.update(value, 'utf8', 'hex');
                encrypt += cipher.final('hex');
                item.setDataValue(field.key, encrypt);
              };
            });
          } else {
          var value = instance?.getDataValue(field.key);
          if (!value) return;
          if (value) {
            var cipher = crypto.createCipheriv(field.method, Buffer.from(field.cipher,'utf8'), Buffer.from(field.iv,'utf8'));
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
        ModelSchema.addHook('afterFind', async (instance: SequelizeModel,options) => {
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
    try {
    await ModelSchema.sync({ 
        alter: !force,
        force: force
    });
    if (debug) debugLog(`Model '${model}' created successfully`);
    } catch (error) {
      console.log(error);
      
      throw errorParser(error);
    };


   var queryInterface = sequelize.getQueryInterface();

    await queryInterface.describeTable(model).then(async (table) => {
      var tableFields = Object.keys(table);
      var schemaFields = Object.keys(schema);
      var attributesFields = Object.keys(ModelSchema.getAttributes());
      
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
    

    resolve(ModelSchema);
  }).catch((error) => {
    throw new ErrorHandler(error, '#FF0000');
  });


};






function convertSchema(schema: any, dataName: string, modelName: string) {
  
  var newSchema = {} as any;
  var dbType = readConfig().find(x => x.$provider == dataName)?.$database;
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

    var dbType = readConfig().find(x => x.$provider == dataName)?.$database;
    if (!dbType) throw new ErrorHandler('Database not found, Check nexorm.config file.', '#FF0000');

    var schemaValue = schema[key]?.type;
    var defaultValue = schema[key]?.defaultValue;
    if (
      schemaValue == undefined ||
      !["String", "Number", "Boolean", "Array", "Object", "Date", "BigInt", "Buffer"].some((query) => String(schemaValue).includes(query))
    ) throw new ErrorHandler('Invalid Type Or Type Not Found, Use For Example: \'static username = String\'', '#FF0000');

    var requiredValue = schema[key]?.required;

    if (index == 0) {
      newSchema["nexorm_id"] = {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: crypto.randomUUID(),
        primaryKey: havePrimaryKey ? false : true,
        unique: false,
        comment: 'Nexorm ID',
      };
    };

    if (!newSchema[key]) newSchema[key] = { };

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
      } else {
       newSchema[key].type = typeMappings[dbType]?.number;
      }
    } else
    if (String(schemaValue).includes("Boolean")) {
       newSchema[key].type = typeMappings[dbType]?.boolean;
    } else
    if (String(schemaValue).includes("Object")) {
       newSchema[key].type = typeMappings[dbType]?.object;
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
    if (String(schemaValue).includes("Object")) {
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


type ExtendType<T, U> = T & U;

type ExtractPrimitiveType<T> = T extends StringConstructor | string
  ? string | null
  : T extends (NumberConstructor | number)
  ? number | null
  : T extends (BigIntConstructor | bigint)
  ? number | null
  : T extends (BooleanConstructor | boolean)
  ? boolean | null
  : T extends (DateConstructor | Date)
  ? Date | null
  : T extends (BufferConstructor | Buffer)
  ? Buffer | null
  : T extends ArrayConstructor
  ? Array<any>
  : T extends (StringConstructor[] | string[])
  ? string[] | null
  : T extends (NumberConstructor[] | number[])
  ? number[] | null
  : T extends (BigIntConstructor[] | bigint[])
  ? number[] | null
  : T extends (BufferConstructor[] | Buffer[])
  ? Buffer[] | null
  : T extends (BooleanConstructor[] | boolean[])
  ? boolean[] | null
  : T extends (DateConstructor[] | Date[])
  ? Date[] | null
  : T extends (ObjectConstructor)
  ? object | null
  : T extends object
  ? { [K in keyof T]?: ExtractPrimitiveType<T[K]> } | null
  : T;

  export type StaticProps<T> = {
    [K in keyof T]?: T extends { [key in K]?: T[K] } ? 
    ExtractPrimitiveType<T[K]> | SQLOperators<T,ExtractPrimitiveType<T[K]>> :
    never;
  } & {
    [key: string]: any;
  };

  export type BuildProps<T> = {
    [K in keyof T]?: T extends { [key in K]?: T[K] } ? ExtractPrimitiveType<T[K]> : never;
  };

  type ArrayPropsOnly<T> = Omit<{
    [K in keyof T]?: ExtractPrimitiveType<T[K]> extends (string[] | number[] | boolean[] | Date[] | any[] | null)
      ? ExtractPrimitiveType<T[K]>
      : never;
  }, { [K in keyof T]: ExtractPrimitiveType<T[K]> extends (string[] | number[] | boolean[] | Date[] | any[] | null) ? never : K }[keyof T]>;

  type StringPropsOnly<T> = Omit<{
    [K in keyof T]?: ExtractPrimitiveType<T[K]> extends (string | null)
      ? ExtractPrimitiveType<T[K]>
      : never;
  }, { [K in keyof T]: ExtractPrimitiveType<T[K]> extends (string | null) ? never : K }[keyof T]>;

  type NumberPropsOnly<T> = Omit<{
    [K in keyof T]?: ExtractPrimitiveType<T[K]> extends (number | null)
      ? ExtractPrimitiveType<T[K]>
      : never;
  }, { [K in keyof T]: ExtractPrimitiveType<T[K]> extends (number | null) ? never : K }[keyof T]>;

  type BooleanPropsOnly<T> = Omit<{
    [K in keyof T]?: ExtractPrimitiveType<T[K]> extends (boolean | null)
      ? ExtractPrimitiveType<T[K]>
      : never;
  }, { [K in keyof T]: ExtractPrimitiveType<T[K]> extends (boolean | null) ? never : K }[keyof T]>;

  type DatePropsOnly<T> = Omit<{
    [K in keyof T]?: ExtractPrimitiveType<T[K]> extends (Date | null)
      ? ExtractPrimitiveType<T[K]>
      : never;
  }, { [K in keyof T]: ExtractPrimitiveType<T[K]> extends (Date | null) ? never : K }[keyof T]>;

  type ObjectPropsOnly<T> = Omit<{
    [K in keyof T]?: ExtractPrimitiveType<T[K]> extends (object | null)
      ? ExtractPrimitiveType<T[K]>
      : never;
  }, { [K in keyof T]: ExtractPrimitiveType<T[K]> extends (object | null) ? never : K }[keyof T]> & Record<string, any>;

  type ParseArrayToType<T> = {
    [K in keyof T]: T[K] extends (infer U)[] | null
      ? U
      : never;
  };

  type ParseArrayToTypeOnlyOne<T> = T extends (infer U)[] ? U : never;

  interface SQLWhereOperators<SchemaProps,K> {
    $or?: StaticProps<SchemaProps>[];
    $and?: StaticProps<SchemaProps>[];
  };

  interface SQLOperators<SchemaProps,K> {
    $eq?: K;
    $ne?: K;
    $gt?: K;
    $gte?: K;
    $lt?: K;
    $lte?: K;
    $between?: [K, K];
    $notBetween?: [K, K];
    $in?: K[];
    $notIn?: K[];
    $like?: string;
    $notLike?: string;
    $startsWith?: string;
    $endsWith?: string;
    $substring?: string;
    $and?: StaticProps<SchemaProps>[];
    $or?: StaticProps<SchemaProps>[];
    $is?: K;
    $not?: K;
    $overlap?: K[];
    $contains?: K[];
    $contained?: any;
    $any?: K[];
    $regexp?: string;
    $notRegexp?: string;
    $iLike?: string;
    $notILike?: string;
    $adjacent?: K[];
    $exists?: boolean;
    $elementMatch?: StaticProps<SchemaProps>;
    $ceil?: K;
    $match?: K;
    $strictLeft?: K;
    $strictRight?: K;
    $noExtendLeft?: K;
    $noExtendRight?: K;
    $placeholder?: K;
    $all?: K[];
  };

  type PushOptionsExtra<K> = {
    $each?: K;
    $position?: number;
    $sort?: 1 | -1 | boolean;
  };

  type PullOptionsExtra<K> = {
    $in?: K;
    $nin?: K;
    $position?: number;
  } & (K extends number | number[] ? 
  {
    $lte?: number;
    $gte?: number;
    $lt?: number;
    $gt?: number;
    $ne?: number;
    $eq?: number;
  } : {});

  type AddToSetOptionsExtra<K> = {
    $each?: K;
  };

  type SliceOptionsExtra<K> = {
    $begin?: number;
    $end?: number;
  };

  type ConcatOptionsExtra<K> = {
    $each?: K;
    $ignoreSameValue?: boolean;
  };

  type PushOptions<SchemaProps> = {
    [K in keyof SchemaProps]?: PushOptionsExtra<SchemaProps[K]> | ParseArrayToTypeOnlyOne<SchemaProps[K]>
  };

  type PullOptions<SchemaProps> = {
    [K in keyof SchemaProps]?: 
    ParseArrayToTypeOnlyOne<SchemaProps[K]> | 
    PullOptionsExtra<SchemaProps[K]>;
  };

  type PopOptions<SchemaProps> = {
    [K in keyof SchemaProps]?: 1 | -1 | boolean
  };

  type AddToSetOptions<SchemaProps> = {
    [K in keyof SchemaProps]?: AddToSetOptionsExtra<SchemaProps[K]> | ParseArrayToTypeOnlyOne<SchemaProps[K]> 
  };

  type SliceOptions<SchemaProps> = {
    [K in keyof SchemaProps]?: SliceOptionsExtra<SchemaProps[K]>
  };

  type ConcatOptions<SchemaProps> = {
    [K in keyof SchemaProps]?: SchemaProps[K]; /*  ConcatOptionsExtra<SchemaProps[K]> */
  };

  type ToogleOptions<SchemaProps> = {
    [K in keyof SchemaProps]?: boolean;
  };


  type ObjectPushProps<T> = Omit<{
    [K in keyof T]?: ExtractPrimitiveType<T[K]> extends (object | null)
      ? ExtractPrimitiveType<T[K]>
      : never;
  }, { [K in keyof T]: ExtractPrimitiveType<T[K]> extends (object | null) ? never : K }[keyof T]> & 
  Record<string, string | number | boolean | { $each?: any[]; $position?: number; $sort?: 1 | -1 | boolean; }>;

  type ObjectPopProps<T> = Omit<{
    [K in keyof T]?: ExtractPrimitiveType<T[K]> extends (object | null)
      ? ExtractPrimitiveType<T[K]>
      : never;
  }, { [K in keyof T]: ExtractPrimitiveType<T[K]> extends (object | null) ? never : K }[keyof T]> & 
  Record<string, -1 | 1 | boolean>;

  type ObjectPullProps<T> = Omit<{
    [K in keyof T]?: ExtractPrimitiveType<T[K]> extends (object | null)
      ? ExtractPrimitiveType<T[K]>
      : never;
  }, { [K in keyof T]: ExtractPrimitiveType<T[K]> extends (object | null) ? never : K }[keyof T]> & 
  Record<string, string | number | boolean | { $in?: any[]; $nin?: any[]; $position?: number; $lte?: number; $gte?: number; $lt?: number; $gt?: number; $ne?: number; $eq?: number; }>;

  type ObjectAddToSetProps<T> = Omit<{
    [K in keyof T]?: ExtractPrimitiveType<T[K]> extends (object | null)
      ? ExtractPrimitiveType<T[K]>
      : never;
  }, { [K in keyof T]: ExtractPrimitiveType<T[K]> extends (object | null) ? never : K }[keyof T]> & 
  Record<string, string | number | boolean | { $each?: any[]; }>;

  type ObjectSliceArrayProps<T> = Omit<{
    [K in keyof T]?: ExtractPrimitiveType<T[K]> extends (object | null)
      ? ExtractPrimitiveType<T[K]>
      : never;
  }, { [K in keyof T]: ExtractPrimitiveType<T[K]> extends (object | null) ? never : K }[keyof T]> & 
  Record<string, { $begin?: number; $end?: number; }>;

  type ObjectConcatProps<T> = Omit<{
    [K in keyof T]?: ExtractPrimitiveType<T[K]> extends (object | null)
      ? ExtractPrimitiveType<T[K]>
      : never;
  }, { [K in keyof T]: ExtractPrimitiveType<T[K]> extends (object | null) ? never : K }[keyof T]> & 
  Record<string, { $each?: any[]; $ignoreSameValue?: boolean; }>;

  type ObjectSliceProps<T> = Omit<{
    [K in keyof T]?: ExtractPrimitiveType<T[K]> extends (object | null)
      ? ExtractPrimitiveType<T[K]>
      : never;
  }, { [K in keyof T]: ExtractPrimitiveType<T[K]> extends (object | null) ? never : K }[keyof T]> &
  Record<string, { $begin?: number; $end?: number; }>;

  type ObjectReplaceProps<T> = Omit<{
    [K in keyof T]?: ExtractPrimitiveType<T[K]> extends (object | null)
      ? ExtractPrimitiveType<T[K]>
      : never;
  }, { [K in keyof T]: ExtractPrimitiveType<T[K]> extends (object | null) ? never : K }[keyof T]> &
  Record<string, { $searchValue: string; $replaceValue: string; }>;

  type StringReplaceProps<T> = Omit<{
    [K in keyof T]?: ExtractPrimitiveType<T[K]> extends (string | null)
      ? ExtractPrimitiveType<T[K]>
      : never;
  }, { [K in keyof T]: ExtractPrimitiveType<T[K]> extends (string | null) ? never : K }[keyof T]> &
  Record<string, { $searchValue: string; $replaceValue: string; }>;

  type StringSliceProps<T> = Omit<{
    [K in keyof T]?: ExtractPrimitiveType<T[K]> extends (string | null)
      ? ExtractPrimitiveType<T[K]>
      : never;
  }, { [K in keyof T]: ExtractPrimitiveType<T[K]> extends (string | null) ? never : K }[keyof T]> &
  Record<string, { $begin?: number; $end?: number; }>;

  type ObjectOmitProps<T> = Omit<{
    [K in keyof T]?: ExtractPrimitiveType<T[K]> extends (object | null)
      ? ExtractPrimitiveType<T[K]>
      : never;
  }, { [K in keyof T]: ExtractPrimitiveType<T[K]> extends (object | null) ? never : K }[keyof T]> & 
  Record<string, any>;

  type ObjectInvertProps<T> = Omit<{
    [K in keyof T]?: ExtractPrimitiveType<T[K]> extends (object | null)
      ? ExtractPrimitiveType<T[K]>
      : never;
  }, { [K in keyof T]: ExtractPrimitiveType<T[K]> extends (object | null) ? never : K }[keyof T]> &
  Record<string, boolean>;

  type GlobalUpdateExtraProps<T> = Omit<{
    [K in keyof T]?: boolean
  }, { [K in keyof T]: ExtractPrimitiveType<T[K]> extends (object | null) ? never : K }[keyof T]> &
  Record<string, boolean>;


export interface ArrayUpdateOptions<SchemaProps> {
  $push?: PushOptions<ArrayPropsOnly<SchemaProps>> | ObjectPushProps<SchemaProps>;
  $pop?: PopOptions<ArrayPropsOnly<SchemaProps>> | ObjectPopProps<SchemaProps>;
  $pull?: PullOptions<ArrayPropsOnly<SchemaProps>> | ObjectPullProps<SchemaProps>;
  $addToSet?: AddToSetOptions<ArrayPropsOnly<SchemaProps>> | ObjectAddToSetProps<SchemaProps>;
  $sliceArray?: SliceOptions<ArrayPropsOnly<SchemaProps>> | ObjectSliceArrayProps<SchemaProps>;
  $concat?: ConcatOptions<ArrayPropsOnly<SchemaProps>> | ObjectConcatProps<SchemaProps>;
};


export interface NumberUpdateOptions<SchemaProps> {
  $inc?: NumberPropsOnly<SchemaProps> | ObjectPropsOnly<SchemaProps>;
  $dec?: NumberPropsOnly<SchemaProps> | ObjectPropsOnly<SchemaProps>;
  $mul?: NumberPropsOnly<SchemaProps> | ObjectPropsOnly<SchemaProps>;
  $div?: NumberPropsOnly<SchemaProps> | ObjectPropsOnly<SchemaProps>;
  $min?: NumberPropsOnly<SchemaProps> | ObjectPropsOnly<SchemaProps>;
  $max?: NumberPropsOnly<SchemaProps> | ObjectPropsOnly<SchemaProps>;
  $sqrt?: NumberPropsOnly<SchemaProps> | ObjectPropsOnly<SchemaProps>;
  $floor?: NumberPropsOnly<SchemaProps> | ObjectPropsOnly<SchemaProps>;
  $random?: NumberPropsOnly<SchemaProps> | ObjectPropsOnly<SchemaProps>;
  $abs?: NumberPropsOnly<SchemaProps> | ObjectPropsOnly<SchemaProps>;
  $ceil?: NumberPropsOnly<SchemaProps> | ObjectPropsOnly<SchemaProps>;
  $pow?: NumberPropsOnly<SchemaProps> | ObjectPropsOnly<SchemaProps>;
  $toFixed?: NumberPropsOnly<SchemaProps> | ObjectPropsOnly<SchemaProps>;
  $toExponential?: NumberPropsOnly<SchemaProps> | ObjectPropsOnly<SchemaProps>;
  $toPrecision?: NumberPropsOnly<SchemaProps> | ObjectPropsOnly<SchemaProps>;
  $round?: NumberPropsOnly<SchemaProps> | ObjectPropsOnly<SchemaProps>;
  $trunc?: NumberPropsOnly<SchemaProps> | ObjectPropsOnly<SchemaProps>;
  $mod?: NumberPropsOnly<SchemaProps> | ObjectPropsOnly<SchemaProps>;
};

export interface StringUpdateOptions<SchemaProps> {
  $append?: StringPropsOnly<SchemaProps> | ObjectPropsOnly<SchemaProps>;
  $prepend?: StringPropsOnly<SchemaProps> | ObjectPropsOnly<SchemaProps>;
  $replace?: StringReplaceProps<SchemaProps> | ObjectReplaceProps<SchemaProps>;
  $trim?: StringPropsOnly<SchemaProps> | ObjectPropsOnly<SchemaProps>;
  $substr?: StringPropsOnly<SchemaProps> | ObjectPropsOnly<SchemaProps>;
  $capitalize?: StringPropsOnly<SchemaProps> | ObjectPropsOnly<SchemaProps>;
  $reverse?: StringPropsOnly<SchemaProps> | ObjectPropsOnly<SchemaProps>;
  $slice?: StringSliceProps<SchemaProps> | ObjectSliceProps<SchemaProps>;
  $lowercase?: StringPropsOnly<SchemaProps> | ObjectPropsOnly<SchemaProps>;
  $uppercase?: StringPropsOnly<SchemaProps> | ObjectPropsOnly<SchemaProps>;
  $camelcase?: StringPropsOnly<SchemaProps> | ObjectPropsOnly<SchemaProps>;
  $kebabcase?: StringPropsOnly<SchemaProps> | ObjectPropsOnly<SchemaProps>;
  $snakecase?: StringPropsOnly<SchemaProps> | ObjectPropsOnly<SchemaProps>;
  $titlecase?: StringPropsOnly<SchemaProps> | ObjectPropsOnly<SchemaProps>;
};


export interface BooleanUpdateOptions<SchemaProps> {
  $toggle?: ToogleOptions<BooleanPropsOnly<SchemaProps> | ObjectPropsOnly<SchemaProps>>;
};


export interface UpdateOptions<SchemaProps> {

  /* Array Update Options */
  $push?: ArrayUpdateOptions<SchemaProps>["$push"];
  $pop?: ArrayUpdateOptions<SchemaProps>["$pop"];
  $pull?: ArrayUpdateOptions<SchemaProps>["$pull"];
  $addToSet?: ArrayUpdateOptions<SchemaProps>["$addToSet"];
  $sliceArray?: ArrayUpdateOptions<SchemaProps>["$sliceArray"];
  $concat?: ArrayUpdateOptions<SchemaProps>["$concat"];

  /* Number Update Options */
  $inc?: NumberUpdateOptions<SchemaProps>["$inc"];
  $dec?: NumberUpdateOptions<SchemaProps>["$dec"];
  $mul?: NumberUpdateOptions<SchemaProps>["$mul"];
  $div?: NumberUpdateOptions<SchemaProps>["$div"];
  $min?: NumberUpdateOptions<SchemaProps>["$min"];
  $max?: NumberUpdateOptions<SchemaProps>["$max"];
  $sqrt?: NumberUpdateOptions<SchemaProps>["$sqrt"];
  $floor?: NumberUpdateOptions<SchemaProps>["$floor"];
  $random?: NumberUpdateOptions<SchemaProps>["$random"];
  $abs?: NumberUpdateOptions<SchemaProps>["$abs"];
  $ceil?: NumberUpdateOptions<SchemaProps>["$ceil"];
  $pow?: NumberUpdateOptions<SchemaProps>["$pow"];
  $toFixed?: NumberUpdateOptions<SchemaProps>["$toFixed"];
  $toExponential?: NumberUpdateOptions<SchemaProps>["$toExponential"];
  $toPrecision?: NumberUpdateOptions<SchemaProps>["$toPrecision"];
  $round?: NumberUpdateOptions<SchemaProps>["$round"];
  $trunc?: NumberUpdateOptions<SchemaProps>["$trunc"];
  $mod?: NumberUpdateOptions<SchemaProps>["$mod"];

  /* Boolean Update Options */
  $toggle?: BooleanUpdateOptions<SchemaProps>["$toggle"];

  /* String Update Options */
  $append?: StringUpdateOptions<SchemaProps>["$append"];
  $prepend?: StringUpdateOptions<SchemaProps>["$prepend"];
  $replace?: StringUpdateOptions<SchemaProps>["$replace"];
  $trim?: StringUpdateOptions<SchemaProps>["$trim"];
  $substr?: StringUpdateOptions<SchemaProps>["$substr"];
  $capitalize?: StringUpdateOptions<SchemaProps>["$capitalize"];
  $reverse?: StringUpdateOptions<SchemaProps>["$reverse"];
  $slice?: StringUpdateOptions<SchemaProps>["$slice"];
  $lowercase?: StringUpdateOptions<SchemaProps>["$lowercase"];
  $uppercase?: StringUpdateOptions<SchemaProps>["$uppercase"];
  $camelcase?: StringUpdateOptions<SchemaProps>["$camelcase"];
  $kebabcase?: StringUpdateOptions<SchemaProps>["$kebabcase"];
  $snakecase?: StringUpdateOptions<SchemaProps>["$snakecase"];
  $titlecase?: StringUpdateOptions<SchemaProps>["$titlecase"];

  /* Object Update Options */
  $omit?: ObjectOmitProps<SchemaProps>;
  /* $merge?: ObjectPropsOnly<SchemaProps>; */
  /* $mapKeys?: ObjectPropsOnly<SchemaProps>; */
  /* $mapValues?: ObjectPropsOnly<SchemaProps>; */
  /* $invert?: ObjectInvertProps<SchemaProps>; */


  /* General Update Options */
  $set?: StaticProps<SchemaProps>;
  $unset?: GlobalUpdateExtraProps<SchemaProps>;
  $clear?: GlobalUpdateExtraProps<SchemaProps>;

};


export type RulesOperators<K> = {
  $required?: boolean;
} & 
(K extends number ? 
  {
    $enum?: number[];
    $multipleOf?: number;
    $positive?: boolean;
    $negative?: boolean;
    $integer?: boolean;
    $float?: boolean;
    $even?: boolean;
    $odd?: boolean;
    $prime?: boolean;
    $perfect?: boolean;
    $fibonacci?: boolean;
    $powerOfTwo?: boolean;
    $powerOfTen?: boolean;
    $powerOf?: number;
    $range?: { $min: number, $max: number };
    $greaterThan?: number;
    $lessThan?: number;
    $greaterThanOrEqual?: number;
    $lessThanOrEqual?: number;
    $finite?: boolean;
    $infinite?: boolean;
    $palindrome?: boolean;
    $harshad?: boolean;
    $epochTime?: boolean;
    $angle?: { $unit: 'radian' | 'degree', $range: { $min: number, $max: number } };
    $logicalOr?: RulesOperators<K>[];
    $logicalNot?: RulesOperators<K>;
    $custom?: (value: number) => boolean;
  } : {})
& (K extends string ? 
  {
    $minLength?: number;
    $maxLength?: number;
    $exactLength?: number;
    $alphaNumeric?: boolean;
    $contains?: string;
    $startsWith?: string;
    $endsWith?: string;
    $exclude?: string;
    $noWhitespace?: boolean;
    $onlySpecialChars?: boolean;
    $noSpecialChars?: boolean;
    $alpha?: boolean;
    $numeric?: boolean;
    $locale?: string;
    $enum?: string[];
    $match?: RegExp;
    $validEmail?: boolean;
    $validURL?: boolean;
    $validIP?: boolean;
    $validIPv4?: boolean;
    $validIPv6?: boolean;
    $validUUID?: boolean;
    $validCreditCard?: boolean;
    $custom?: (value: string) => boolean;
  } : {})
& (K extends boolean ?
  {
    $mustBeTrue?: boolean;
    $mustBeFalse?: boolean;
  } : {})


export type RulesOptions<SchemaProps> = {
  [K in keyof SchemaProps]?: RulesOperators<SchemaProps[K]>;
};

export type UpdateMethodsOptions = {
  $upsert?: boolean;
  $multi?: boolean;
  $cache?: boolean | number | { $key: string, $ttl: number };
};

export type RestoreMethodsOptions = {
  $limit?: number;
  $logging?: boolean | ((sql: string, benchmark?: number) => void);
};

export type CountMethodsOptions<SchemaProps> = {
  $logging?: boolean | ((sql: string, benchmark?: number) => void);
  $col?: keyof SchemaProps;
  $attributes?: AttributesOption<SchemaProps>;
  $group?: keyof SchemaProps;
  $distinct?: boolean;
  $paranoid?: boolean;
};

export type SearchMethodsOptions<SchemaProps> = {
  $limit?: number;
  $offset?: number;
  $sort?: SortOption<SchemaProps>;
  $attributes?: AttributesOption<SchemaProps>;
  $group?: GroupOption<SchemaProps>;
  $having?: HavingOption<SchemaProps>;
  $raw?: boolean;
  $paranoid?: boolean;
  $subQuery?: boolean;
  $logging?: boolean | ((sql: string, benchmark?: number) => void);
  $useMaster?: boolean;
  $lock?: boolean | { $level: 'key_share' | 'update', $of: any };
  $skipLocked?: boolean;
  $plain?: boolean;
  $cache?: boolean | number | { $key: string, $ttl: number };
};


export type DeleteMethodsOptions<SchemaProps> = {
  $limit?: number;
  $force?: boolean;
  $truncate?: boolean;
  $logging?: boolean | ((sql: string, benchmark?: number) => void);
};


type SortOption<SchemaProps> = {
  [K in keyof SchemaProps]?: 1 | -1 | boolean;
};

type HavingOption<SchemaProps> = {
  [K in keyof SchemaProps]?: SQLOperators<SchemaProps, ExtractPrimitiveType<SchemaProps[K]>> |
  ExtractPrimitiveType<SchemaProps[K]>
};

type GroupOption<T> = (keyof T)[]

type AttributesOption<T> = (keyof T)[] | { $exclude?: (keyof T)[]; $include?: (keyof T)[] };

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
export class Nexorm {


  /**
   * Nexorm Config
   * @type {NexormConfig}
   * @public
   * @static
   * @example Nexorm.$config
   */
  static $configs: NexormConfig = readConfig();

  /**
   * Nexorm Providers
   * @type {string[]}
   * @public
   * @static
   * @example Nexorm.$providers
   */
  static $providers: string[] = sequelizes.map(x => x.name);


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
  static $connections: { $size: number; $list: string[]; } = { $size: connections.length, $list: connections };

  /**
   * Connect To Database
   * @param providerName Provider Name
   * @returns Promise<void>
   * @example await Nexorm.$connect('nexorm')
   */
  static async $connect(providerName?: string): Promise<void> {
    if (!providerName) providerName = 'nexorm';
    
    if (connections.find(x => x == providerName)) {
      throw new ErrorHandler('Connection Already Exists, Try Again by Trying Other Providers Or You\'re Already Connected', '#FF0000');
    };

    await autoConnect(providerName);
  };


  /**
   * Disconnect From Database
   * @param providerName Provider Name
   * @returns Promise<void>
   * @example await Nexorm.$disconnect('nexorm')
   */
  static async $disconnect(providerName?: string): Promise<void> {
    if (!providerName) providerName = 'nexorm';

    if (!connections.find(x => x == providerName)) {
      throw new ErrorHandler('Connection Not Found, Try Again by Trying Other Providers Or You\'re Already Disconnected', '#FF0000');
    };

    await closeConnection(providerName);
  };


  /**
   * Drop Database
   * @param providerName Provider Name
   * @returns Promise<void>
   * @example await Nexorm.$drop('nexorm')
   */
  static async $drop(providerName?: string): Promise<void> {
    if (!providerName) providerName = 'nexorm';

    if (!connections.find(x => x == providerName)) {
      throw new ErrorHandler('Connection Not Found, Try Again by Trying Other Providers Or You\'re Already Disconnected', '#FF0000');
    };

    await dropProvider(providerName);
  };


  /**
   * Close All Connections
   * @returns Promise<void>
   * @example await Nexorm.$closeAllConnections()
   * @description Close All Connections
   */
  static async $closeAllConnections(): Promise<void> {
    for (var i = 0; i < connections.length; i++) {
      await closeConnection(connections[i]);
    };
  };


  /**
   * Connect All Providers
   * @returns Promise<void>
   * @example await Nexorm.$connectAll()
   * @description Connect All Providers
   */
  static async $connectAll(): Promise<void> {
    var notConnected = Nexorm.$providers.filter(x => !connections.find(y => y == x));
    for (var i = 0; i < notConnected.length; i++) {
      await autoConnect(notConnected[i]);
    };
  };

};




export class Model<SchemaProps> {
  public $type!: Omit<SchemaProps,'prototype'>;
  public $model!: any;
  public $middlewares: any[] = [];
  public $cache: CacheManager = new CacheManager();
  public $config: NexormConfigType;
  public $debugMode: boolean = false;

  private schema: Omit<SchemaProps,'prototype'>;
  private model: any;

  constructor(private Schema: SchemaProps) {
    this.schema = Schema;
    this.$middlewares = [];
    this.$config = readConfig()?.find(x => x.$provider == databaseName) as NexormConfigType;

    if (!String(Schema).includes("class")) throw new ErrorHandler('Schema Must Be A Static Class', '#FF0000');
    
    var databaseName = Reflect.getMetadata(`databaseName-${(this.schema as any).name}`, this.schema as any) || "nexorm";
    if (!databaseName) throw new ErrorHandler('Database Not Found, Check nexorm.config file.', '#FF0000');

    if (!connections.find(x => x == databaseName)) return;
    

    var schema = Reflect.getMetadata(`schema-${(this.schema as any).name}`, this.schema as any) || {};
    var timestamps = Reflect.getMetadata(`timestamps-${(this.schema as any).name}`, this.schema as any) || false;
    var force = Reflect.getMetadata(`force-${(this.schema as any).name}`, this.schema as any) || false;
    var paranoid = Reflect.getMetadata(`paranoid-${(this.schema as any).name}`, this.schema as any) || false;
    var debug = Reflect.getMetadata(`debug-${(this.schema as any).name}`, this.schema as any) || false;


    this.$debugMode = debug;
    this.model = createTable((this.schema as any).name, timestamps, force, paranoid, schema, databaseName, debug).then((model) => {
      if (this.$debugMode) debugLog(`Table Created & Synced: ${(this.schema as any).name}`);
      return model;
    }).catch((err) => {
      throw errorParser(err);
    });
    
    this.$model = sequelizes.find((x) => x.name == databaseName)?.sequelize.models[(this.schema as any)?.name];

  };



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
  async $search(query?: { 
    $where?: StaticProps<ExtendType<Omit<SchemaProps,'prototype'>,{nexorm_id:string}>> & SQLWhereOperators<ExtendType<Omit<SchemaProps,'prototype'>,{nexorm_id:string}>,SchemaProps>, 
    $options?: SearchMethodsOptions<ExtendType<Omit<SchemaProps,'prototype'>,{nexorm_id:string}>>
  }): Promise<StaticProps<ExtendType<Omit<SchemaProps,'prototype'>,{nexorm_id:string}>>[]> {
    var execute = await this.#execute();
    if (this.$debugMode) debugLog(`Searching Data: ${(this.schema as any).name} - $where: ${JSON.stringify(query?.$where)} - $options: ${JSON.stringify(query?.$options)}`);
    return (execute.search(query?.$where, query?.$options) || []) as Promise<StaticProps<ExtendType<Omit<SchemaProps,'prototype'>,{nexorm_id:string}>>[]>
  };


  /**
   * Search First
   * @returns Promise<StaticProps<ExtendType<SchemaProps,{nexorm_id:string}>>
   * @example model.$searchFirst()
   * @async
   * @public
   * @type {Function}
   */
  async $searchFirst(): Promise<StaticProps<ExtendType<Omit<SchemaProps,'prototype'>,{nexorm_id:string}>>> {
    var execute = await this.#execute();
    if (this.$debugMode) debugLog(`Searching First Data: ${(this.schema as any).name}`);
    return execute.searchOne({},{});
  };


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
  async $searchOne(query?: { 
    $where: StaticProps<ExtendType<Omit<SchemaProps,'prototype'>,{nexorm_id:string}>> & SQLWhereOperators<ExtendType<Omit<SchemaProps,'prototype'>,{nexorm_id:string}>,SchemaProps>,  
    $options?: SearchMethodsOptions<ExtendType<Omit<SchemaProps,'prototype'>,{nexorm_id:string}>>
  }): Promise<StaticProps<ExtendType<Omit<SchemaProps,'prototype'>,{nexorm_id:string}>>> {
    var execute = await this.#execute();
    if (this.$debugMode) debugLog(`Searching One Data: ${(this.schema as any).name} - $where: ${JSON.stringify(query?.$where)} - $options: ${JSON.stringify(query?.$options)}`);
    return execute.searchOne(query?.$where,query?.$options) as Promise<StaticProps<ExtendType<Omit<SchemaProps,'prototype'>,{nexorm_id:string}>>>;
  };


  /**
   * Search By Id
   * @param nexorm_id Nexorm ID
   * @returns Promise<StaticProps<ExtendType<SchemaProps,{nexorm_id:string}>>
   * @example model.$searchById('1')
   * @async
   * @public
   * @type {Function}
   */
  async $searchById(nexorm_id: string): Promise<StaticProps<ExtendType<Omit<SchemaProps,'prototype'>,{nexorm_id:string}>>> {
    var execute = await this.#execute();
    if (this.$debugMode) debugLog(`Searching By ID: ${(this.schema as any).name} - $where: { nexorm_id: ${nexorm_id} }`);
    return execute.searchOne({ nexorm_id });
  };


  /**
   * Search By Ids
   * @param ids Nexorm IDs
   * @returns Promise<StaticProps<ExtendType<SchemaProps,{nexorm_id:string}>>
   * @example model.$searchByIds(['1','2','3'])
   * @async
   * @public
   * @type {Function}
   */
  async $searchByIds(ids: string[]): Promise<StaticProps<ExtendType<Omit<SchemaProps,'prototype'>,{nexorm_id:string}>>[]> {
    var execute = await this.#execute();
    if (this.$debugMode) debugLog(`Searching By IDs: ${(this.schema as any).name} - $where: { nexorm_id: { $in: ${ids} } }`);
    return execute.search({ nexorm_id: { $in: ids } });
  };



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
  async $searchAndCount(query?: {
    $where?: StaticProps<ExtendType<Omit<SchemaProps,'prototype'>,{nexorm_id:string}>> & SQLWhereOperators<ExtendType<Omit<SchemaProps,'prototype'>,{nexorm_id:string}>,SchemaProps>, 
  }): Promise<[
    StaticProps<ExtendType<Omit<SchemaProps,'prototype'>,{nexorm_id:string}>>[],
    number
  ]> {
    var execute = await this.#execute();
    if (this.$debugMode) debugLog(`Searching And Counting Data: ${(this.schema as any).name} - $where: ${JSON.stringify(query?.$where)}`);

    var counts = await execute.count(query?.$where, {});
    var data = await execute.search(query?.$where, {});
  
    return [ data, counts ];
  };



  /**
   * Create
   * @param data Data
   * @returns Promise<StaticProps<ExtendType<SchemaProps,{nexorm_id:string}>>
   * @example model.$create({ name: 'John' })
   * @async
   * @public
   * @type {Function}
   */
  async $everything(): Promise<StaticProps<ExtendType<Omit<SchemaProps,'prototype'>,{nexorm_id:string}>>[]> {
    var execute = await this.#execute();
    if (this.$debugMode) debugLog(`Searching Everything: ${(this.schema as any).name}`);
    return execute.search({},{});
  };


  /**
   * Build
   * @param data Data
   * @returns Promise<StaticProps<ExtendType<SchemaProps,{nexorm_id:string}>>
   * @example model.$build({ name: 'John' })
   * @async
   * @public
   * @type {Function}
   */
  async $build(data: BuildProps<ExtendType<Omit<SchemaProps,'prototype'>,{nexorm_id:string}>>): Promise<BuildProps<ExtendType<Omit<SchemaProps,'prototype'>,{nexorm_id:string}>>> {
    var execute = await this.#execute();
    if (this.$debugMode) debugLog(`Building Data: ${(this.schema as any).name} - Data: ${JSON.stringify(data)}`);
    return execute.build(data);
  };


  /**
   * Build Many
   * @param data Data
   * @returns Promise<StaticProps<ExtendType<SchemaProps,{nexorm_id:string}>>
   * @example model.$buildMany([{ name: 'John' }, { name: 'Doe' }])
   * @async
   * @public
   * @type {Function}
   */
  async $buildMany(data: BuildProps<ExtendType<Omit<SchemaProps,'prototype'>,{nexorm_id:string}>>[]): Promise<BuildProps<ExtendType<Omit<SchemaProps,'prototype'>,{nexorm_id:string}>>[]> {
    var execute = await this.#execute();
    if (this.$debugMode) debugLog(`Building Many Data: ${(this.schema as any).name} - Data: ${JSON.stringify(data)}`);
    return execute.buildMany(data);
  };


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
  async $update(query?: { 
    $where?: StaticProps<ExtendType<Omit<SchemaProps,'prototype'>,{nexorm_id:string}>> & SQLWhereOperators<ExtendType<Omit<SchemaProps,'prototype'>,{nexorm_id:string}>,SchemaProps>,  
    $update?: UpdateOptions<ExtendType<Omit<SchemaProps,'prototype'>,{nexorm_id:string}>>,
    $rules?: RulesOptions<StaticProps<ExtendType<Omit<SchemaProps,'prototype'>,{nexorm_id:string}>>>,
    $options?: UpdateMethodsOptions
  }): Promise<StaticProps<ExtendType<Omit<SchemaProps,'prototype'>,{nexorm_id:string}>>> {
    var execute = await this.#execute();
    if (this.$debugMode) debugLog(`Updating Data: ${(this.schema as any).name} - $where: ${JSON.stringify(query?.$where)} - $update: ${JSON.stringify(query?.$update)} - $options: ${JSON.stringify(query?.$options)} - $rules: ${JSON.stringify(query?.$rules)}`);
    if (query && !query.$options) query.$options = { };
    return execute.update(query?.$where, query?.$update, query?.$rules, query?.$options);
  };


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
  async $updateMany(query?: {
    $where?: StaticProps<ExtendType<Omit<SchemaProps,'prototype'>,{nexorm_id:string}>> & SQLWhereOperators<ExtendType<Omit<SchemaProps,'prototype'>,{nexorm_id:string}>,SchemaProps>, 
    $update?: UpdateOptions<ExtendType<Omit<SchemaProps,'prototype'>,{nexorm_id:string}>>,
    $rules?: RulesOptions<StaticProps<ExtendType<Omit<SchemaProps,'prototype'>,{nexorm_id:string}>>>,
    $options?: Omit<UpdateMethodsOptions, '$multi'>
  }): Promise<StaticProps<ExtendType<Omit<SchemaProps,'prototype'>,{nexorm_id:string}>>[]> {
    var execute = await this.#execute();
    if (this.$debugMode) debugLog(`Updating Many Data: ${(this.schema as any).name} - $where: ${JSON.stringify(query?.$where)} - $update: ${JSON.stringify(query?.$update)} - $options: ${JSON.stringify(query?.$options)} - $rules: ${JSON.stringify(query?.$rules)}`);
    return execute.update(query?.$where, query?.$update, query?.$rules, { $multi: true, ...query?.$options });
  };



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
  async $delete(query?: { 
    $where: StaticProps<ExtendType<Omit<SchemaProps,'prototype'>,{nexorm_id:string}>> & SQLWhereOperators<ExtendType<Omit<SchemaProps,'prototype'>,{nexorm_id:string}>,SchemaProps>, 
    $options?: DeleteMethodsOptions<ExtendType<Omit<SchemaProps,'prototype'>,{nexorm_id:string}>>
  }): Promise<boolean> {
    if (typeof query?.$options?.$force == 'boolean') query.$options.$force = true;
    var execute = await this.#execute();
    if (this.$debugMode) debugLog(`Deleting Data: ${(this.schema as any).name} - $where: ${JSON.stringify(query?.$where)} - $options: ${JSON.stringify(query?.$options)}`);
    return execute.delete(query?.$where,query?.$options, false) as Promise<boolean>;
  };



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
  async $deleteMany(query?: { 
    $where: StaticProps<ExtendType<Omit<SchemaProps,'prototype'>,{nexorm_id:string}>> & SQLWhereOperators<ExtendType<Omit<SchemaProps,'prototype'>,{nexorm_id:string}>,SchemaProps>,  
    $options?: DeleteMethodsOptions<ExtendType<Omit<SchemaProps,'prototype'>,{nexorm_id:string}>>
  }): Promise<number> {
    if (typeof query?.$options?.$force == 'boolean') query.$options.$force = true;
    var execute = await this.#execute();
    if (this.$debugMode) debugLog(`Deleting Many Data: ${(this.schema as any).name} - $where: ${JSON.stringify(query?.$where)} - $options: ${JSON.stringify(query?.$options)}`);
    return execute.delete(query?.$where,query?.$options, true) as Promise<number>;
  };



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
  async $softDelete(query?: { 
    $where: StaticProps<ExtendType<Omit<SchemaProps,'prototype'>,{nexorm_id:string}>> & SQLWhereOperators<ExtendType<Omit<SchemaProps,'prototype'>,{nexorm_id:string}>,SchemaProps>,  
    $options?: Omit<DeleteMethodsOptions<ExtendType<Omit<SchemaProps,'prototype'>,{nexorm_id:string}>>,'$force'>
  }): Promise<boolean> {
    var execute = await this.#execute();
    if (this.$debugMode) debugLog(`Soft Deleting Data: ${(this.schema as any).name} - $where: ${JSON.stringify(query?.$where)} - $options: ${JSON.stringify(query?.$options)}`);
    return execute.delete(query?.$where, { $force: false, ...query?.$options }, false) as Promise<boolean>;
  };



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
  async $softDeleteMany(query?: { 
    $where: StaticProps<ExtendType<Omit<SchemaProps,'prototype'>,{nexorm_id:string}>> & SQLWhereOperators<ExtendType<Omit<SchemaProps,'prototype'>,{nexorm_id:string}>,SchemaProps>, 
    $options?: Omit<DeleteMethodsOptions<ExtendType<Omit<SchemaProps,'prototype'>,{nexorm_id:string}>>,'$force'>
  }): Promise<number> {
    var execute = await this.#execute();
    if (this.$debugMode) debugLog(`Soft Deleting Many Data: ${(this.schema as any).name} - $where: ${JSON.stringify(query?.$where)} - $options: ${JSON.stringify(query?.$options)}`);
    return execute.delete(query?.$where, { $force: false, ...query?.$options }, true) as Promise<number>;
  };



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
  async $restore(query?: { 
    $where: StaticProps<ExtendType<Omit<SchemaProps,'prototype'>,{nexorm_id:string}>> & SQLWhereOperators<ExtendType<Omit<SchemaProps,'prototype'>,{nexorm_id:string}>,SchemaProps>,  
    $options?: RestoreMethodsOptions
  }): Promise<void> {
    var execute = await this.#execute();
    if (this.$debugMode) debugLog(`Restoring Data: ${(this.schema as any).name} - $where: ${JSON.stringify(query?.$where)} - $options: ${JSON.stringify(query?.$options)}`);
    return execute.restore(query?.$where, query?.$options);
  }



  async $count(query?: { 
    $where?: StaticProps<ExtendType<Omit<SchemaProps,'prototype'>,{nexorm_id:string}>> & SQLWhereOperators<ExtendType<Omit<SchemaProps,'prototype'>,{nexorm_id:string}>,SchemaProps>, 
    $options?: CountMethodsOptions<ExtendType<Omit<SchemaProps,'prototype'>,{nexorm_id:string}>>
  }): Promise<number> {
    var execute = await this.#execute();
    if (this.$debugMode) debugLog(`Counting Data: ${(this.schema as any).name} - $where: ${JSON.stringify(query?.$where)} - $options: ${JSON.stringify(query?.$options)}`);
    return execute.count(query?.$where);
  };


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
  async $upsert(query: { 
    $where: StaticProps<ExtendType<Omit<SchemaProps,'prototype'>,{nexorm_id:string}>> & SQLWhereOperators<ExtendType<Omit<SchemaProps,'prototype'>,{nexorm_id:string}>,SchemaProps>,  
    $update: UpdateOptions<ExtendType<Omit<SchemaProps,'prototype'>,{nexorm_id:string}>>,
    $rules?: RulesOptions<StaticProps<ExtendType<Omit<SchemaProps,'prototype'>,{nexorm_id:string}>>>,
    $options?: Omit<UpdateMethodsOptions, '$upsert'>
   }): Promise<StaticProps<ExtendType<Omit<SchemaProps,'prototype'>,{nexorm_id:string}>>> {
    var execute = await this.#execute();
    if (this.$debugMode) debugLog(`Upserting Data: ${(this.schema as any).name} - $where: ${JSON.stringify(query.$where)} - $update: ${JSON.stringify(query.$update)} - $options: ${JSON.stringify(query.$options)} - $rules: ${JSON.stringify(query.$rules)}`);
    return execute.update(query.$where, query.$update, query.$rules, { $upsert: true, ...query.$options });
  };



  /**
   * Query
   * @param query Query
   * @returns Promise<any>
   * @example model.$query('SELECT * FROM users')
   * @async
   * @public
   * @type {Function}
   */
  async $query(query: string): Promise<any> {
    var execute = await this.#execute();
    if (this.$debugMode) debugLog(`Querying Data: ${(this.schema as any).name} - Query: ${query}`);
    return execute.query(query);
  };


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
  async $distinct(query: { 
    $field: (keyof ExtendType<Omit<SchemaProps,'prototype'>, { nexorm_id: string }>)[],
    $where?: StaticProps<ExtendType<Omit<SchemaProps,'prototype'>,{nexorm_id:string}>> & SQLWhereOperators<ExtendType<Omit<SchemaProps,'prototype'>,{nexorm_id:string}>,SchemaProps>,  
    $options?: Omit<UpdateMethodsOptions, '$attributes'>
  }): Promise<any[][]> {
    var execute = await this.#execute();
    if (this.$debugMode) debugLog(`Distinct Data: ${(this.schema as any).name} - $field: ${JSON.stringify(query.$field)} - $where: ${JSON.stringify(query.$where)} - $options: ${JSON.stringify(query.$options)}`);
    return Object.values(await execute.distinct(query.$field as any, query.$where, query.$options) || []);
  };


  /**
   * Truncate
   * @returns Promise<void>
   * @example model.$truncate()
   * @async
   * @public
   * @type {Function}
   */
  async $truncate(): Promise<void> {
    var execute = await this.#execute();
    if (this.$debugMode) debugLog(`Truncating Data: ${(this.schema as any).name}`);
    return execute.truncate();
  };






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
    $beforeCreate: (callback: (
      values: BuildProps<ExtendType<Omit<SchemaProps,'prototype'>,{nexorm_id:string}>>,
      fields: BuildProps<ExtendType<Omit<SchemaProps,'prototype'>,{nexorm_id:string}>>[]
    ) => void) => {
      this.$model?.beforeCreate((instance: any, options: any) => {
        if (this.$debugMode) debugLog(`Before Create Hook: ${(this.schema as any).name} - Data: ${JSON.stringify(instance.dataValues)} - Fields: ${JSON.stringify(options.fields)}`);
        callback(instance.dataValues, options.fields as any);
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
    $afterCreate: (callback: (
      values: BuildProps<ExtendType<Omit<SchemaProps,'prototype'>,{nexorm_id:string}>>,
      fields: BuildProps<ExtendType<Omit<SchemaProps,'prototype'>,{nexorm_id:string}>>[]
    ) => void) => {
      this.$model?.afterCreate((instance: any, options: any) => {
        if (this.$debugMode) debugLog(`After Create Hook: ${(this.schema as any).name} - Data: ${JSON.stringify(instance.dataValues)} - Fields: ${JSON.stringify(options.fields)}`);
        callback(instance.dataValues, options.fields as any);
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
    $afterUpdate: (callback: (
      values: BuildProps<ExtendType<Omit<SchemaProps,'prototype'>,{nexorm_id:string}>>,
      fields: BuildProps<ExtendType<Omit<SchemaProps,'prototype'>,{nexorm_id:string}>>[]
    ) => void) => {
      this.$model?.afterUpdate((instance: any, options: any) => {
        if (this.$debugMode) debugLog(`After Update Hook: ${(this.schema as any).name} - Data: ${JSON.stringify(instance.dataValues)} - Fields: ${JSON.stringify(options.fields)}`);
        callback(instance.dataValues, options.fields as any);
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
    $beforeDestroy: (callback: (
      values: BuildProps<ExtendType<Omit<SchemaProps,'prototype'>,{nexorm_id:string}>>,
    ) => void) => {
      this.$model?.beforeDestroy((instance: any, options: any) => {
        if (this.$debugMode) debugLog(`Before Destroy Hook: ${(this.schema as any).name} - Data: ${JSON.stringify(instance.dataValues)}`);
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
    $afterDestroy: (callback: (
      values: BuildProps<ExtendType<Omit<SchemaProps,'prototype'>,{nexorm_id:string}>>,
    ) => void) => {
      this.$model?.afterDestroy((instance: any, options: any) => {
        if (this.$debugMode) debugLog(`After Destroy Hook: ${(this.schema as any).name} - Data: ${JSON.stringify(instance.dataValues)}`);
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
    $beforeUpdate: (callback: (
      values: BuildProps<ExtendType<Omit<SchemaProps,'prototype'>,{nexorm_id:string}>>,
      fields: BuildProps<ExtendType<Omit<SchemaProps,'prototype'>,{nexorm_id:string}>>[]
    ) => void) => {
      this.$model?.beforeUpdate((instance: any, options: any) => {
        if (this.$debugMode) debugLog(`Before Update Hook: ${(this.schema as any).name} - Data: ${JSON.stringify(instance.dataValues)} - Fields: ${JSON.stringify(options.fields)}`);
        callback(instance.dataValues, options.fields as any);
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
    $beforeSave: (callback: (
      values: BuildProps<ExtendType<Omit<SchemaProps,'prototype'>,{nexorm_id:string}>>,
      fields: BuildProps<ExtendType<Omit<SchemaProps,'prototype'>,{nexorm_id:string}>>[]
    ) => void) => {
      this.$model?.beforeSave((instance: any, options: any) => {
        if (this.$debugMode) debugLog(`Before Save Hook: ${(this.schema as any).name} - Data: ${JSON.stringify(instance.dataValues)} - Fields: ${JSON.stringify(options.fields)}`);
        callback(instance.dataValues, options.fields as any);
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
    $afterSave: (callback: (
      values: BuildProps<ExtendType<Omit<SchemaProps,'prototype'>,{nexorm_id:string}>>,
      fields: BuildProps<ExtendType<Omit<SchemaProps,'prototype'>,{nexorm_id:string}>>[]
    ) => void) => {
      this.$model?.afterSave((instance: any, options: any) => {
        if (this.$debugMode) debugLog(`After Save Hook: ${(this.schema as any).name} - Data: ${JSON.stringify(instance.dataValues)} - Fields: ${JSON.stringify(options.fields)}`);
        callback(instance.dataValues, options.fields as any);
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
    $beforeBulkCreate: (callback: (
      values: BuildProps<ExtendType<Omit<SchemaProps,'prototype'>,{nexorm_id:string}>>[],
      fields: BuildProps<ExtendType<Omit<SchemaProps,'prototype'>,{nexorm_id:string}>>[]
    ) => void) => {
      this.$model?.beforeBulkCreate((instance: any, options: any) => {
        if (this.$debugMode) debugLog(`Before Bulk Create Hook: ${(this.schema as any).name} - Data: ${JSON.stringify(instance)} - Fields: ${JSON.stringify(options.fields)}`);
        callback(instance.map((data: any) => data.dataValues), options.fields as any);
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
    $afterBulkCreate: (callback: (
      values: BuildProps<ExtendType<Omit<SchemaProps,'prototype'>,{nexorm_id:string}>>[],
      fields: BuildProps<ExtendType<Omit<SchemaProps,'prototype'>,{nexorm_id:string}>>[]
    ) => void) => {
      this.$model?.afterBulkCreate((instance: any, options: any) => {
        if (this.$debugMode) debugLog(`After Bulk Create Hook: ${(this.schema as any).name} - Data: ${JSON.stringify(instance)} - Fields: ${JSON.stringify(options.fields)}`);
        callback(instance.map((data: any) => data.dataValues), options.fields as any);
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
    $beforeBulkUpdate: (callback: (
      name: string,
      fields: BuildProps<ExtendType<Omit<SchemaProps,'prototype'>,{nexorm_id:string}>>[]
    ) => void) => {
      this.$model?.beforeBulkUpdate((options: any) => {
        if (this.$debugMode) debugLog(`Before Bulk Update Hook: ${(this.schema as any).name} - Fields: ${JSON.stringify(options.fields)}`);
        callback((this.schema as any).name as string, options.fields as any);
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
    $afterBulkUpdate: (callback: (
      name: string,
      fields: BuildProps<ExtendType<Omit<SchemaProps,'prototype'>,{nexorm_id:string}>>[]
    ) => void) => {
      this.$model?.afterBulkUpdate((options: any) => {
        if (this.$debugMode) debugLog(`After Bulk Update Hook: ${(this.schema as any).name} - Fields: ${JSON.stringify(options.fields)}`);
        callback((this.schema as any).name as string, options.fields as any);
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
    $beforeBulkDestroy: (callback: (
      name: string,
      fields: BuildProps<ExtendType<Omit<SchemaProps,'prototype'>,{nexorm_id:string}>>[]
    ) => void) => {
      this.$model?.beforeBulkDestroy((options: any) => {
        if (this.$debugMode) debugLog(`Before Bulk Destroy Hook: ${(this.schema as any).name} - Fields: ${JSON.stringify(options.fields)}`);
        callback((this.schema as any).name as string, options.fields as any);
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
    $afterBulkDestroy: (callback: (
      name: string,
    ) => void) => {
      this.$model?.afterBulkDestroy((options: any) => {
        if (this.$debugMode) debugLog(`After Bulk Destroy Hook: ${(this.schema as any).name}`);
        callback((this.schema as any).name as string);
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
    $beforeFind: (callback: (
      values: BuildProps<ExtendType<Omit<SchemaProps,'prototype'>,{nexorm_id:string}>>,
    ) => void) => {
      this.$model?.beforeFind((options: any) => {
        if (this.$debugMode) debugLog(`Before Find Hook: ${(this.schema as any).name} - Data: ${JSON.stringify(options.where)}`);
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
    $afterFind: (callback: (
      values: BuildProps<ExtendType<Omit<SchemaProps,'prototype'>,{nexorm_id:string}>>,
    ) => void) => {
      this.$model?.afterFind((instance: any, options: any) => {
        if (this.$debugMode) debugLog(`After Find Hook: ${(this.schema as any).name} - Data: ${JSON.stringify(instance.dataValues)}`);
        callback(instance.dataValues);
      });
    }

  };





  async #execute() {
    
    var cacheModel = await this.model;
    this.model = cacheModel;
  
    return {

      search: async(filter?: any, options?: any) => { 
        return await search(this.model, filter, options,this.$cache,this.$config) || [];
      },

      searchOne: async (filter?: any, options?: any) => { 
        return await searchOne(this.model, filter, options,this.$cache,this.$config) || null;
      },

      build: async (data: any) => { 
        return await build(this.model, data) as any;
      },

      buildMany: async (data: any) => { 
        return await buildMany(this.model, data) as any;
      },

      update: async (where: any, update: any, rules: any, options: any) => { 
        return await updateOne(this.model,where,update, rules, options, this.schema);
      },

      delete: async (where: any, options: any, multiple: boolean) => { 
        if (multiple) return await deleteMany(this.model, where, options);
        return (await deleteMany(this.model, where, options) ? true : false);
      },

      restore: async (where: any, options: any) => {
        return await restore(this.model, where, options);
      },

      count: async (where?: any, options?: any) => { 
        return await count(this.model, where, options)
      },

      query: async (query: string) => { 
        return await this.$model?.sequelize?.query(query);
      },

      distinct: async (field: string[], where: any, options: any) => { 
        return await distinct(this.model, field, where, options, this.$cache, this.$config);
      },

      truncate: async () => { 
        return await this.$model?.sequelize?.truncate();
      },

    };


  }

}






function debugLog(message: string) {
  console.log(chalk.blue.bold(`[Nexorm Debug]: ${message}`));
};