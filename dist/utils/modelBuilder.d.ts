import { Sequelize } from 'sequelize';
export declare function getModel(providerName: string, modelName: string): Promise<any>;
export declare function getTarget(providerName: string, modelName: string): Promise<{
    providerName: string;
    model: any;
    schema: any;
    $schema: any;
}>;
export declare function getProviderModels(providerName: string): Promise<{
    providerName: string;
    model: any;
    schema: any;
    $schema: any;
}[]>;
export declare function initializeBuilder(providerName: string, model: any, sequelize: Sequelize): Promise<unknown>;
export declare function Schema(target: any): void;
export declare function createTable(model: string, sequelize: Sequelize, timestamps: {
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string;
}, force: boolean, paranoid: boolean, schema: any, dataName: string, debug: boolean, target: any): Promise<unknown>;
export declare function loadRelationships(model: string, sequelize: Sequelize, schema: any, ModelSchema: any, providerName: string): Promise<void>;
export declare function loadIndexed(model: string, sequelize: Sequelize, schema: any): Promise<void>;
export type DatabaseTypeMap = {
    mysql: {
        [key: string]: any;
    };
    postgres: {
        [key: string]: any;
    };
    sqlite: {
        [key: string]: any;
    };
    mariadb: {
        [key: string]: any;
    };
    mssql: {
        [key: string]: any;
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
}
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
}
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
}
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
}
