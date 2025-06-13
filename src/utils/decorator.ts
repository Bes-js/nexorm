import 'reflect-metadata';
import { DataTypes, Sequelize, Model as SequelizeModel, Transaction as SequelizeTransaction } from 'sequelize';
import { Job, scheduledJobs, scheduleJob } from 'node-schedule';
import {
  v1 as uuidv1,
  v3 as uuidv3,
  v4 as uuidv4,
  v5 as uuidv5,
  v6 as uuidv6,
  v7 as uuidv7,
} from 'uuid';
import crypto, { BinaryToTextEncoding } from 'node:crypto';
import _ from 'lodash';
import util from 'node:util';
import { sequelizes, readConfig, connections, closeConnection, dropProvider, connect, cachedConfig, connectAll } from './fileInspector';
import ErrorHandler from './errorHandler';
import { CacheManager } from './util/cacheManager';


var schema = {} as [key: any];
var havePrimaryKey = false;
var haveAutoIncrement = {} as any;
var primaryKeyCount = {} as any;
var isWarned = false;

var models = [] as { name: string; model: any }[];

export { models };

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
import { number } from '@inquirer/prompts';
import { getModel } from './modelBuilder';
import { ConnectionManager } from './util/connectionManager';


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
      name?: string;
    } = { key: 'v4' };

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
 * @name ForeignKey
 * @description This decorator is used to define a foreign key in the database.
 * @example @ForeignKey
 * @public
 * @param target
 * @param key
 * @returns {void}
 * @throws {Error}
 **/
export function ForeignKey(relatedModel: () => any): Function {

  return function (target: any, key: string) {

  if (!Reflect.hasMetadata(`foreignKey-${target.name}`, target)) {
    Reflect.defineMetadata(`foreignKey-${target.name}`, {}, target);
  }
  const foreignKeyFields = Reflect.getMetadata(`foreignKey-${target.name}`, target);
  
  foreignKeyFields['key'] = key;
  foreignKeyFields['relatedModel'] = relatedModel;

  Reflect.defineMetadata(`foreignKey-${target.name}`, foreignKeyFields, target);
  };

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
    throw new ErrorHandler('Method is required', '#FF0000');
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
    throw new ErrorHandler('Method is required', '#FF0000');
  };

  if (!cipherKey) {
    throw new ErrorHandler('Cipher Key is required', '#FF0000');
  };

  if (!iv) {
    throw new ErrorHandler('IV is required', '#FF0000');
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
    throw new ErrorHandler('Method is required', '#FF0000');
  };

  if (!cipherKey) {
    throw new ErrorHandler('Cipher Key is required', '#FF0000');
  };

  if (!iv) {
    throw new ErrorHandler('IV is required', '#FF0000');
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


/* Relationship */

export function OneToMany<T>(relatedModel: () => T, inverse: (model: T) => any, options?: RelationshipOneToManyOptions) {
  return function (target: any, propertyKey: any) {

    if (!propertyKey) {
      throw new ErrorHandler('Property key is required for OneToMany relationship', '#FF0000');
    }

    if (!Reflect.hasMetadata(`oneToMany-${target.name}`, target)) {
      Reflect.defineMetadata(`oneToMany-${target.name}`, {}, target);
    }

    const oneToMany = Reflect.getMetadata(`oneToMany-${target.name}`, target);
    oneToMany[propertyKey] = { relatedModel, inverse, options, sourcePop: String(propertyKey) };
    
    Reflect.defineMetadata(`oneToMany-${target.name}`, oneToMany, target);
  };
}

export function OneToOne<T>(relatedModel: () => T, inverse: (model: T) => any, options?: RelationshipOneToOneOptions) {
  return function (target: any, propertyKey: any) {

    if (!propertyKey) {
      throw new ErrorHandler('Property key is required for OneToOne relationship', '#FF0000');
    }

    if (!Reflect.hasMetadata(`oneToOne-${target.name}`, target)) {
      Reflect.defineMetadata(`oneToOne-${target.name}`, {}, target);
    }
    const oneToOne = Reflect.getMetadata(`oneToOne-${target.name}`, target);
    oneToOne[propertyKey] = { relatedModel, inverse, options, sourcePop: String(propertyKey) };
    Reflect.defineMetadata(`oneToOne-${target.name}`, oneToOne, target);
  };
}

export function ManyToOne<T>(relatedModel: () => T, inverse: (model: T) => any, options?: RelationshipManyToOneOptions) {
  return function (target: any, propertyKey: any) {

    if (!propertyKey) {
      throw new ErrorHandler('Property key is required for ManyToOne relationship', '#FF0000');
    }

    if (!Reflect.hasMetadata(`manyToOne-${target.name}`, target)) {
      Reflect.defineMetadata(`manyToOne-${target.name}`, {}, target);
    }
    const manyToOne = Reflect.getMetadata(`manyToOne-${target.name}`, target);
    manyToOne[propertyKey] = { relatedModel, inverse, options, sourcePop: String(propertyKey) };
    Reflect.defineMetadata(`manyToOne-${target.name}`, manyToOne, target);
  };
}

export function ManyToMany<T>(relatedModel: () => T, inverse: (model: T) => any, options?: RelationshipManyToManyOptions) {
  return function (target: any, propertyKey: any) {

    if (!propertyKey) {
      throw new ErrorHandler('Property key is required for ManyToMany relationship', '#FF0000');
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




export function CreatedAt(target: any, key: string) {
  if (!String(target[key]).includes('Date')) throw new ErrorHandler(`The column "${key}" is not a Date type. Please ensure that the column type is correct and follows the expected naming conventions.`, '#FF0000');
  Reflect.defineMetadata(`createdAt-${target.name}`, key, target);
};

export function UpdatedAt(target: any, key: string) {
  if (!String(target[key]).includes('Date')) throw new ErrorHandler(`The column "${key}" is not a Date type. Please ensure that the column type is correct and follows the expected naming conventions.`, '#FF0000');
  Reflect.defineMetadata(`updatedAt-${target.name}`, key, target);
};

export function DeletedAt(target: any, key: string) {
  if (!String(target[key]).includes('Date')) throw new ErrorHandler(`The column "${key}" is not a Date type. Please ensure that the column type is correct and follows the expected naming conventions.`, '#FF0000');
  Reflect.defineMetadata(`deletedAt-${target.name}`, key, target);
};




export function IdColumn(target: any, key: string) {

  /* Push to rows */
  if (['name'].includes(String(key))) throw new ErrorHandler(`The column name "${key}" is invalid. Please ensure that the column name is correct and follows the expected naming conventions.`, '#FF0000');
  if (!Reflect.hasMetadata(`rows-${target.name}`, target)) {
    Reflect.defineMetadata(`rows-${target.name}`, [], target);
  }
  const rows = Reflect.getMetadata(`rows-${target.name}`, target);
  
  rows.push({ key, keyType: target[key] });
  Reflect.defineMetadata(`rows-${target.name}`, rows, target);

  /* Define AutoIncrement */
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



export function Column(target: any, key: any) {
  if (['name'].includes(String(key))) throw new ErrorHandler(`The column name "${key}" is invalid. Please ensure that the column name is correct and follows the expected naming conventions.`, '#FF0000');

  if (!Reflect.hasMetadata(`rows-${target.name}`, target)) {
    Reflect.defineMetadata(`rows-${target.name}`, [], target);
  }
  const rows = Reflect.getMetadata(`rows-${target.name}`, target);
  
  rows.push({ key, keyType: target[key] });
  Reflect.defineMetadata(`rows-${target.name}`, rows, target);

};

export function Paranoid(target: any) {
  Reflect.defineMetadata(`paranoid-${target.name}`, true, target);
};

export function Debug(target: any) {
  Reflect.defineMetadata(`debug-${target.name}`, true, target);
};

export function Provider(providerName: string) {
  return function(target: any) {      
    Reflect.defineMetadata(`databaseName-${target.name}`, providerName, target);
  };
};





export type RolesProps<T> = { [K in keyof T]?: boolean; };
export type RolesType<T> = Record<string, RolesProps<Omit<T, 'prototype'>>>;

export function Roles<T extends new (...args: any[]) => any>(roles: RolesType<T>) {
  return function (target: T) {
    Reflect.defineMetadata(`roles-${target.name}`, roles, target);
  };
};



type StaticScope<T> = {
  $where?: StaticProps<Omit<T, 'prototype'>> & SQLWhereOperators<Omit<T, 'prototype'>, any>;
  $options?: SearchMethodsOptions<Omit<T, 'prototype'>>;
};

type DynamicScope<T> = (...args: any[]) => StaticScope<T>;


export function Scopes<T extends new (...args: any[]) => any>(
  scopes: Record<string, StaticScope<T> | DynamicScope<T>>
) {
  return function (target: T) {
    Reflect.defineMetadata(`scopes-${target.name}`, scopes, target);
  };
};


/*
export function DefaultScope<T extends new (...args: any[]) => any>(
  defaultScope: {
      $where?: StaticProps<Omit<T, 'prototype'>> & SQLWhereOperators<Omit<T, 'prototype'>,any>;
      $options?: SearchMethodsOptions<Omit<T, 'prototype'>>;
    }
) {
  return function (target: T) {
    Reflect.defineMetadata(`defaultScope-${target.name}`, defaultScope, target);
  };
};
*/














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
  : T extends new (...args: any[]) => any
  ? { [K in keyof Omit<T,'prototype'>]?: ExtractPrimitiveType<T[K]> } | null
  : T extends object
  ? { [K in keyof T]?: ExtractPrimitiveType<T[K]> } | null
  : T;



export type StaticProps<T> = {
  [K in keyof T]?: T extends { [key in K]?: T[K] } ?
  ExtractPrimitiveType<T[K]> | SQLOperators<T, ExtractPrimitiveType<T[K]>> :
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

interface SQLWhereOperators<SchemaProps, K> {
  $or?: StaticProps<SchemaProps>[];
  $and?: StaticProps<SchemaProps>[];
};

interface SQLOperators<SchemaProps, K> {
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
  $hooks?: boolean;
  $transaction?: Transaction;
  $multi?: boolean;
  $cache?: boolean | number | { $key: string, $ttl: number };
};

export type RestoreMethodsOptions = {
  $limit?: number;
  $hooks?: boolean;
  $transaction?: Transaction;
  $logging?: boolean | ((sql: string, benchmark?: number) => void);
};

export type CountMethodsOptions<SchemaProps> = {
  $logging?: boolean | ((sql: string, benchmark?: number) => void);
  $col?: keyof SchemaProps;
  $transaction?: Transaction;
  $attributes?: AttributesOption<SchemaProps>;
  $group?: keyof SchemaProps;
  $distinct?: boolean;
  $paranoid?: boolean;
};

export type SearchMethodsOptions<SchemaProps> = {
  $limit?: number;
  $offset?: number;
  $transaction?: Transaction;
  $sort?: SortOption<SchemaProps>;
  $attributes?: AttributesOption<SchemaProps>;
  $group?: GroupOption<SchemaProps>;
  $having?: HavingOption<SchemaProps>;
  $include?: IncludeOption<SchemaProps>;
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
  $hooks?: boolean;
  $transaction?: Transaction;
  $truncate?: boolean;
  $logging?: boolean | ((sql: string, benchmark?: number) => void);
};

export type BuildMethodsOptions<SchemaProps> = {
  $transaction?: Transaction;
  $hooks?: boolean;
  $logging?: boolean | ((sql: string, benchmark?: number) => void);
};

type SortOption<SchemaProps> = {
  [K in keyof SchemaProps]?: 1 | -1 | boolean;
};

type HavingOption<SchemaProps> = {
  [K in keyof SchemaProps]?: SQLOperators<SchemaProps, ExtractPrimitiveType<SchemaProps[K]>> |
  ExtractPrimitiveType<SchemaProps[K]>
};

type IncludeOption<T> = any[] | { $model: any, $as?: string, $attributes?: AttributesOption<T> } | any;

type GroupOption<T> = (keyof T)[]

type AttributesOption<T> = (keyof T)[] | { $exclude?: (keyof T)[]; $include?: (keyof T)[] };

type Transaction = {
  $id: string;
  $provider: string;
  $commit: () => Promise<void>;
  $rollback: () => Promise<void>;
  $afterCommit: (callback: () => void) => void;
};




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
  static $configs: NexormConfig = cachedConfig;

  /**
   * Nexorm Providers
   * @type {string[]}
   * @public
   * @static
   * @example Nexorm.$providers
   */
  static $providers: string[] = sequelizes.map(x => x.name);


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
    $every: (): Job[] => {
      return Object.values(scheduledJobs);
    },


    /**
     * Get Scheduled Job by Name
     * @param {string} name - Job Name
     * @returns {Job | undefined}
     * @example Nexorm.$crons.$get('jobName')
     * @description Get Scheduled Job by Name
     */
    $get: (name: string): Job | undefined => {
      return scheduledJobs[name];
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
    $addSchedule: (name: string, cron: string, callback: () => void): Job => {
      if (scheduledJobs[name]) {
        throw new ErrorHandler(`Cron Job with name ${name} already exists`, '#FF0000');
      };
      if (!cron || !callback) {
        throw new ErrorHandler('Cron Job name, cron expression and callback function are required', '#FF0000');
      };
      if (typeof cron !== 'string') {
        throw new ErrorHandler('Cron Job cron expression must be a string', '#FF0000');
      };
      if (typeof callback !== 'function') {
        throw new ErrorHandler('Cron Job callback must be a function', '#FF0000');
      };
      
      scheduleJob(name, cron, callback);
      return scheduledJobs[name];
    },


    /**
     * Cancel a Scheduled Job
     * @param {string} name - Job Name
     * @returns {boolean}
     * @example Nexorm.$crons.$cancel('jobName')
     * @description Cancel a Scheduled Job
     */
    $cancel: (name: string): boolean => {
      if (scheduledJobs[name]) {
        scheduledJobs[name].cancel();
        delete scheduledJobs[name];
        return true;
      };
      return false;
    },


    /**
     * Cancel All Scheduled Jobs
     * @returns {boolean}
     * @example Nexorm.$crons.$cancelAll()
     * @description Cancel All Scheduled Jobs
     */
    $cancelAll: (): boolean => {
      Object.keys(scheduledJobs).forEach((name) => {
        scheduledJobs[name].cancel();
        delete scheduledJobs[name];
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

    return await connect(providerName);
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
    await connectAll();
  };


  /**
   * Transaction
   * @param providerName Provider Name
   * @returns Promise<Transaction>
   * @example await Nexorm.$transaction('nexorm')
   * @description Create a Transaction
   */
  static async $transaction(providerName?: string): Promise<Transaction> {
   if (!providerName) providerName = 'nexorm';

    await ConnectionManager.waitUntilConnected(providerName);
    
    const sequelize = sequelizes.find(x => x.name === providerName);
    if (!sequelize || !sequelize.sequelize) {
      throw new ErrorHandler(`Sequelize provider "${providerName}" not found.`, '#FF0000');
    };

    const trx = await sequelize.sequelize.transaction();
    const wrapped = returnTransaction(trx, providerName);

    return wrapped as Transaction;
  };


};



function returnTransaction(
  transaction: SequelizeTransaction,
  providerName: string
) {
  const DynamicClass = class {
    trx: SequelizeTransaction;
    $id: string;
    $provider: string;
    $commit: () => Promise<void>;
    $rollback: () => Promise<void>;
    $afterCommit: (callback: () => void) => void;

    constructor() {
      this.trx = transaction;
      this.$id = (transaction as any).id;
      this.$provider = providerName;
      this.$commit = () => transaction.commit();
      this.$rollback = () => transaction.rollback();
      this.$afterCommit = (callback: () => void) => {
        if (typeof callback !== 'function') {
          throw new ErrorHandler('Callback must be a function', '#FF0000');
        };
        transaction.afterCommit(callback);
      };

      Object.defineProperty(this, 'trx', {
        enumerable: false,
        writable: false,
        configurable: false,
      });

    }
  }

  Object.defineProperty(DynamicClass, 'name', { value: 'Transaction' });

  return new DynamicClass() as Transaction;
};




async function getConfigByProvider(providerName: string): Promise<NexormConfigType> {
  const config = await readConfig().catch((err)=> { return undefined; });
  if (!config) {
    throw new ErrorHandler('Nexorm Config Not Found, Please Create a Config File', '#FF0000');
  };
  var providerConfig = config.find((x) => x.$provider == providerName);
  if (!providerConfig) {
    throw new ErrorHandler(`Nexorm Config Not Found For Provider: ${providerName}, Please Create a Config File`, '#FF0000');
  };

  return providerConfig;
};


export interface FunctionResponseList<T> {

  /**
   * @description Save the model instance to the database
   * @param {BuildProps<Omit<T, 'prototype'>>} dataValue - Data to save
   * @returns {Promise<StaticProps<Omit<T, 'prototype'>>>}
   */
  $save: (dataValue?: BuildProps<Omit<T, 'prototype'>>) => Promise<StaticProps<Omit<T, 'prototype'>>>;

  /**
   * @description Convert the model instance to a plain object
   * @returns {StaticProps<Omit<T, 'prototype'>>}
   */
  $toObject: () => StaticProps<Omit<T, 'prototype'>>;

  /**
   * @description Convert the model instance to a JSON object
   * @returns {StaticProps<Omit<T, 'prototype'>>}
   */
  $toJSON: () => StaticProps<Omit<T, 'prototype'>>;

  /**
   * @description Convert the model instance to a JSON string
   * @returns {string}
   */
  $toStringify: () => string;


  /**
   * @description Clone the model instance
   * @returns {StaticProps<Omit<T, 'prototype'>>}
   */
  $clone: () => StaticProps<Omit<T, 'prototype'>>;

  /**
   * @description Soft delete the model instance
   * @returns {Promise<StaticProps<Omit<T, 'prototype'>>>}
   */
  $softDelete: () => Promise<StaticProps<Omit<T, 'prototype'>>>;

  /**
   * @description Hard delete the model instance
   * @returns {Promise<StaticProps<Omit<T, 'prototype'>>>}
   */
  $delete: () => Promise<StaticProps<Omit<T, 'prototype'>>>;

  /**
   * @description Get a property value on the model instance
   * @param {keyof Omit<T, 'prototype'>} property - Property name
   * @returns {any}
   */
  $get: (property: keyof Omit<T, 'prototype'>) => any;

  /**
   * @description Set a property value on the model instance
   * @param {keyof Omit<T, 'prototype'>} property - Property name
   * @param {any} value - Property value
   * @returns {any}
   */
  $set: (property: keyof Omit<T, 'prototype'>, value: any) => any;

  /**
   * @description Automatically delete after a certain time
   * @param {uniqueCronName: string, spec: string, options?: { $force?: boolean, $continuity?: boolean } }
    * @returns {Object}
  */
  $expiresAt: (uniqueCronName: string, spec: string, options?: { $force?: boolean, $continuity?: boolean }) => {
    $cancel: () => boolean;
  };

  /**
   * @description Is Deleted
   * @returns {boolean}
   */
  $isDeleted: () => boolean;

  /**
   * @description Is Modified
   * @returns {boolean}
   */
  $isModified: () => boolean;

  /**
   * @description Is Valid
   * @returns {boolean}
   */
  $isValid: () => boolean;

  /**
   * @description Refresh the model instance
   * @returns {Promise<StaticProps<Omit<T, 'prototype'>> | null>}
   * */
  $refresh: () => Promise<StaticProps<Omit<T, 'prototype'>> | null>;

  /**
   * @description Reload the model instance
   * @param {Array<keyof Omit<T, 'prototype'>>} keys - Keys to reload
   * @returns {Promise<StaticProps<Omit<T, 'prototype'>>>}
   */
  $reload: (keys: (keyof Omit<T, 'prototype'>)[]) => Promise<StaticProps<Omit<T, 'prototype'>>>;

  /**
   * @description Role the model instance
   * @param {string} role - Role name
   * @returns {StaticProps<Omit<T, 'prototype'>>}
   */
  $role: (role: string) => StaticProps<Omit<T, 'prototype'>>;

  /**
   * @description Update the model instance
   * @param {UpdateOptions<Omit<T, 'prototype'>>} updateQuery - Update query
   * @returns {Promise<StaticProps<Omit<T, 'prototype'>>>}
   */
  $update: (updateQuery: UpdateOptions<Omit<T, 'prototype'>>) => Promise<StaticProps<Omit<T, 'prototype'>>>;

  /**
   * @description Restore the model instance
   * @returns {Promise<StaticProps<Omit<T, 'prototype'>>>}
   */
  $restore: () => Promise<StaticProps<Omit<T, 'prototype'>>>;
};

export type SelectKeys<T, K extends keyof T> = Pick<T, K>;






export function Model<SchemaProps>(Schema: SchemaProps) {  

  const modelEngine = new ModelEngine(Schema);
  const engine = modelEngine.initialize();


  type SchemaStaticFunctions<SchemaStatics> = {

    /**
     * @description Convert the model instance to a plain object
     * @returns {SchemaStatics}
     */
    $toObject: () => SchemaStatics;

    /**
     * @description Save the model instance to the database
     * @param {BuildProps<SchemaStatics>} dataValue - Data to save
     * @returns {Promise<ExtendType<SchemaStatics, FunctionResponseList<SchemaStatics>>>}
     */
    $save: (dataValue?: BuildProps<SchemaStatics>) => Promise<ExtendType<SchemaStatics, FunctionResponseList<SchemaStatics>>>;

    /**
     * @description Get a model instance by primary key
     * @param {string | number} primaryKey - Primary key value
     * @returns {Promise<ExtendType<SchemaStatics, FunctionResponseList<SchemaStatics>>>}
     */
    $get: (property: keyof SchemaStatics) => any;

    /**
     * @description Set a property value on the model instance
     * @param {keyof SchemaStatics} property - Property name
     * @param {any}
     * @returns {any}
     */
    $set: (property: keyof SchemaStatics, value: any) => any;

    /**
     * @description Clear all properties on the model instance
     * @returns {void}
     */
    $clear: () => void;

    /**
     * @description Check if the model instance is new
     * @returns {boolean}
     */
    $toJSON: () => SchemaStatics;

    /**
     * @description Convert the model instance to a JSON string
     * @returns {string}
     */
    $toStringify: () => string;

    /**
     * @description Check if the model instance is new
     * @returns {boolean}
     */
    $isNew: () => boolean;
  };

  type SchemaStatics = Omit<{ [K in keyof SchemaProps]?: ExtractPrimitiveType<SchemaProps[K]> }, 'prototype'>;
  type Schema = SchemaStatics & SchemaStaticFunctions<SchemaStatics>


  const DynamicModel = class {
    #isNew: boolean = false;

    constructor(dataValue?: SchemaStatics) {
      this.#isNew = true;

      /* Define Properties */
      if (dataValue) {
        Object.keys(dataValue as any)
          .filter((key) => !['length', 'name', 'prototype'].includes(key))
          .forEach((key) => {
            (this as any)[key] = dataValue ? (dataValue as any)[key] : undefined;
          });
      };

      /* Hide Properties */
      Object.defineProperty(this,'$toObject',{ enumerable: false, configurable: false, writable: false });
      Object.defineProperty(this,'$save',{ enumerable: false, configurable: false, writable: false });
      Object.defineProperty(this,'$get',{ enumerable: false, configurable: false, writable: false });
      Object.defineProperty(this,'$set',{ enumerable: false, configurable: false, writable: false });
      Object.defineProperty(this,'$clear',{ enumerable: false, configurable: false, writable: false });
      Object.defineProperty(this,'$toJSON',{ enumerable: false, configurable: false, writable: false });
      Object.defineProperty(this,'$toStringify',{ enumerable: false, configurable: false, writable: false });
      Object.defineProperty(this,'$isNew',{ enumerable: false, configurable: false, writable: false });
     };


     /* Initialize Engine */


    $get = (property: keyof SchemaStatics): any => {
      var value = (this as any)[property];
      if (value) {
        return value;
      };
      return null;
    };

    $set = (property: keyof SchemaStatics, value: any): any => {
        (this as any)[property] = value;
        return (this as any)[property];
    };

    $clear = (): void => {
      Object.keys(this).forEach((key) => {
        if (
          String(key).startsWith('$') ||
          String(key) == 'length' ||
          String(key) == 'name' ||
          String(key) == 'prototype' ||
          String(key) == 'constructor' ||
          ['toObject', 'save', 'toJSON', 'toStringify', 'clear', 'get', 'set', 'isNew'].includes(String(key))
        ) return;
          delete (this as any)[key];
      });
    };

    $toJSON = (): SchemaStatics => {
      try {
        return JSON.parse(JSON.stringify(this.$toObject()));
      } catch (error) {
        return {} as SchemaStatics;
      }
    };

    $toStringify = (): string => {
      try {
        return JSON.stringify(this.$toObject());
      } catch (error) {
        return '';
      }
    };

    $toObject = (): SchemaStatics => Object.assign({}, this) as SchemaStatics;

    $isNew = (): boolean => {
      return this.#isNew;
    };

    $save = async(dataValue?: BuildProps<SchemaStatics>) => {
      if (!dataValue) dataValue = {};
      await this.#constructorInitialize();
      await ConnectionManager.connectIfNotConnected(engine.$provider);

      if (engine.$config && engine.$config.$autoConnect) {
        await ConnectionManager.connectIfNotConnected(engine.$provider);
      } else {
        await ConnectionManager.waitUntilConnected(engine.$provider);
      };
      if (engine.$debugMode) debugLog(`Saving Data: ${(engine.$schema as any).name} - dataValue: ${JSON.stringify(dataValue)}`);

      var dataValues = this.#isNew ? 
      await engine.$build({ ...this.$toObject(), ...dataValue } as any) : 
      await engine.$update({ $where: { ObjectId: (this as any)?.ObjectId }, $update: { $set: { ...this.$toObject(), ...dataValue } } } as any);

      if (this.#isNew) this.#isNew = false;
  
      if (dataValues) {
        Object.keys(dataValues).forEach((key) => {
          if (
            String(key).startsWith('$') ||
            String(key) == 'length' ||
            String(key) == 'name' ||
            String(key) == 'prototype' ||
            String(key) == 'constructor' ||
            ['toObject', 'save', 'toJSON', 'toStringify', 'clear', 'get', 'set', 'isNew'].includes(String(key))
          ) return;
          (this as any)[key] = dataValues[key];
        });
      };

      return dataValues;
    };

    /*                          */


    static $search = async(values: any) => {
      await this.#initialize();
      
      if (engine.$config && engine.$config.$autoConnect) {
        await ConnectionManager.connectIfNotConnected(engine.$provider);
      } else {
        await ConnectionManager.waitUntilConnected(engine.$provider);
      };
      
      return engine.$search(values);
    };

    static $searchFirst = async() => {
      await this.#initialize();
      
      if (engine.$config && engine.$config.$autoConnect) {
        await ConnectionManager.connectIfNotConnected(engine.$provider);
      } else {
        await ConnectionManager.waitUntilConnected(engine.$provider);
      };
      
      return engine.$searchFirst();
    };

    static $searchOne = async(values: any) => {
      await this.#initialize();
      
      if (engine.$config && engine.$config.$autoConnect) {
        await ConnectionManager.connectIfNotConnected(engine.$provider);
      } else {
        await ConnectionManager.waitUntilConnected(engine.$provider);
      };
      
      return engine.$searchOne(values);
    };

    static $searchById = async(values: any) => {
      await this.#initialize();
      
      if (engine.$config && engine.$config.$autoConnect) {
        await ConnectionManager.connectIfNotConnected(engine.$provider);
      } else {
        await ConnectionManager.waitUntilConnected(engine.$provider);
      };
      
      return engine.$searchById(values);
    };

    static $searchByIds = async(values: any) => {
      await this.#initialize();
      
      if (engine.$config && engine.$config.$autoConnect) {
        await ConnectionManager.connectIfNotConnected(engine.$provider);
      } else {
        await ConnectionManager.waitUntilConnected(engine.$provider);
      };
      
      return engine.$searchByIds(values);
    };

    static $searchAndCount = async(values: any) => {
      await this.#initialize();
      
      if (engine.$config && engine.$config.$autoConnect) {
        await ConnectionManager.connectIfNotConnected(engine.$provider);
      } else {
        await ConnectionManager.waitUntilConnected(engine.$provider);
      };
      
      return engine.$searchAndCount(values);
    };

    static $everything = async() => {
      await this.#initialize();
      
      if (engine.$config && engine.$config.$autoConnect) {
        await ConnectionManager.connectIfNotConnected(engine.$provider);
      } else {
        await ConnectionManager.waitUntilConnected(engine.$provider);
      };
      
      return engine.$everything();
    };

    static $count = async(values: any) => {
      await this.#initialize();
      
      if (engine.$config && engine.$config.$autoConnect) {
        await ConnectionManager.connectIfNotConnected(engine.$provider);
      } else {
        await ConnectionManager.waitUntilConnected(engine.$provider);
      };
      
      return engine.$count(values);
    };

    static $query = async(values: any) => {
      await this.#initialize();
      
      if (engine.$config && engine.$config.$autoConnect) {
        await ConnectionManager.connectIfNotConnected(engine.$provider);
      } else {
        await ConnectionManager.waitUntilConnected(engine.$provider);
      };
      
      return engine.$query(values);
    };

    static $distinct = async(values: any) => {
      await this.#initialize();
      
      if (engine.$config && engine.$config.$autoConnect) {
        await ConnectionManager.connectIfNotConnected(engine.$provider);
      } else {
        await ConnectionManager.waitUntilConnected(engine.$provider);
      };
      
      return engine.$distinct(values);
    };

    static $scope = (scope: any, values: any) => {
      return engine.$scope(scope, values);
    };

    static $build = async(values: any) => {
      await this.#initialize();
      
      if (engine.$config && engine.$config.$autoConnect) {
        await ConnectionManager.connectIfNotConnected(engine.$provider);
      } else {
        await ConnectionManager.waitUntilConnected(engine.$provider);
      };
      
      return engine.$build(values);
    };

    static $buildMany = async(values: any) => {
      await this.#initialize();
      
      if (engine.$config && engine.$config.$autoConnect) {
        await ConnectionManager.connectIfNotConnected(engine.$provider);
      } else {
        await ConnectionManager.waitUntilConnected(engine.$provider);
      };
      
      return engine.$buildMany(values);
    };

    static $searchAndReplace = async(values: any) => {
      await this.#initialize();
      
      if (engine.$config && engine.$config.$autoConnect) {
        await ConnectionManager.connectIfNotConnected(engine.$provider);
      } else {
        await ConnectionManager.waitUntilConnected(engine.$provider);
      };
      
      return engine.$searchAndReplace(values);
    };

    static $update = async(values: any) => {
      await this.#initialize();
      
      if (engine.$config && engine.$config.$autoConnect) {
        await ConnectionManager.connectIfNotConnected(engine.$provider);
      } else {
        await ConnectionManager.waitUntilConnected(engine.$provider);
      };
      
      return engine.$update(values);
    };
    
    static $updateMany = async(values: any) => {
      await this.#initialize();
      
      if (engine.$config && engine.$config.$autoConnect) {
        await ConnectionManager.connectIfNotConnected(engine.$provider);
      } else {
        await ConnectionManager.waitUntilConnected(engine.$provider);
      };
      
      return engine.$updateMany(values);
    };

    static $upsert = async(values: any) => {
      await this.#initialize();
      
      if (engine.$config && engine.$config.$autoConnect) {
        await ConnectionManager.connectIfNotConnected(engine.$provider);
      } else {
        await ConnectionManager.waitUntilConnected(engine.$provider);
      };
      
      return engine.$upsert(values);
    };

    static $delete = async(values: any) => {
      await this.#initialize();
      
      if (engine.$config && engine.$config.$autoConnect) {
        await ConnectionManager.connectIfNotConnected(engine.$provider);
      } else {
        await ConnectionManager.waitUntilConnected(engine.$provider);
      };
      
      return engine.$delete(values);
    };

    static $deleteMany = async(values: any) => {
      await this.#initialize();
      
      if (engine.$config && engine.$config.$autoConnect) {
        await ConnectionManager.connectIfNotConnected(engine.$provider);
      } else {
        await ConnectionManager.waitUntilConnected(engine.$provider);
      };
      
      return engine.$deleteMany(values);
    };

    static $restore = async(values: any) => {
      await this.#initialize();
      
      if (engine.$config && engine.$config.$autoConnect) {
        await ConnectionManager.connectIfNotConnected(engine.$provider);
      } else {
        await ConnectionManager.waitUntilConnected(engine.$provider);
      };
      
      return engine.$restore(values);
    };

    static $softDelete = async(values: any) => {
      await this.#initialize();
      
      if (engine.$config && engine.$config.$autoConnect) {
        await ConnectionManager.connectIfNotConnected(engine.$provider);
      } else {
        await ConnectionManager.waitUntilConnected(engine.$provider);
      };
      
      return engine.$softDelete(values);
    };

    static $softDeleteMany = async(values: any) => {
      await this.#initialize();
      
      if (engine.$config && engine.$config.$autoConnect) {
        await ConnectionManager.connectIfNotConnected(engine.$provider);
      } else {
        await ConnectionManager.waitUntilConnected(engine.$provider);
      };

      return engine.$softDeleteMany(values);
    };

    static $truncate = async() => {
      await this.#initialize();

      if (engine.$config && engine.$config.$autoConnect) {
        await ConnectionManager.connectIfNotConnected(engine.$provider);
      } else {
        await ConnectionManager.waitUntilConnected(engine.$provider);
      };

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
      if (this.$config) return true;
      var config = await getConfigByProvider(engine.$provider).catch((err) => { });
      if (!config) return false;
      engine.$config = config;
      this.$config = config;
      return true;
    };

    async #constructorInitialize() {
      if (engine.$config) return true;
      var config = await getConfigByProvider(engine.$provider).catch((err) => { });
      if (!config) return false;
      engine.$config = config;
    };
    /********/


  };

  Object.defineProperty(DynamicModel, 'name', { value: (Schema as any).name });

    
  return (DynamicModel as unknown as ModelEngine<SchemaProps> & { new (dataValue?: SchemaStatics): Schema });
};








export namespace FunctionResponse  {

  export type Responses<SchemaProps> = SelectKeys<FunctionResponseList<SchemaProps>, '$clone' | '$delete' | '$expiresAt' | '$get' | '$isDeleted' | '$isModified' | '$isValid' | '$refresh' | '$reload' | '$restore' | '$role' | '$save' | '$set' | '$softDelete' | '$toJSON' | '$toObject' | '$toStringify' | '$update'>;

};




export class ModelEngine<SchemaProps> {
  public $type!: Omit<SchemaProps, 'prototype'>;
  public $model!: any;
  public $middlewares: any[] = [];
  public $cache: CacheManager = new CacheManager();
  public $config!: NexormConfigType;;
  
  public $debugMode: boolean = false;
  public $schema!: Omit<SchemaProps, 'prototype'>;
  public $provider!: string;

  constructor(private Schema: SchemaProps) {
    this.$provider = Reflect.getMetadata(`databaseName-${(Schema as any).name}`, Schema as any) || 'nexorm';
    this.$schema = Schema as Omit<SchemaProps, 'prototype'>;
    this.$middlewares = [];
    if (!String(Schema).includes("class")) throw new ErrorHandler('Schema Must Be A Static Class', '#FF0000');

    var debug = Reflect.getMetadata(`debug-${(this.$schema as any).name}`, this.$schema as any) || false;
    this.$debugMode = debug;
    

  };

  public initialize() {
      return this;
  };

  /**
   * Scope
   * 
   */
  $scope(scopes: string | string[], ...args: any[]) {

    var scope = {} as any;

    if (typeof scopes === 'string') {

      var getScopes = Reflect.getMetadata(`scopes-${(this.$schema as any).name}`, this.$schema as any) || {};
      if (!getScopes[scopes]) {
        throw new ErrorHandler(`Scope ${scopes} Not Found`, '#FF0000');
      };

      if (typeof getScopes[scopes] == 'function') {
        scope = getScopes[scopes](...args);
      } else {
        scope = getScopes[scopes];
      }
      
    } else 
    if (_.isArray(scopes)) { 

      var getScopes = Reflect.getMetadata(`scopes-${(this.$schema as any).name}`, this.$schema as any) || {};
      for (var i = 0; i < scopes.length; i++) {
        if (!getScopes[scopes[i]]) {
          throw new ErrorHandler(`Scope ${scopes[i]} Not Found`, '#FF0000');
        };

        if (typeof getScopes[scopes[i]] == 'function') {
          scope = { ...scope, ...getScopes[scopes[i]](...args) };
        } else {
          scope = { ...scope, ...getScopes[scopes[i]] };
        }

      };

    };

    if (Object.keys(scope).length === 0) {
      throw new ErrorHandler('Scope Not Found', '#FF0000');
    };


    return {

      /* İnitalize yapılcak ModelEngine Kımsındaki gibi wait untilli yer gibi */
      $searchOne: async (query?: {
        $where?: StaticProps<ExtendType<Omit<SchemaProps, 'prototype'>,{ ObjectId: string }>> & SQLWhereOperators<ExtendType<Omit<SchemaProps, 'prototype'>, { ObjectId: string }>, SchemaProps>,
        $options?: SearchMethodsOptions<Omit<SchemaProps, 'prototype'>>
      }): Promise<ExtendType<StaticProps<ExtendType<Omit<SchemaProps, 'prototype'>, { ObjectId: string }>>,FunctionResponse.Responses<SchemaProps>>> => {
        var searchQuery = { ...scope?.$where, ...query?.$where };
        var optionsQuery = { ...scope?.$options, ...query?.$options };

        if (this.$config && this.$config.$autoConnect) {
          await ConnectionManager.connectIfNotConnected(this.$provider);
        } else {
          await ConnectionManager.waitUntilConnected(this.$provider);
        };
        
        if (this.$debugMode) debugLog(`Searching One Data: ${(this.$schema as any).name} - $where: ${JSON.stringify(searchQuery)} - $options: ${JSON.stringify(optionsQuery)}`);
        const dataValues = await this.$searchOne({ $where: searchQuery, $options: optionsQuery });

        return dataValues as any;
      },

      $search: async (query?: {
        $where?: StaticProps<ExtendType<Omit<SchemaProps, 'prototype'>,{ ObjectId: string }>> & SQLWhereOperators<ExtendType<Omit<SchemaProps, 'prototype'>, { ObjectId: string }>, SchemaProps>,
        $options?: SearchMethodsOptions<Omit<SchemaProps, 'prototype'>>
      }): Promise<ExtendType<StaticProps<ExtendType<Omit<SchemaProps, 'prototype'>, { ObjectId: string }>>,FunctionResponse.Responses<SchemaProps>>[]> => {
        var searchQuery = { ...scope?.$where, ...query?.$where };
        var optionsQuery = { ...scope?.$options, ...query?.$options };

        if (this.$config && this.$config.$autoConnect) {
          await ConnectionManager.connectIfNotConnected(this.$provider);
        } else {
          await ConnectionManager.waitUntilConnected(this.$provider);
        };
        
        if (this.$debugMode) debugLog(`Searching Data: ${(this.$schema as any).name} - $where: ${JSON.stringify(searchQuery)} - $options: ${JSON.stringify(optionsQuery)}`);
        const dataValues = await this.$search({ $where: searchQuery, $options: optionsQuery });

        return dataValues;
      },

      $update: async (query?: {
        $where?: StaticProps<ExtendType<Omit<SchemaProps, 'prototype'>,{ ObjectId: string }>> & SQLWhereOperators<ExtendType<Omit<SchemaProps, 'prototype'>, { ObjectId: string }>, SchemaProps>,
        $update: UpdateOptions<Omit<SchemaProps, 'prototype'>>,
        $rules?: Omit<RulesOptions<Omit<SchemaProps, 'prototype'>>, '$upsert'>
      }): Promise<ExtendType<StaticProps<ExtendType<Omit<SchemaProps, 'prototype'>, { ObjectId: string }>>,FunctionResponse.Responses<SchemaProps>>[]> => {
        var updateQuery = { ...scope?.$where, ...query?.$where };
        var updateOptions = { ...query?.$update };
        var rulesQuery = { ...query?.$rules };

        if (this.$config && this.$config.$autoConnect) {
          await ConnectionManager.connectIfNotConnected(this.$provider);
        } else {
          await ConnectionManager.waitUntilConnected(this.$provider);
        };
        
        if (this.$debugMode) debugLog(`Updating Data: ${(this.$schema as any).name} - $where: ${JSON.stringify(updateQuery)} - $update: ${JSON.stringify(updateOptions)} - $rules: ${JSON.stringify(rulesQuery)}`);
        const dataValues = await this.$update({ $where: updateQuery, $update: updateOptions, $rules: rulesQuery });

        return dataValues as any;
      },

      $updateMany: async (query?: {
        $where?: StaticProps<ExtendType<Omit<SchemaProps, 'prototype'>,{ ObjectId: string }>> & SQLWhereOperators<ExtendType<Omit<SchemaProps, 'prototype'>, { ObjectId: string }>, SchemaProps>,
        $update: UpdateOptions<Omit<SchemaProps, 'prototype'>>,
        $rules?: Omit<RulesOptions<Omit<SchemaProps, 'prototype'>>, '$upsert'>
      }): Promise<ExtendType<StaticProps<ExtendType<Omit<SchemaProps, 'prototype'>, { ObjectId: string }>>,FunctionResponse.Responses<SchemaProps>>[]> => {
        var updateQuery = { ...scope?.$where, ...query?.$where };
        var updateOptions = { ...query?.$update };
        var rulesQuery = { ...query?.$rules };

        if (this.$config && this.$config.$autoConnect) {
          await ConnectionManager.connectIfNotConnected(this.$provider);
        } else {
          await ConnectionManager.waitUntilConnected(this.$provider);
        };
        
        if (this.$debugMode) debugLog(`Updating Many Data: ${(this.$schema as any).name} - $where: ${JSON.stringify(updateQuery)} - $update: ${JSON.stringify(updateOptions)} - $rules: ${JSON.stringify(rulesQuery)}`);
        const dataValues = await this.$updateMany({ $where: updateQuery, $update: updateOptions, $rules: rulesQuery });

        return dataValues as any;
      },


      $delete: async (query?: {
        $where?: StaticProps<ExtendType<Omit<SchemaProps, 'prototype'>,{ ObjectId: string }>> & SQLWhereOperators<ExtendType<Omit<SchemaProps, 'prototype'>, { ObjectId: string }>, SchemaProps>,
      }): Promise<boolean> => {
        var deleteQuery = { ...scope?.$where, ...query?.$where };

        if (this.$config && this.$config.$autoConnect) {
          await ConnectionManager.connectIfNotConnected(this.$provider);
        } else {
          await ConnectionManager.waitUntilConnected(this.$provider);
        };
        
        if (this.$debugMode) debugLog(`Deleting Data: ${(this.$schema as any).name} - $where: ${JSON.stringify(deleteQuery)}`);
        const dataValues = await this.$delete({ $where: deleteQuery });

        return dataValues as any;
      },

      $deleteMany: async (query?: {
        $where?: StaticProps<ExtendType<Omit<SchemaProps, 'prototype'>,{ ObjectId: string }>> & SQLWhereOperators<ExtendType<Omit<SchemaProps, 'prototype'>, { ObjectId: string }>, SchemaProps>,
      }): Promise<number> => {
        var deleteQuery = { ...scope?.$where, ...query?.$where };;

        if (this.$config && this.$config.$autoConnect) {
          await ConnectionManager.connectIfNotConnected(this.$provider);
        } else {
          await ConnectionManager.waitUntilConnected(this.$provider);
        };
        
        if (this.$debugMode) debugLog(`Deleting Many Data: ${(this.$schema as any).name} - $where: ${JSON.stringify(deleteQuery)}`);
        const dataValues = await this.$deleteMany({ $where: deleteQuery });

        return dataValues as any;
      },

      $count: async (query?: {
        $where?: StaticProps<ExtendType<Omit<SchemaProps, 'prototype'>,{ ObjectId: string }>> & SQLWhereOperators<ExtendType<Omit<SchemaProps, 'prototype'>, { ObjectId: string }>, SchemaProps>,
        $options?: CountMethodsOptions<Omit<SchemaProps, 'prototype'>>
      }): Promise<number> => {
        var countQuery = { ...scope?.$where, ...query?.$where };
        var optionsQuery = { ...scope?.$options, ...query?.$options };

        if (this.$config && this.$config.$autoConnect) {
          await ConnectionManager.connectIfNotConnected(this.$provider);
        } else {
          await ConnectionManager.waitUntilConnected(this.$provider);
        };
        
        if (this.$debugMode) debugLog(`Counting Data: ${(this.$schema as any).name} - $where: ${JSON.stringify(countQuery)} - $options: ${JSON.stringify(optionsQuery)}`);
        const dataValues = await this.$count({ $where: countQuery, $options: optionsQuery });

        return dataValues;
      },

      $searchAndCount: async (query?: {
        $where?: StaticProps<ExtendType<Omit<SchemaProps, 'prototype'>,{ ObjectId: string }>> & SQLWhereOperators<ExtendType<Omit<SchemaProps, 'prototype'>, { ObjectId: string }>, SchemaProps>,
      }): Promise<[ExtendType<StaticProps<ExtendType<Omit<SchemaProps, 'prototype'>, { ObjectId: string }>>,FunctionResponse.Responses<SchemaProps>>[], number]> => {
        var searchQuery = { ...scope?.$where, ...query?.$where };

        if (this.$config && this.$config.$autoConnect) {
          await ConnectionManager.connectIfNotConnected(this.$provider);
        } else {
          await ConnectionManager.waitUntilConnected(this.$provider);
        };
        
        if (this.$debugMode) debugLog(`Searching And Counting Data: ${(this.$schema as any).name} - $where: ${JSON.stringify(searchQuery)}`);
        const dataValues = await this.$searchAndCount({ $where: searchQuery });

        return dataValues as any;
      },

      $restore: async (query?: {
        $where?: StaticProps<ExtendType<Omit<SchemaProps, 'prototype'>,{ ObjectId: string }>> & SQLWhereOperators<ExtendType<Omit<SchemaProps, 'prototype'>, { ObjectId: string }>, SchemaProps>,
      }): Promise<void> => {
        var restoreQuery = { ...scope?.$where, ...query?.$where };

        if (this.$config && this.$config.$autoConnect) {
          await ConnectionManager.connectIfNotConnected(this.$provider);
        } else {
          await ConnectionManager.waitUntilConnected(this.$provider);
        };
        
        if (this.$debugMode) debugLog(`Restoring Data: ${(this.$schema as any).name} - $where: ${JSON.stringify(restoreQuery)}`);
        
        return await this.$restore({ $where: restoreQuery });
      },

      $softDelete: async (query?: {
        $where?: StaticProps<ExtendType<Omit<SchemaProps, 'prototype'>,{ ObjectId: string }>> & SQLWhereOperators<ExtendType<Omit<SchemaProps, 'prototype'>, { ObjectId: string }>, SchemaProps>,
      }): Promise<boolean> => {
        var softDeleteQuery = { ...scope?.$where, ...query?.$where };

        if (this.$config && this.$config.$autoConnect) {
          await ConnectionManager.connectIfNotConnected(this.$provider);
        } else {
          await ConnectionManager.waitUntilConnected(this.$provider);
        };
        
        if (this.$debugMode) debugLog(`Soft Deleting Data: ${(this.$schema as any).name} - $where: ${JSON.stringify(softDeleteQuery)}`);
        const dataValues = await this.$softDelete({ $where: softDeleteQuery });

        return dataValues as any;
      },

      $softDeleteMany: async (query?: {
        $where?: StaticProps<ExtendType<Omit<SchemaProps, 'prototype'>,{ ObjectId: string }>> & SQLWhereOperators<ExtendType<Omit<SchemaProps, 'prototype'>, { ObjectId: string }>, SchemaProps>,
      }): Promise<number> => {
        var softDeleteQuery = { ...scope?.$where, ...query?.$where };

        if (this.$config && this.$config.$autoConnect) {
          await ConnectionManager.connectIfNotConnected(this.$provider);
        } else {
          await ConnectionManager.waitUntilConnected(this.$provider);
        };
        
        if (this.$debugMode) debugLog(`Soft Deleting Many Data: ${(this.$schema as any).name} - $where: ${JSON.stringify(softDeleteQuery)}`);
        const dataValues = await this.$softDeleteMany({ $where: softDeleteQuery });

        return dataValues as any;
      },

      $upsert: async (query?: {
        $where?: StaticProps<ExtendType<Omit<SchemaProps, 'prototype'>,{ ObjectId: string }>> & SQLWhereOperators<ExtendType<Omit<SchemaProps, 'prototype'>, { ObjectId: string }>, SchemaProps>,
        $update?: UpdateOptions<Omit<SchemaProps, 'prototype'>>,
        $rules?: Omit<RulesOptions<Omit<SchemaProps, 'prototype'>>, '$upsert'>
      }): Promise<ExtendType<StaticProps<ExtendType<Omit<SchemaProps, 'prototype'>, { ObjectId: string }>>,FunctionResponse.Responses<SchemaProps>>> => {
        var upsertQuery = { ...scope?.$where, ...query?.$where };
        var updateQuery = { ...query?.$update };
        var rulesQuery = { ...query?.$rules };

        if (this.$config && this.$config.$autoConnect) {
          await ConnectionManager.connectIfNotConnected(this.$provider);
        } else {
          await ConnectionManager.waitUntilConnected(this.$provider);
        };
        
        if (this.$debugMode) debugLog(`Upserting Data: ${(this.$schema as any).name} - $where: ${JSON.stringify(upsertQuery)} - $update: ${JSON.stringify(query?.$update)} - $rules: ${JSON.stringify(query?.$rules)}`);
        const dataValues = await this.$upsert({ $where: upsertQuery, $update: updateQuery, $rules: rulesQuery });

        return dataValues as any;
      },


      $distinct: async (query?: {
        $field: (keyof ExtendType<Omit<SchemaProps, 'prototype'>, { ObjectId: string }>)[],
        $where?: StaticProps<ExtendType<Omit<SchemaProps, 'prototype'>,{ ObjectId: string }>> & SQLWhereOperators<ExtendType<Omit<SchemaProps, 'prototype'>, { ObjectId: string }>, SchemaProps>,
      }): Promise<any[][]> => {
        var distinctQuery = { ...scope?.$where, ...query?.$where };
        var fieldsQuery = query?.$field || [];

        if (this.$config && this.$config.$autoConnect) {
          await ConnectionManager.connectIfNotConnected(this.$provider);
        } else {
          await ConnectionManager.waitUntilConnected(this.$provider);
        };
        
        if (this.$debugMode) debugLog(`Distinct Data: ${(this.$schema as any).name} - $where: ${JSON.stringify(distinctQuery)}`);
        const dataValues = await this.$distinct({ $where: distinctQuery, $field: fieldsQuery });

        return dataValues as any;
      }

    };

  };



  async $searchAndReplace(query?: {
    $where?: StaticProps<ExtendType<Omit<SchemaProps, 'prototype'>,{ ObjectId: string }>> & SQLWhereOperators<ExtendType<Omit<SchemaProps, 'prototype'>, { ObjectId: string }>, SchemaProps>,
    $replace?: StaticProps<Omit<SchemaProps, 'prototype'>>,
    $options?: UpdateMethodsOptions,
    $rules?: Omit<RulesOptions<Omit<SchemaProps, 'prototype'>>, '$upsert'>
  }): Promise<ExtendType<StaticProps<ExtendType<Omit<SchemaProps, 'prototype'>, { ObjectId: string }>>,FunctionResponse.Responses<SchemaProps>>[]> {
    var execute = await this.#execute();
    if (this.$debugMode) debugLog(`Replacing Data: ${(this.$schema as any).name} - $where: ${JSON.stringify(query?.$where)} - $replace: ${JSON.stringify(query?.$replace)} - $options: ${JSON.stringify(query?.$options)} - $rules: ${JSON.stringify(query?.$rules)}`);
    if (query && !query.$options) query.$options = {};
    return execute.update(query?.$where, {
      $set: {
        ...query?.$replace,
      } }, query?.$rules, { $upsert: true, ...query?.$options });
  };



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
  async $search(query?: {
    $where?: StaticProps<ExtendType<Omit<SchemaProps, 'prototype'>,{ ObjectId: string }>> & SQLWhereOperators<ExtendType<Omit<SchemaProps, 'prototype'>, { ObjectId: string }>, SchemaProps>,
    $options?: SearchMethodsOptions<Omit<SchemaProps, 'prototype'>>
  }): Promise<ExtendType<StaticProps<ExtendType<Omit<SchemaProps, 'prototype'>, { ObjectId: string }>>,FunctionResponse.Responses<SchemaProps>>[]> {
    var execute = await this.#execute();
    if (this.$debugMode) debugLog(`Searching Data: ${(this.$schema as any).name} - $where: ${JSON.stringify(query?.$where)} - $options: ${JSON.stringify(query?.$options)}`);
    const dataValues = await execute.search(query?.$where, query?.$options);
    const Engine = this;

    const response = (dataValues as any[]).map((data) => returnClass(this.Schema,Engine, data, [
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

    return response as any;
  };


  /**
   * Search First
   * @returns Promise<StaticProps<ExtendType<SchemaProps,{IdParam: string}>>
   * @example model.$searchFirst()
   * @async
   * @public
   * @type {Function}
   */
  async $searchFirst(): Promise<ExtendType<StaticProps<ExtendType<Omit<SchemaProps, 'prototype'>, { ObjectId: string }>>,FunctionResponse.Responses<SchemaProps>>> {
    var execute = await this.#execute();
    if (this.$debugMode) debugLog(`Searching First Data: ${(this.$schema as any).name}`);
    const dataValues = await execute.searchOne({}, {});    
    const Engine = this;

    const response = returnClass(this.Schema,Engine, dataValues, [
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
    

    return response as any;

  };


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
  async $searchOne(query?: {
    $where?: StaticProps<ExtendType<Omit<SchemaProps, 'prototype'>,{ ObjectId: string }>> & SQLWhereOperators<ExtendType<Omit<SchemaProps, 'prototype'>, { ObjectId: string }>, SchemaProps>,
    $options?: SearchMethodsOptions<Omit<SchemaProps, 'prototype'>>
  }): Promise<ExtendType<StaticProps<ExtendType<Omit<SchemaProps, 'prototype'>, { ObjectId: string }>>,FunctionResponse.Responses<SchemaProps>>> {
    var execute = await this.#execute();
    if (this.$debugMode) debugLog(`Searching One Data: ${(this.$schema as any).name} - $where: ${JSON.stringify(query?.$where)} - $options: ${JSON.stringify(query?.$options)}`);
    const dataValues = await execute.searchOne(query?.$where, query?.$options);
    const Engine = this;

    const response = returnClass(this.Schema,Engine, dataValues, [
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

    return response as any;   
  };


  /**
   * Search By Id
   * @param id ID
   * @returns Promise<StaticProps<ExtendType<SchemaProps,{<IdParam>:string}>>
   * @example model.$searchById('1')
   * @async
   * @public
   * @type {Function}
   */
  async $searchById(id: number): Promise<ExtendType<StaticProps<ExtendType<Omit<SchemaProps, 'prototype'>, { ObjectId: string }>>,FunctionResponse.Responses<SchemaProps>>> {
    var idColumn = Reflect.getMetadata(`autoIncrement-${(this.$schema as any).name}`, this.$schema as any) || '';
    var execute = await this.#execute();
    if (!id) throw new ErrorHandler('ID Not Found, Fill ID.', '#FF0000');
    if (idColumn == '') throw new ErrorHandler('ID Column Not Found, Check Schema.', '#FF0000');
    if (this.$debugMode) debugLog(`Searching By ID: ${(this.$schema as any).name} - $where: { ${idColumn}: ${id} }`);
    const dataValues = await execute.searchOne({ [idColumn]: id });
    const Engine = this;
    const response = returnClass(this.Schema,Engine, dataValues, [
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

    return response as any;
  };


  /**
   * Search By Ids
   * @param ids Nexorm IDs
   * @returns Promise<StaticProps<ExtendType<SchemaProps,{IdParam: string}>>
   * @example model.$searchByIds(['1','2','3'])
   * @async
   * @public
   * @type {Function}
   */
  async $searchByIds(ids: number[]): Promise<ExtendType<StaticProps<ExtendType<Omit<SchemaProps, 'prototype'>, { ObjectId: string }>>,FunctionResponse.Responses<SchemaProps>>[]> {
    var idColumn = Reflect.getMetadata(`autoIncrement-${(this.$schema as any).name}`, this.$schema as any) || '';
    var execute = await this.#execute();
    if (idColumn == '') throw new ErrorHandler('ID Column Not Found, Check Schema.', '#FF0000');
    if (!ids || ids.length == 0) throw new ErrorHandler('IDs Not Found, Fill IDs.', '#FF0000');
    if (ids.length > 1000) throw new ErrorHandler('IDs Too Many, Max 1000 IDs.', '#FF0000');
    if (this.$debugMode) debugLog(`Searching By IDs: ${(this.$schema as any).name} - $where: { ${idColumn} { $in: ${ids} } }`);
    const dataValues = await execute.search({ [idColumn]: { $in: ids } });
    const Engine = this;
    const response = (dataValues as any[]).map((data) => returnClass(this.Schema,Engine, data, [
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

    return response as any;
  };



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
  async $searchAndCount(query?: {
    $where?: StaticProps<ExtendType<Omit<SchemaProps, 'prototype'>,{ ObjectId: string }>> & SQLWhereOperators<ExtendType<Omit<SchemaProps, 'prototype'>, { ObjectId: string }>, SchemaProps>,
  }): Promise<[
    ExtendType<StaticProps<ExtendType<Omit<SchemaProps, 'prototype'>, { ObjectId: string }>>,FunctionResponse.Responses<SchemaProps>>[],
    number
  ]> {
    var execute = await this.#execute();
    if (this.$debugMode) debugLog(`Searching And Counting Data: ${(this.$schema as any).name} - $where: ${JSON.stringify(query?.$where)}`);

    var counts = await execute.count(query?.$where, {});
    var dataValue = await execute.search(query?.$where, {});
    const Engine = this;
    const response = (dataValue as any[]).map((data) => returnClass(this.Schema,Engine, data, [
      '$clone', '$delete',
      '$expiresAt', '$get',
      '$isDeleted', '$isModified',
      '$isValid', '$refresh',
      '$reload', '$restore',
      '$role', '$save', '$set',
      '$softDelete', '$toJSON',
      '$toObject', '$toStringify',
      '$update'
    ])) as any;

    return [response, counts];
  };



  /**
   * Create
   * @param data Data
   * @returns Promise<StaticProps<ExtendType<SchemaProps,{IdParam: string}>>
   * @example model.$create({ name: 'John' })
   * @async
   * @public
   * @type {Function}
   */
  async $everything(): Promise<ExtendType<StaticProps<ExtendType<Omit<SchemaProps, 'prototype'>, { ObjectId: string }>>,FunctionResponse.Responses<SchemaProps>>[]> {
    var execute = await this.#execute();
    if (this.$debugMode) debugLog(`Searching Everything: ${(this.$schema as any).name}`);
    const dataValues = await execute.search({}, {});
    const Engine = this;
    
    const response = (dataValues as any[]).map((data) => returnClass(this.Schema,Engine, data, [
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

    return response as any;
  };


  /**
   * Build
   * @param data Data
   * @returns Promise<StaticProps<ExtendType<SchemaProps,{IdParam: string}>>
   * @example model.$build({ name: 'John' })
   * @async
   * @public
   * @type {Function}
   */
  async $build(query?: {
    $data?: BuildProps<ExtendType<Omit<SchemaProps, 'prototype'>, { ObjectId: string }>>,
    $options?: BuildMethodsOptions<SchemaProps>
}): Promise<ExtendType<StaticProps<ExtendType<Omit<SchemaProps, 'prototype'>, { ObjectId: string }>>,FunctionResponse.Responses<SchemaProps>>> {
    var execute = await this.#execute();
    if (this.$debugMode) debugLog(`Building Data: ${(this.$schema as any).name} - Data: ${JSON.stringify(query?.$data)} - $options: ${JSON.stringify(query?.$options)}`);
    if (query && !query.$options) query.$options = { $hooks: true };
    if (query && !query.$data) throw new ErrorHandler('Data Not Found, Fill Data.', '#FF0000');
    const dataValues = await execute.build(query?.$data, query?.$options);
    const Engine = this;
    const response = returnClass(this.Schema,Engine, dataValues, [
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

    return response as any;
  };


  /**
   * Build Many
   * @param data Data
   * @returns Promise<StaticProps<ExtendType<SchemaProps,{IdParam: string}>>
   * @example model.$buildMany([{ name: 'John' }, { name: 'Doe' }])
   * @async
   * @public
   * @type {Function}
   */
  async $buildMany(query?: {
    $data: BuildProps<ExtendType<Omit<SchemaProps, 'prototype'>, { ObjectId: string }>>[],
    $options?: BuildMethodsOptions<SchemaProps>
  }): Promise<ExtendType<StaticProps<ExtendType<Omit<SchemaProps, 'prototype'>, { ObjectId: string }>>,FunctionResponse.Responses<SchemaProps>>[]> {
    var execute = await this.#execute();
    if (this.$debugMode) debugLog(`Building Many Data: ${(this.$schema as any).name} - Data: ${JSON.stringify(query?.$data)} - $options: ${JSON.stringify(query?.$options)}`);
    if (query && !query.$options) query.$options = { $hooks: true };
    if (query && !query.$data) throw new ErrorHandler('Data Not Found, Fill Data.', '#FF0000');
    const dataValues = await execute.buildMany(query?.$data,query?.$options);
    const Engine = this;
    const response = (dataValues as any[]).map((data) => returnClass(this.Schema,Engine, data, [
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

    return response as any;
  };


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
  async $update(query?: {
    $where?: StaticProps<ExtendType<Omit<SchemaProps, 'prototype'>,{ ObjectId: string }>> & SQLWhereOperators<ExtendType<Omit<SchemaProps, 'prototype'>, { ObjectId: string }>, SchemaProps>,
    $update?: UpdateOptions<Omit<SchemaProps, 'prototype'>>,
    $rules?: RulesOptions<StaticProps<Omit<SchemaProps, 'prototype'>>>,
    $options?: UpdateMethodsOptions
  }): Promise<ExtendType<StaticProps<ExtendType<Omit<SchemaProps, 'prototype'>, { ObjectId: string }>>,FunctionResponse.Responses<SchemaProps>>> {
    var execute = await this.#execute();
    if (this.$debugMode) debugLog(`Updating Data: ${(this.$schema as any).name} - $where: ${JSON.stringify(query?.$where)} - $update: ${JSON.stringify(query?.$update)} - $options: ${JSON.stringify(query?.$options)} - $rules: ${JSON.stringify(query?.$rules)}`);
    if (query && !query.$options) query.$options = {};
    const dataValues = await execute.update(query?.$where, query?.$update, query?.$rules, query?.$options);
    const Engine = this;
    const response = returnClass(this.Schema,Engine, dataValues, [
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

    return response as any;
  };


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
  async $updateMany(query?: {
    $where?: StaticProps<ExtendType<Omit<SchemaProps, 'prototype'>,{ ObjectId: string }>> & SQLWhereOperators<ExtendType<Omit<SchemaProps, 'prototype'>, { ObjectId: string }>, SchemaProps>,
    $update?: UpdateOptions<Omit<SchemaProps, 'prototype'>>,
    $rules?: RulesOptions<StaticProps<Omit<SchemaProps, 'prototype'>>>,
    $options?: Omit<UpdateMethodsOptions, '$multi'>
  }): Promise<ExtendType<StaticProps<ExtendType<Omit<SchemaProps, 'prototype'>, { ObjectId: string }>>,FunctionResponse.Responses<SchemaProps>>[]> {
    var execute = await this.#execute();
    if (this.$debugMode) debugLog(`Updating Many Data: ${(this.$schema as any).name} - $where: ${JSON.stringify(query?.$where)} - $update: ${JSON.stringify(query?.$update)} - $options: ${JSON.stringify(query?.$options)} - $rules: ${JSON.stringify(query?.$rules)}`);
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
    $where: StaticProps<ExtendType<Omit<SchemaProps, 'prototype'>,{ ObjectId: string }>> & SQLWhereOperators<ExtendType<Omit<SchemaProps, 'prototype'>, { ObjectId: string }>, SchemaProps>,
    $options?: DeleteMethodsOptions<Omit<SchemaProps, 'prototype'>>
  }): Promise<boolean> {
    if (typeof query?.$options?.$force == 'boolean') query.$options.$force = true;
    var execute = await this.#execute();
    if (this.$debugMode) debugLog(`Deleting Data: ${(this.$schema as any).name} - $where: ${JSON.stringify(query?.$where)} - $options: ${JSON.stringify(query?.$options)}`);
    return execute.delete(query?.$where, query?.$options, false) as Promise<boolean>;
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
    $where: StaticProps<ExtendType<Omit<SchemaProps, 'prototype'>,{ ObjectId: string }>> & SQLWhereOperators<ExtendType<Omit<SchemaProps, 'prototype'>, { ObjectId: string }>, SchemaProps>,
    $options?: DeleteMethodsOptions<Omit<SchemaProps, 'prototype'>>
  }): Promise<number> {
    if (typeof query?.$options?.$force == 'boolean') query.$options.$force = true;
    var execute = await this.#execute();
    if (this.$debugMode) debugLog(`Deleting Many Data: ${(this.$schema as any).name} - $where: ${JSON.stringify(query?.$where)} - $options: ${JSON.stringify(query?.$options)}`);
    return execute.delete(query?.$where, query?.$options, true) as Promise<number>;
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
    $where: StaticProps<ExtendType<Omit<SchemaProps, 'prototype'>,{ ObjectId: string }>> & SQLWhereOperators<ExtendType<Omit<SchemaProps, 'prototype'>, { ObjectId: string }>, SchemaProps>,
    $options?: Omit<DeleteMethodsOptions<Omit<SchemaProps, 'prototype'>>, '$force'>
  }): Promise<boolean> {
    var execute = await this.#execute();
    if (this.$debugMode) debugLog(`Soft Deleting Data: ${(this.$schema as any).name} - $where: ${JSON.stringify(query?.$where)} - $options: ${JSON.stringify(query?.$options)}`);
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
    $where: StaticProps<ExtendType<Omit<SchemaProps, 'prototype'>,{ ObjectId: string }>> & SQLWhereOperators<ExtendType<Omit<SchemaProps, 'prototype'>, { ObjectId: string }>, SchemaProps>,
    $options?: Omit<DeleteMethodsOptions<Omit<SchemaProps, 'prototype'>>, '$force'>
  }): Promise<number> {
    var execute = await this.#execute();
    if (this.$debugMode) debugLog(`Soft Deleting Many Data: ${(this.$schema as any).name} - $where: ${JSON.stringify(query?.$where)} - $options: ${JSON.stringify(query?.$options)}`);
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
    $where: StaticProps<ExtendType<Omit<SchemaProps, 'prototype'>,{ ObjectId: string }>> & SQLWhereOperators<ExtendType<Omit<SchemaProps, 'prototype'>, { ObjectId: string }>, SchemaProps>,
    $options?: RestoreMethodsOptions
  }): Promise<void> {
    var execute = await this.#execute();
    if (this.$debugMode) debugLog(`Restoring Data: ${(this.$schema as any).name} - $where: ${JSON.stringify(query?.$where)} - $options: ${JSON.stringify(query?.$options)}`);
    return execute.restore(query?.$where, query?.$options);
  }



  async $count(query?: {
    $where?: StaticProps<ExtendType<Omit<SchemaProps, 'prototype'>,{ ObjectId: string }>> & SQLWhereOperators<ExtendType<Omit<SchemaProps, 'prototype'>, { ObjectId: string }>, SchemaProps>,
    $options?: CountMethodsOptions<ExtendType<Omit<SchemaProps, 'prototype'>, { ObjectId: string }>>
  }): Promise<number> {
    var execute = await this.#execute();
    if (this.$debugMode) debugLog(`Counting Data: ${(this.$schema as any).name} - $where: ${JSON.stringify(query?.$where)} - $options: ${JSON.stringify(query?.$options)}`);
    return execute.count(query?.$where);
  };


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
  async $upsert(query: {
    $where: StaticProps<ExtendType<Omit<SchemaProps, 'prototype'>,{ ObjectId: string }>> & SQLWhereOperators<ExtendType<Omit<SchemaProps, 'prototype'>, { ObjectId: string }>, SchemaProps>,
    $update: UpdateOptions<Omit<SchemaProps, 'prototype'>>,
    $rules?: RulesOptions<StaticProps<Omit<SchemaProps, 'prototype'>>>,
    $options?: Omit<UpdateMethodsOptions, '$upsert'>
  }): Promise<ExtendType<StaticProps<ExtendType<Omit<SchemaProps, 'prototype'>, { ObjectId: string }>>,FunctionResponse.Responses<SchemaProps>>> {
    var execute = await this.#execute();
    if (this.$debugMode) debugLog(`Upserting Data: ${(this.$schema as any).name} - $where: ${JSON.stringify(query.$where)} - $update: ${JSON.stringify(query.$update)} - $options: ${JSON.stringify(query.$options)} - $rules: ${JSON.stringify(query.$rules)}`);
    const dataValues = await execute.update(query.$where, query.$update, query.$rules, { $upsert: true, ...query.$options });
    const Engine = this;
    const response = returnClass(this.Schema,Engine, dataValues, [
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

    return response as any;
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
    if (this.$debugMode) debugLog(`Querying Data: ${(this.$schema as any).name} - Query: ${query}`);
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
    $field: (keyof ExtendType<Omit<SchemaProps, 'prototype'>,{ ObjectId: string }>)[],
    $where?: StaticProps<ExtendType<Omit<SchemaProps, 'prototype'>,{ ObjectId: string }>> & SQLWhereOperators<ExtendType<Omit<SchemaProps, 'prototype'>, { ObjectId: string }>, SchemaProps>,
    $options?: Omit<UpdateMethodsOptions, '$attributes'>
  }): Promise<any[][]> {
    var execute = await this.#execute();
    if (this.$debugMode) debugLog(`Distinct Data: ${(this.$schema as any).name} - $field: ${JSON.stringify(query.$field)} - $where: ${JSON.stringify(query.$where)} - $options: ${JSON.stringify(query.$options)}`);
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
    if (this.$debugMode) debugLog(`Truncating Data: ${(this.$schema as any).name}`);
    return execute.truncate();
  };


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
      values: BuildProps<ExtendType<Omit<SchemaProps, 'prototype'>, { ObjectId: string }>>,
      fields: BuildProps<ExtendType<Omit<SchemaProps, 'prototype'>, { ObjectId: string }>>[]
    ) => void) => {
      this.$model?.beforeCreate((instance: any, options: any) => {
        if (this.$debugMode) debugLog(`Before Create Hook: ${(this.$schema as any).name} - Data: ${JSON.stringify(instance.dataValues)} - Fields: ${JSON.stringify(options.fields)}`);
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
      values: BuildProps<ExtendType<Omit<SchemaProps, 'prototype'>, { ObjectId: string }>>,
      fields: BuildProps<ExtendType<Omit<SchemaProps, 'prototype'>, { ObjectId: string }>>[]
    ) => void) => {
      this.$model?.afterCreate((instance: any, options: any) => {
        if (this.$debugMode) debugLog(`After Create Hook: ${(this.$schema as any).name} - Data: ${JSON.stringify(instance.dataValues)} - Fields: ${JSON.stringify(options.fields)}`);
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
      values: BuildProps<ExtendType<Omit<SchemaProps, 'prototype'>, { ObjectId: string }>>,
      fields: BuildProps<ExtendType<Omit<SchemaProps, 'prototype'>, { ObjectId: string }>>[]
    ) => void) => {
      this.$model?.afterUpdate((instance: any, options: any) => {
        if (this.$debugMode) debugLog(`After Update Hook: ${(this.$schema as any).name} - Data: ${JSON.stringify(instance.dataValues)} - Fields: ${JSON.stringify(options.fields)}`);
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
      values: BuildProps<ExtendType<Omit<SchemaProps, 'prototype'>, { ObjectId: string }>>,
    ) => void) => {
      this.$model?.beforeDestroy((instance: any, options: any) => {
        if (this.$debugMode) debugLog(`Before Destroy Hook: ${(this.$schema as any).name} - Data: ${JSON.stringify(instance.dataValues)}`);
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
      values: BuildProps<ExtendType<Omit<SchemaProps, 'prototype'>, { ObjectId: string }>>,
    ) => void) => {
      this.$model?.afterDestroy((instance: any, options: any) => {
        if (this.$debugMode) debugLog(`After Destroy Hook: ${(this.$schema as any).name} - Data: ${JSON.stringify(instance.dataValues)}`);
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
      values: BuildProps<ExtendType<Omit<SchemaProps, 'prototype'>, { ObjectId: string }>>,
      fields: BuildProps<ExtendType<Omit<SchemaProps, 'prototype'>, { ObjectId: string }>>[]
    ) => void) => {
      this.$model?.beforeUpdate((instance: any, options: any) => {
        if (this.$debugMode) debugLog(`Before Update Hook: ${(this.$schema as any).name} - Data: ${JSON.stringify(instance.dataValues)} - Fields: ${JSON.stringify(options.fields)}`);
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
      values: BuildProps<ExtendType<Omit<SchemaProps, 'prototype'>, { ObjectId: string }>>,
      fields: BuildProps<ExtendType<Omit<SchemaProps, 'prototype'>, { ObjectId: string }>>[]
    ) => void) => {
      this.$model?.beforeSave((instance: any, options: any) => {
        if (this.$debugMode) debugLog(`Before Save Hook: ${(this.$schema as any).name} - Data: ${JSON.stringify(instance.dataValues)} - Fields: ${JSON.stringify(options.fields)}`);
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
      values: BuildProps<ExtendType<Omit<SchemaProps, 'prototype'>, { ObjectId: string }>>,
      fields: BuildProps<ExtendType<Omit<SchemaProps, 'prototype'>, { ObjectId: string }>>[]
    ) => void) => {
      this.$model?.afterSave((instance: any, options: any) => {
        if (this.$debugMode) debugLog(`After Save Hook: ${(this.$schema as any).name} - Data: ${JSON.stringify(instance.dataValues)} - Fields: ${JSON.stringify(options.fields)}`);
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
      values: BuildProps<ExtendType<Omit<SchemaProps, 'prototype'>, { ObjectId: string }>>[],
      fields: BuildProps<ExtendType<Omit<SchemaProps, 'prototype'>, { ObjectId: string }>>[]
    ) => void) => {
      this.$model?.beforeBulkCreate((instance: any, options: any) => {
        if (this.$debugMode) debugLog(`Before Bulk Create Hook: ${(this.$schema as any).name} - Data: ${JSON.stringify(instance)} - Fields: ${JSON.stringify(options.fields)}`);
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
      values: BuildProps<ExtendType<Omit<SchemaProps, 'prototype'>, { ObjectId: string }>>[],
      fields: BuildProps<ExtendType<Omit<SchemaProps, 'prototype'>, { ObjectId: string }>>[]
    ) => void) => {
      this.$model?.afterBulkCreate((instance: any, options: any) => {
        if (this.$debugMode) debugLog(`After Bulk Create Hook: ${(this.$schema as any).name} - Data: ${JSON.stringify(instance)} - Fields: ${JSON.stringify(options.fields)}`);
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
      fields: BuildProps<ExtendType<Omit<SchemaProps, 'prototype'>, { ObjectId: string }>>[]
    ) => void) => {
      this.$model?.beforeBulkUpdate((options: any) => {
        if (this.$debugMode) debugLog(`Before Bulk Update Hook: ${(this.$schema as any).name} - Fields: ${JSON.stringify(options.fields)}`);
        callback((this.$schema as any).name as string, options.fields as any);
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
      fields: BuildProps<ExtendType<Omit<SchemaProps, 'prototype'>, { ObjectId: string }>>[]
    ) => void) => {
      this.$model?.afterBulkUpdate((options: any) => {
        if (this.$debugMode) debugLog(`After Bulk Update Hook: ${(this.$schema as any).name} - Fields: ${JSON.stringify(options.fields)}`);
        callback((this.$schema as any).name as string, options.fields as any);
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
      fields: BuildProps<ExtendType<Omit<SchemaProps, 'prototype'>, { ObjectId: string }>>[]
    ) => void) => {
      this.$model?.beforeBulkDestroy((options: any) => {
        if (this.$debugMode) debugLog(`Before Bulk Destroy Hook: ${(this.$schema as any).name} - Fields: ${JSON.stringify(options.fields)}`);
        callback((this.$schema as any).name as string, options.fields as any);
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
        if (this.$debugMode) debugLog(`After Bulk Destroy Hook: ${(this.$schema as any).name}`);
        callback((this.$schema as any).name as string);
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
      values: BuildProps<ExtendType<Omit<SchemaProps, 'prototype'>, { ObjectId: string }>>,
    ) => void) => {
      this.$model?.beforeFind((options: any) => {
        if (this.$debugMode) debugLog(`Before Find Hook: ${(this.$schema as any).name} - Data: ${JSON.stringify(options.where)}`);
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
      values: BuildProps<ExtendType<Omit<SchemaProps, 'prototype'>, { ObjectId: string }>>,
    ) => void) => {
      this.$model?.afterFind((instance: any, options: any) => {
        if (this.$debugMode) debugLog(`After Find Hook: ${(this.$schema as any).name} - Data: ${JSON.stringify(instance.dataValues)}`);
        callback(instance.dataValues);
      });
    }

  };





  async #execute() {
    var configData = await readConfig().catch((err) => { return undefined; });
    var providerName = Reflect.getMetadata(`databaseName-${(this.$schema as any).name}`, this.$schema) || 'nexorm';    

    var config = configData?.find((config) => config.$provider === providerName);
    if (!config || !configData) throw new ErrorHandler('Nexorm Config Not Found', '#FF0000');
    this.$config = config;

    var model = await getModel(providerName, (this.$schema as any).name).catch((err)=> { return undefined; });
    if (!model) throw new ErrorHandler(`Model Not Found: ${(this.$schema as any).name}, Make Sure $entities Section Is Correct`, '#FF0000');
    if (this.$debugMode) debugLog(`Executing Model: ${(this.$schema as any).name} - Provider: ${providerName}`);
    this.$model = model;
    

    return {

      search: async (filter?: any, options?: any) => {
        return await search(this.$model, filter, options, this.$cache, this.$config) || [];
      },

      searchOne: async (filter?: any, options?: any) => {
        return await searchOne(this.$model, filter, options, this.$cache, this.$config) || null;
      },

      build: async (data: any, options: any) => {
        return await build(this.$model, data, options) as any;
      },

      buildMany: async (data: any, options: any) => {
        return await buildMany(this.$model, data, options) as any;
      },

      update: async (where: any, update: any, rules: any, options: any) => {
        return await updateOne(this.$model, where, update, rules, options, this.$schema);
      },

      delete: async (where: any, options: any, multiple: boolean) => {
        if (multiple) return await deleteMany(this.$model, where, options);
        return (await deleteMany(this.$model, where, options) ? true : false);
      },

      restore: async (where: any, options: any) => {
        return await restore(this.$model, where, options);
      },

      count: async (where?: any, options?: any) => {
        return await count(this.$model, where, options)
      },

      query: async (query: string) => {
        return await this.$model?.sequelize?.query(query);
      },

      distinct: async (field: string[], where: any, options: any) => {
        return await distinct(this.$model, field, where, options, this.$cache, this.$config);
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


type Properties = '$toObject' | '$toJSON' | '$toStringify' | '$save' | '$role' | '$set' | '$get' | '$isModified' | '$isValid' | '$isDeleted' | '$refresh' | '$reload' | '$delete' | '$softDelete' | '$clone' | '$expiresAt' | '$update' | '$restore';

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


function returnClass<SchemaProps>(
  schema: SchemaProps,
  Engine: ModelEngine<SchemaProps>, 
  dataValues?: Record<string, any>,
  loadProperties?: Properties[]
) {
  const DynamicClass = class {
    #isModified: boolean = false;
    #isValid: boolean = true;
    #isDeleted: boolean = false;
    
    constructor(dataValue?: Record<string, any>) {
      
      if (dataValue) {
        Object.keys(dataValue as any)
          .filter((key) => !['length', 'name', 'prototype'].includes(key))
          .forEach((key) => {
            Object.defineProperty(this, key, {
              value: dataValue[key],
              enumerable: true,
              configurable: (String(key) !== 'ObjectId'),
              writable: (String(key) !== 'ObjectId')
          });
        });
      };


      const availableMethods: Record<Properties, Function> = {

        $toObject: () => {
          return Object.assign({}, this) as StaticProps<Omit<any, 'prototype'>>;
        },

        $toJSON: () => {
          try {
            return JSON.parse(JSON.stringify(Object.assign({}, this)));
          } catch (error) {
            return null;
          }
        },

        $toStringify: () => {
          try {
            return JSON.stringify(Object.assign({}, this));
          } catch (error) {
            return null;
          }
        },

        $save: async(dataValue?: BuildProps<Omit<SchemaProps, 'prototype'>>) => {
          if (Engine.$debugMode) debugLog(`Saving Data: ${(Engine.$schema as any).name} - dataValue: ${JSON.stringify(dataValue)}`);
          this.#isModified = true;
          return await Engine.$update({
            $where: { ObjectId: (this as any)?.ObjectId },
            $update: { $set: { ...Object.assign({}, this), ...dataValue } },
            $options: { $upsert: true }
          });
        },

        $clone: () => {
          return returnClass(schema, Engine, Object.assign({}, this), loadProperties);
        },

        $softDelete: async() => { 
          if (Engine.$debugMode) debugLog(`Soft Deleting Data: ${(Engine.$schema as any).name} - ObjectId: ${(this as any)?.ObjectId}`);
          if ((this as any)?.ObjectId === undefined) {
            throw new ErrorHandler('Data not found, please check the ObjectId', '#FF0000');
          }
          this.#isDeleted = true;
          return await Engine.$softDelete({ $where: { ObjectId: (this as any)?.ObjectId } });
        },

        $delete: async() => {
          if (Engine.$debugMode) debugLog(`Deleting Data: ${(Engine.$schema as any).name} - ObjectId: ${(this as any)?.ObjectId}`);
          if ((this as any)?.ObjectId === undefined) {
            throw new ErrorHandler('Data not found, please check the ObjectId', '#FF0000');
          }
          this.#isDeleted = true;
          return await Engine.$delete({ $where: { ObjectId: (this as any)?.ObjectId }, $options: { $force: true } });
        },

        $get: (property: keyof Omit<any, 'prototype'>) => {
          if (property in this) {
            return (this as any)[property];
          };
          return null;
        },

        $set: (property: keyof Omit<any, 'prototype'>, value: any) => {
          if (property in this) {
            (this as any)[property] = value;
            this.#isModified = true;
            return (this as any)[property];
          };
          return null;
        },

        $expiresAt: async(uniqueCronName: string, spec: string,options?:{ $force?: boolean, $continuity?: boolean }) => {
          if (!spec) throw new ErrorHandler('Cron Expression Is Required', '#FF0000');

          if ((this as any)?.ObjectId === undefined) {
            throw new ErrorHandler('Data not found, please check the ObjectId', '#FF0000');
          }

          scheduleJob(uniqueCronName,spec, async() => {
            if (Engine.$debugMode) debugLog(`Running Expiration Job: ${(Engine.$schema as any).name} - CronName: ${uniqueCronName} - Cron: ${spec}`);
            if (dataValue) {
              if (Engine.$debugMode) debugLog(`Expiration Job Data: ${(Engine.$schema as any).name} - Data: ${JSON.stringify(dataValue)}`);
              this.#isDeleted = true;
              await Engine.$delete({ $where: { ObjectId: (this as any)?.ObjectId }, $options: { $force: (options?.$force || false) } });
            };
            if (Engine.$debugMode) debugLog(`Expiration Job Completed: ${(Engine.$schema as any).name} - CronName: ${uniqueCronName} - Cron: ${spec}`);

            if (!options?.$continuity) {
            const job = scheduledJobs[uniqueCronName];
            if (job) {
              job.cancel();
              delete scheduledJobs[uniqueCronName];
            };
          };

          });

          return {
            $cancel: () => {
              const job = scheduledJobs[uniqueCronName];
              if (job) {
                job.cancel();
                delete scheduledJobs[uniqueCronName];
                if (Engine.$debugMode) debugLog(`Canceled Expiration Job: ${(Engine.$schema as any).name} - CronName: ${uniqueCronName}`);
              };

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

        $refresh: async() => {
          if (Engine.$debugMode) debugLog(`Reloading Data: ${(Engine.$schema as any).name}`);
          if ((this as any)?.ObjectId === undefined) {
            throw new ErrorHandler('Data not found, please check the ObjectId', '#FF0000');
          }
          var reloadedData = await Engine.$searchOne({ $where: { ObjectId: (this as any)?.ObjectId } });
          if (reloadedData) {
            Object.assign(this, reloadedData);
            return this;
          }
          return null;
        },

        $reload: async(keys: string[]) => {
          if (Engine.$debugMode) debugLog(`Reloading Data: ${(Engine.$schema as any).name}`);
          if ((this as any)?.ObjectId === undefined) {
            throw new ErrorHandler('Data not found, please check the ObjectId', '#FF0000');
          }
          var reloadedData = await Engine.$searchOne({ $where: { ObjectId: (this as any)?.ObjectId } });
          if (!reloadedData) return null;

          for (var key of keys) {
            if (reloadedData && reloadedData[key] !== undefined) {
              (this as any)[key] = reloadedData[key];
            }
          }

          return this;
        },

        $role: (role: string) => {
          if (!dataValues) return null;
          var getRoles = Reflect.getMetadata(`roles-${(Engine.$schema as any).name}`, Engine.$schema as any) || {};
          if (!getRoles[role]) {
            return { ...dataValues };
          }
          
          var roles = Object.entries(getRoles[role]);
          
          var roleResponse = { } as Record<string, any>;
          for (var [key, value] of roles) {
            if (value && dataValues[key]) roleResponse[key] = dataValues[key];
          }
          return roleResponse;
        },

        $update: async(updateQuery: UpdateOptions<Omit<SchemaProps, 'prototype'>>) => {
          if (Engine.$debugMode) debugLog(`Updating Data: ${(Engine.$schema as any).name} - Update Query: ${JSON.stringify(updateQuery)}`);
          if ((this as any)?.ObjectId === undefined) {
            throw new ErrorHandler('Data not found, please check the ObjectId', '#FF0000');
          }
          return await Engine.$update({
            $where: { ObjectId: (this as any).ObjectId },
            $update: updateQuery, 
          });
        },

        $restore: async() => {
          if (Engine.$debugMode) debugLog(`Restoring Data: ${(Engine.$schema as any).name} - ObjectId: ${(this as any)?.ObjectId}`);
          if ((this as any)?.ObjectId === undefined) {
            throw new ErrorHandler('Data not found, please check the ObjectId', '#FF0000');
          }
          return await Engine.$restore({ $where: { ObjectId: (this as any)?.ObjectId } });
        },
      
      };


      if (loadProperties && loadProperties.length > 0) {
        loadProperties.forEach((property) => {
          const method = availableMethods[property];
          if (method) {
            if (Engine.$debugMode) debugLog(`Defining Method: ${(Engine.$schema as any).name} - Method: ${property}`);
            
            Object.defineProperty(this, property, {
              value: method,
              enumerable: false,
              configurable: false,
              writable: false,
            });
          }
        });
      }

    };    

  };

  Object.defineProperty(DynamicClass, 'name', { value: (Engine.$schema as any).name });

  return new DynamicClass(dataValues) as unknown as typeof DynamicClass;
};