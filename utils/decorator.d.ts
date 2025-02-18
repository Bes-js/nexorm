import 'reflect-metadata';
import crypto from 'node:crypto';
import CacheManager from './util/cacheManager';
import { NexormConfig, NexormConfigType } from '../types/config';
/**
 * @name AllowNull
 * @description This decorator is used to define a column in the database.
 * @example @AllowNull
 * @public
 * @returns {void}
 */
export declare function AllowNull(target: any, key: string): void;
/**
 * @name UUID
 * @description This decorator is used to define a column in the database.
 * @example @UUID(4)
 * @public
 * @param v
 * @returns {Function}
 */
export declare function UUID(v?: 1 | 4 | 6 | 7 | {
    v1?: boolean;
    v3?: {
        namespace: string;
        name: string;
    };
    v4?: boolean;
    v5?: {
        namespace: string;
        name: string;
    };
    v6?: boolean;
    v7?: boolean;
}): Function;
/**
 * @name Enum
 * @description This decorator is used to define a column in the database.
 * @example @Enum
 * @public
 * @param values
 * @returns {Function}
 */
export declare function Enum(values: any[]): Function;
/**
 * @name AutoIncrement
 * @description This decorator is used to define a column in the database.
 * @example @AutoIncrement
 * @public
 * @returns {void}
 */
export declare function AutoIncrement(target: any, key: string): void;
/**
 * @name Default
 * @description This decorator is used to define a column in the database.
 * @example @Default
 * @public
 * @param value
 * @returns {Function}
 */
export declare function Default(value: any): Function;
/**
 * @name Required
 * @description This decorator is used to define a column in the database.
 * @example @Required
 * @public
 * @returns {void}
 */
export declare function Required(target: any, key: string): void;
/**
 * @name Unique
 * @description This decorator is used to define a column in the database.
 * @example @Unique
 * @public
 * @returns {void}
 */
export declare function Unique(target: any, key: string): void;
/**
 * @name Index
 * @description This decorator is used to define a column in the database.
 * @example @Index
 * @public
 * @returns {void}
 */
export declare function Index(target: any, key: string): void;
/**
 * @name PrimaryKey
 * @description This decorator is used to define a column in the database.
 * @example @PrimaryKey
 * @public
 * @returns {void}
 */
export declare function PrimaryKey(target: any, key: string): void;
/**
 * @name Comment
 * @description This decorator is used to define a column in the database.
 * @example @Comment
 * @public
 * @param comment
 * @returns {Function}
 */
export declare function Comment(comment: string): Function;
/**
 * @name Hash
 * @description This decorator is used to define a column in the database.
 * @example @Hash
 * @public
 * @param method
 * @param digest
 * @returns {Function}
 */
export declare function Hash(method: string, digest?: crypto.BinaryToTextEncoding): Function;
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
export declare function Encrypt(method: string, cipherKey: string, iv: string): Function;
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
export declare function Decrypt(method: string, cipherKey: string, iv: string): Function;
/**
 * @name Reference
 * @description This decorator is used to define a column in the database.
 * @example @Reference
 * @public
 * @param value
 * @returns {Function}
 */
export declare function Reference(value: {
    model: string | string[];
    key: string;
}): Function;
export declare function Column(target: any, key: any): void;
export declare function Force(target: any): void;
export declare function Paranoid(target: any): void;
export declare function Timestamps(target: any): void;
export declare function Debug(target: any): void;
export declare function Provider(providerName: string): (target: any) => void;
export declare function Schema(target: any): void;
type ExtendType<T, U> = T & U;
type ExtractPrimitiveType<T> = T extends StringConstructor | string ? string | null : T extends (NumberConstructor | number) ? number | null : T extends (BigIntConstructor | bigint) ? number | null : T extends (BooleanConstructor | boolean) ? boolean | null : T extends (DateConstructor | Date) ? Date | null : T extends (BufferConstructor | Buffer) ? Buffer | null : T extends ArrayConstructor ? Array<any> : T extends (StringConstructor[] | string[]) ? string[] | null : T extends (NumberConstructor[] | number[]) ? number[] | null : T extends (BigIntConstructor[] | bigint[]) ? number[] | null : T extends (BufferConstructor[] | Buffer[]) ? Buffer[] | null : T extends (BooleanConstructor[] | boolean[]) ? boolean[] | null : T extends (DateConstructor[] | Date[]) ? Date[] | null : T extends (ObjectConstructor) ? object | null : T extends object ? {
    [K in keyof T]?: ExtractPrimitiveType<T[K]>;
} | null : T;
export type StaticProps<T> = {
    [K in keyof T]?: T extends {
        [key in K]?: T[K];
    } ? ExtractPrimitiveType<T[K]> | SQLOperators<T, ExtractPrimitiveType<T[K]>> : never;
} & {
    [key: string]: any;
};
export type BuildProps<T> = {
    [K in keyof T]?: T extends {
        [key in K]?: T[K];
    } ? ExtractPrimitiveType<T[K]> : never;
};
type ArrayPropsOnly<T> = Omit<{
    [K in keyof T]?: ExtractPrimitiveType<T[K]> extends (string[] | number[] | boolean[] | Date[] | any[] | null) ? ExtractPrimitiveType<T[K]> : never;
}, {
    [K in keyof T]: ExtractPrimitiveType<T[K]> extends (string[] | number[] | boolean[] | Date[] | any[] | null) ? never : K;
}[keyof T]>;
type StringPropsOnly<T> = Omit<{
    [K in keyof T]?: ExtractPrimitiveType<T[K]> extends (string | null) ? ExtractPrimitiveType<T[K]> : never;
}, {
    [K in keyof T]: ExtractPrimitiveType<T[K]> extends (string | null) ? never : K;
}[keyof T]>;
type NumberPropsOnly<T> = Omit<{
    [K in keyof T]?: ExtractPrimitiveType<T[K]> extends (number | null) ? ExtractPrimitiveType<T[K]> : never;
}, {
    [K in keyof T]: ExtractPrimitiveType<T[K]> extends (number | null) ? never : K;
}[keyof T]>;
type BooleanPropsOnly<T> = Omit<{
    [K in keyof T]?: ExtractPrimitiveType<T[K]> extends (boolean | null) ? ExtractPrimitiveType<T[K]> : never;
}, {
    [K in keyof T]: ExtractPrimitiveType<T[K]> extends (boolean | null) ? never : K;
}[keyof T]>;
type ObjectPropsOnly<T> = Omit<{
    [K in keyof T]?: ExtractPrimitiveType<T[K]> extends (object | null) ? ExtractPrimitiveType<T[K]> : never;
}, {
    [K in keyof T]: ExtractPrimitiveType<T[K]> extends (object | null) ? never : K;
}[keyof T]> & Record<string, any>;
type ParseArrayToTypeOnlyOne<T> = T extends (infer U)[] ? U : never;
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
}
type PushOptionsExtra<K> = {
    $each?: K;
    $position?: number;
    $sort?: 1 | -1 | boolean;
};
type PullOptionsExtra<K> = {
    $in?: K;
    $nin?: K;
    $position?: number;
} & (K extends number | number[] ? {
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
type PushOptions<SchemaProps> = {
    [K in keyof SchemaProps]?: PushOptionsExtra<SchemaProps[K]> | ParseArrayToTypeOnlyOne<SchemaProps[K]>;
};
type PullOptions<SchemaProps> = {
    [K in keyof SchemaProps]?: ParseArrayToTypeOnlyOne<SchemaProps[K]> | PullOptionsExtra<SchemaProps[K]>;
};
type PopOptions<SchemaProps> = {
    [K in keyof SchemaProps]?: 1 | -1 | boolean;
};
type AddToSetOptions<SchemaProps> = {
    [K in keyof SchemaProps]?: AddToSetOptionsExtra<SchemaProps[K]> | ParseArrayToTypeOnlyOne<SchemaProps[K]>;
};
type SliceOptions<SchemaProps> = {
    [K in keyof SchemaProps]?: SliceOptionsExtra<SchemaProps[K]>;
};
type ConcatOptions<SchemaProps> = {
    [K in keyof SchemaProps]?: SchemaProps[K];
};
type ToogleOptions<SchemaProps> = {
    [K in keyof SchemaProps]?: boolean;
};
type ObjectPushProps<T> = Omit<{
    [K in keyof T]?: ExtractPrimitiveType<T[K]> extends (object | null) ? ExtractPrimitiveType<T[K]> : never;
}, {
    [K in keyof T]: ExtractPrimitiveType<T[K]> extends (object | null) ? never : K;
}[keyof T]> & Record<string, string | number | boolean | {
    $each?: any[];
    $position?: number;
    $sort?: 1 | -1 | boolean;
}>;
type ObjectPopProps<T> = Omit<{
    [K in keyof T]?: ExtractPrimitiveType<T[K]> extends (object | null) ? ExtractPrimitiveType<T[K]> : never;
}, {
    [K in keyof T]: ExtractPrimitiveType<T[K]> extends (object | null) ? never : K;
}[keyof T]> & Record<string, -1 | 1 | boolean>;
type ObjectPullProps<T> = Omit<{
    [K in keyof T]?: ExtractPrimitiveType<T[K]> extends (object | null) ? ExtractPrimitiveType<T[K]> : never;
}, {
    [K in keyof T]: ExtractPrimitiveType<T[K]> extends (object | null) ? never : K;
}[keyof T]> & Record<string, string | number | boolean | {
    $in?: any[];
    $nin?: any[];
    $position?: number;
    $lte?: number;
    $gte?: number;
    $lt?: number;
    $gt?: number;
    $ne?: number;
    $eq?: number;
}>;
type ObjectAddToSetProps<T> = Omit<{
    [K in keyof T]?: ExtractPrimitiveType<T[K]> extends (object | null) ? ExtractPrimitiveType<T[K]> : never;
}, {
    [K in keyof T]: ExtractPrimitiveType<T[K]> extends (object | null) ? never : K;
}[keyof T]> & Record<string, string | number | boolean | {
    $each?: any[];
}>;
type ObjectSliceArrayProps<T> = Omit<{
    [K in keyof T]?: ExtractPrimitiveType<T[K]> extends (object | null) ? ExtractPrimitiveType<T[K]> : never;
}, {
    [K in keyof T]: ExtractPrimitiveType<T[K]> extends (object | null) ? never : K;
}[keyof T]> & Record<string, {
    $begin?: number;
    $end?: number;
}>;
type ObjectConcatProps<T> = Omit<{
    [K in keyof T]?: ExtractPrimitiveType<T[K]> extends (object | null) ? ExtractPrimitiveType<T[K]> : never;
}, {
    [K in keyof T]: ExtractPrimitiveType<T[K]> extends (object | null) ? never : K;
}[keyof T]> & Record<string, {
    $each?: any[];
    $ignoreSameValue?: boolean;
}>;
type ObjectSliceProps<T> = Omit<{
    [K in keyof T]?: ExtractPrimitiveType<T[K]> extends (object | null) ? ExtractPrimitiveType<T[K]> : never;
}, {
    [K in keyof T]: ExtractPrimitiveType<T[K]> extends (object | null) ? never : K;
}[keyof T]> & Record<string, {
    $begin?: number;
    $end?: number;
}>;
type ObjectReplaceProps<T> = Omit<{
    [K in keyof T]?: ExtractPrimitiveType<T[K]> extends (object | null) ? ExtractPrimitiveType<T[K]> : never;
}, {
    [K in keyof T]: ExtractPrimitiveType<T[K]> extends (object | null) ? never : K;
}[keyof T]> & Record<string, {
    $searchValue: string;
    $replaceValue: string;
}>;
type StringReplaceProps<T> = Omit<{
    [K in keyof T]?: ExtractPrimitiveType<T[K]> extends (string | null) ? ExtractPrimitiveType<T[K]> : never;
}, {
    [K in keyof T]: ExtractPrimitiveType<T[K]> extends (string | null) ? never : K;
}[keyof T]> & Record<string, {
    $searchValue: string;
    $replaceValue: string;
}>;
type StringSliceProps<T> = Omit<{
    [K in keyof T]?: ExtractPrimitiveType<T[K]> extends (string | null) ? ExtractPrimitiveType<T[K]> : never;
}, {
    [K in keyof T]: ExtractPrimitiveType<T[K]> extends (string | null) ? never : K;
}[keyof T]> & Record<string, {
    $begin?: number;
    $end?: number;
}>;
type ObjectOmitProps<T> = Omit<{
    [K in keyof T]?: ExtractPrimitiveType<T[K]> extends (object | null) ? ExtractPrimitiveType<T[K]> : never;
}, {
    [K in keyof T]: ExtractPrimitiveType<T[K]> extends (object | null) ? never : K;
}[keyof T]> & Record<string, any>;
type GlobalUpdateExtraProps<T> = Omit<{
    [K in keyof T]?: boolean;
}, {
    [K in keyof T]: ExtractPrimitiveType<T[K]> extends (object | null) ? never : K;
}[keyof T]> & Record<string, boolean>;
export interface ArrayUpdateOptions<SchemaProps> {
    $push?: PushOptions<ArrayPropsOnly<SchemaProps>> | ObjectPushProps<SchemaProps>;
    $pop?: PopOptions<ArrayPropsOnly<SchemaProps>> | ObjectPopProps<SchemaProps>;
    $pull?: PullOptions<ArrayPropsOnly<SchemaProps>> | ObjectPullProps<SchemaProps>;
    $addToSet?: AddToSetOptions<ArrayPropsOnly<SchemaProps>> | ObjectAddToSetProps<SchemaProps>;
    $sliceArray?: SliceOptions<ArrayPropsOnly<SchemaProps>> | ObjectSliceArrayProps<SchemaProps>;
    $concat?: ConcatOptions<ArrayPropsOnly<SchemaProps>> | ObjectConcatProps<SchemaProps>;
}
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
}
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
}
export interface BooleanUpdateOptions<SchemaProps> {
    $toggle?: ToogleOptions<BooleanPropsOnly<SchemaProps> | ObjectPropsOnly<SchemaProps>>;
}
export interface UpdateOptions<SchemaProps> {
    $push?: ArrayUpdateOptions<SchemaProps>["$push"];
    $pop?: ArrayUpdateOptions<SchemaProps>["$pop"];
    $pull?: ArrayUpdateOptions<SchemaProps>["$pull"];
    $addToSet?: ArrayUpdateOptions<SchemaProps>["$addToSet"];
    $sliceArray?: ArrayUpdateOptions<SchemaProps>["$sliceArray"];
    $concat?: ArrayUpdateOptions<SchemaProps>["$concat"];
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
    $toggle?: BooleanUpdateOptions<SchemaProps>["$toggle"];
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
    $omit?: ObjectOmitProps<SchemaProps>;
    $set?: StaticProps<SchemaProps>;
    $unset?: GlobalUpdateExtraProps<SchemaProps>;
    $clear?: GlobalUpdateExtraProps<SchemaProps>;
}
export type RulesOperators<K> = {
    $required?: boolean;
} & (K extends number ? {
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
    $range?: {
        $min: number;
        $max: number;
    };
    $greaterThan?: number;
    $lessThan?: number;
    $greaterThanOrEqual?: number;
    $lessThanOrEqual?: number;
    $finite?: boolean;
    $infinite?: boolean;
    $palindrome?: boolean;
    $harshad?: boolean;
    $epochTime?: boolean;
    $angle?: {
        $unit: 'radian' | 'degree';
        $range: {
            $min: number;
            $max: number;
        };
    };
    $logicalOr?: RulesOperators<K>[];
    $logicalNot?: RulesOperators<K>;
    $custom?: (value: number) => boolean;
} : {}) & (K extends string ? {
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
} : {}) & (K extends boolean ? {
    $mustBeTrue?: boolean;
    $mustBeFalse?: boolean;
} : {});
export type RulesOptions<SchemaProps> = {
    [K in keyof SchemaProps]?: RulesOperators<SchemaProps[K]>;
};
export type UpdateMethodsOptions = {
    $upsert?: boolean;
    $multi?: boolean;
    $cache?: boolean | number | {
        $key: string;
        $ttl: number;
    };
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
    $lock?: boolean | {
        $level: 'key_share' | 'update';
        $of: any;
    };
    $skipLocked?: boolean;
    $plain?: boolean;
    $cache?: boolean | number | {
        $key: string;
        $ttl: number;
    };
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
    [K in keyof SchemaProps]?: SQLOperators<SchemaProps, ExtractPrimitiveType<SchemaProps[K]>> | ExtractPrimitiveType<SchemaProps[K]>;
};
type GroupOption<T> = (keyof T)[];
type AttributesOption<T> = (keyof T)[] | {
    $exclude?: (keyof T)[];
    $include?: (keyof T)[];
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
export declare class Nexorm {
    /**
     * Nexorm Config
     * @type {NexormConfig}
     * @public
     * @static
     * @example Nexorm.$config
     */
    static $configs: NexormConfig;
    /**
     * Nexorm Providers
     * @type {string[]}
     * @public
     * @static
     * @example Nexorm.$providers
     */
    static $providers: string[];
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
    static $connections: {
        $size: number;
        $list: string[];
    };
    /**
     * Connect To Database
     * @param providerName Provider Name
     * @returns Promise<void>
     * @example await Nexorm.$connect('nexorm')
     */
    static $connect(providerName?: string): Promise<void>;
    /**
     * Disconnect From Database
     * @param providerName Provider Name
     * @returns Promise<void>
     * @example await Nexorm.$disconnect('nexorm')
     */
    static $disconnect(providerName?: string): Promise<void>;
    /**
     * Drop Database
     * @param providerName Provider Name
     * @returns Promise<void>
     * @example await Nexorm.$drop('nexorm')
     */
    static $drop(providerName?: string): Promise<void>;
    /**
     * Close All Connections
     * @returns Promise<void>
     * @example await Nexorm.$closeAllConnections()
     * @description Close All Connections
     */
    static $closeAllConnections(): Promise<void>;
    /**
     * Connect All Providers
     * @returns Promise<void>
     * @example await Nexorm.$connectAll()
     * @description Connect All Providers
     */
    static $connectAll(): Promise<void>;
}
export declare class Model<SchemaProps> {
    #private;
    private Schema;
    $type: Omit<SchemaProps, 'prototype'>;
    $model: any;
    $middlewares: any[];
    $cache: CacheManager;
    $config: NexormConfigType;
    $debugMode: boolean;
    private schema;
    private model;
    constructor(Schema: SchemaProps);
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
    $search(query?: {
        $where?: StaticProps<ExtendType<Omit<SchemaProps, 'prototype'>, {
            nexorm_id: string;
        }>>;
        $options?: SearchMethodsOptions<ExtendType<Omit<SchemaProps, 'prototype'>, {
            nexorm_id: string;
        }>>;
    }): Promise<StaticProps<ExtendType<Omit<SchemaProps, 'prototype'>, {
        nexorm_id: string;
    }>>[]>;
    /**
     * Search First
     * @returns Promise<StaticProps<ExtendType<SchemaProps,{nexorm_id:string}>>
     * @example model.$searchFirst()
     * @async
     * @public
     * @type {Function}
     */
    $searchFirst(): Promise<StaticProps<ExtendType<Omit<SchemaProps, 'prototype'>, {
        nexorm_id: string;
    }>>>;
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
    $searchOne(query?: {
        $where: StaticProps<ExtendType<Omit<SchemaProps, 'prototype'>, {
            nexorm_id: string;
        }>>;
        $options?: SearchMethodsOptions<ExtendType<Omit<SchemaProps, 'prototype'>, {
            nexorm_id: string;
        }>>;
    }): Promise<StaticProps<ExtendType<Omit<SchemaProps, 'prototype'>, {
        nexorm_id: string;
    }>>>;
    /**
     * Search By Id
     * @param nexorm_id Nexorm ID
     * @returns Promise<StaticProps<ExtendType<SchemaProps,{nexorm_id:string}>>
     * @example model.$searchById('1')
     * @async
     * @public
     * @type {Function}
     */
    $searchById(nexorm_id: string): Promise<StaticProps<ExtendType<Omit<SchemaProps, 'prototype'>, {
        nexorm_id: string;
    }>>>;
    /**
     * Search By Ids
     * @param ids Nexorm IDs
     * @returns Promise<StaticProps<ExtendType<SchemaProps,{nexorm_id:string}>>
     * @example model.$searchByIds(['1','2','3'])
     * @async
     * @public
     * @type {Function}
     */
    $searchByIds(ids: string[]): Promise<StaticProps<ExtendType<Omit<SchemaProps, 'prototype'>, {
        nexorm_id: string;
    }>>[]>;
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
    $searchAndCount(query?: {
        $where?: StaticProps<ExtendType<Omit<SchemaProps, 'prototype'>, {
            nexorm_id: string;
        }>>;
    }): Promise<[
        StaticProps<ExtendType<Omit<SchemaProps, 'prototype'>, {
            nexorm_id: string;
        }>>[],
        number
    ]>;
    /**
     * Create
     * @param data Data
     * @returns Promise<StaticProps<ExtendType<SchemaProps,{nexorm_id:string}>>
     * @example model.$create({ name: 'John' })
     * @async
     * @public
     * @type {Function}
     */
    $everything(): Promise<StaticProps<ExtendType<Omit<SchemaProps, 'prototype'>, {
        nexorm_id: string;
    }>>[]>;
    /**
     * Build
     * @param data Data
     * @returns Promise<StaticProps<ExtendType<SchemaProps,{nexorm_id:string}>>
     * @example model.$build({ name: 'John' })
     * @async
     * @public
     * @type {Function}
     */
    $build(data: BuildProps<ExtendType<Omit<SchemaProps, 'prototype'>, {
        nexorm_id: string;
    }>>): Promise<BuildProps<ExtendType<Omit<SchemaProps, 'prototype'>, {
        nexorm_id: string;
    }>>>;
    /**
     * Build Many
     * @param data Data
     * @returns Promise<StaticProps<ExtendType<SchemaProps,{nexorm_id:string}>>
     * @example model.$buildMany([{ name: 'John' }, { name: 'Doe' }])
     * @async
     * @public
     * @type {Function}
     */
    $buildMany(data: BuildProps<ExtendType<Omit<SchemaProps, 'prototype'>, {
        nexorm_id: string;
    }>>[]): Promise<BuildProps<ExtendType<Omit<SchemaProps, 'prototype'>, {
        nexorm_id: string;
    }>>[]>;
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
    $update(query?: {
        $where?: StaticProps<ExtendType<Omit<SchemaProps, 'prototype'>, {
            nexorm_id: string;
        }>>;
        $update?: UpdateOptions<ExtendType<Omit<SchemaProps, 'prototype'>, {
            nexorm_id: string;
        }>>;
        $rules?: RulesOptions<StaticProps<ExtendType<Omit<SchemaProps, 'prototype'>, {
            nexorm_id: string;
        }>>>;
        $options?: UpdateMethodsOptions;
    }): Promise<StaticProps<ExtendType<Omit<SchemaProps, 'prototype'>, {
        nexorm_id: string;
    }>>>;
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
    $updateMany(query?: {
        $where?: StaticProps<ExtendType<Omit<SchemaProps, 'prototype'>, {
            nexorm_id: string;
        }>>;
        $update?: UpdateOptions<ExtendType<Omit<SchemaProps, 'prototype'>, {
            nexorm_id: string;
        }>>;
        $rules?: RulesOptions<StaticProps<ExtendType<Omit<SchemaProps, 'prototype'>, {
            nexorm_id: string;
        }>>>;
        $options?: Omit<UpdateMethodsOptions, '$multi'>;
    }): Promise<StaticProps<ExtendType<Omit<SchemaProps, 'prototype'>, {
        nexorm_id: string;
    }>>[]>;
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
    $delete(query?: {
        $where: StaticProps<ExtendType<Omit<SchemaProps, 'prototype'>, {
            nexorm_id: string;
        }>>;
        $options?: DeleteMethodsOptions<ExtendType<Omit<SchemaProps, 'prototype'>, {
            nexorm_id: string;
        }>>;
    }): Promise<boolean>;
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
    $deleteMany(query?: {
        $where: StaticProps<ExtendType<Omit<SchemaProps, 'prototype'>, {
            nexorm_id: string;
        }>>;
        $options?: DeleteMethodsOptions<ExtendType<Omit<SchemaProps, 'prototype'>, {
            nexorm_id: string;
        }>>;
    }): Promise<number>;
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
    $softDelete(query?: {
        $where: StaticProps<ExtendType<Omit<SchemaProps, 'prototype'>, {
            nexorm_id: string;
        }>>;
        $options?: Omit<DeleteMethodsOptions<ExtendType<Omit<SchemaProps, 'prototype'>, {
            nexorm_id: string;
        }>>, '$force'>;
    }): Promise<boolean>;
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
    $softDeleteMany(query?: {
        $where: StaticProps<ExtendType<Omit<SchemaProps, 'prototype'>, {
            nexorm_id: string;
        }>>;
        $options?: Omit<DeleteMethodsOptions<ExtendType<Omit<SchemaProps, 'prototype'>, {
            nexorm_id: string;
        }>>, '$force'>;
    }): Promise<number>;
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
    $restore(query?: {
        $where: StaticProps<ExtendType<Omit<SchemaProps, 'prototype'>, {
            nexorm_id: string;
        }>>;
        $options?: RestoreMethodsOptions;
    }): Promise<void>;
    $count(query?: {
        $where?: StaticProps<ExtendType<Omit<SchemaProps, 'prototype'>, {
            nexorm_id: string;
        }>>;
        $options?: CountMethodsOptions<ExtendType<Omit<SchemaProps, 'prototype'>, {
            nexorm_id: string;
        }>>;
    }): Promise<number>;
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
    $upsert(query: {
        $where: StaticProps<ExtendType<Omit<SchemaProps, 'prototype'>, {
            nexorm_id: string;
        }>>;
        $update: UpdateOptions<ExtendType<Omit<SchemaProps, 'prototype'>, {
            nexorm_id: string;
        }>>;
        $rules?: RulesOptions<StaticProps<ExtendType<Omit<SchemaProps, 'prototype'>, {
            nexorm_id: string;
        }>>>;
        $options?: Omit<UpdateMethodsOptions, '$upsert'>;
    }): Promise<StaticProps<ExtendType<Omit<SchemaProps, 'prototype'>, {
        nexorm_id: string;
    }>>>;
    /**
     * Query
     * @param query Query
     * @returns Promise<any>
     * @example model.$query('SELECT * FROM users')
     * @async
     * @public
     * @type {Function}
     */
    $query(query: string): Promise<any>;
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
    $distinct(query: {
        $field: (keyof ExtendType<Omit<SchemaProps, 'prototype'>, {
            nexorm_id: string;
        }>)[];
        $where?: StaticProps<ExtendType<Omit<SchemaProps, 'prototype'>, {
            nexorm_id: string;
        }>>;
        $options?: Omit<UpdateMethodsOptions, '$attributes'>;
    }): Promise<any[][]>;
    /**
     * Truncate
     * @returns Promise<void>
     * @example model.$truncate()
     * @async
     * @public
     * @type {Function}
     */
    $truncate(): Promise<void>;
    /**
     * Hooks
     * @description Nexorm Hooks
     * @public
     * @async
     * @example model.$hooks.$beforeCreate((values, fields) => {})
     * @example model.$hooks.$afterCreate((values, fields) => {})
     */
    $hooks: {
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
        $beforeCreate: (callback: (values: BuildProps<ExtendType<Omit<SchemaProps, "prototype">, {
            nexorm_id: string;
        }>>, fields: BuildProps<ExtendType<Omit<SchemaProps, "prototype">, {
            nexorm_id: string;
        }>>[]) => void) => void;
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
        $afterCreate: (callback: (values: BuildProps<ExtendType<Omit<SchemaProps, "prototype">, {
            nexorm_id: string;
        }>>, fields: BuildProps<ExtendType<Omit<SchemaProps, "prototype">, {
            nexorm_id: string;
        }>>[]) => void) => void;
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
        $afterUpdate: (callback: (values: BuildProps<ExtendType<Omit<SchemaProps, "prototype">, {
            nexorm_id: string;
        }>>, fields: BuildProps<ExtendType<Omit<SchemaProps, "prototype">, {
            nexorm_id: string;
        }>>[]) => void) => void;
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
        $beforeDestroy: (callback: (values: BuildProps<ExtendType<Omit<SchemaProps, "prototype">, {
            nexorm_id: string;
        }>>) => void) => void;
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
        $afterDestroy: (callback: (values: BuildProps<ExtendType<Omit<SchemaProps, "prototype">, {
            nexorm_id: string;
        }>>) => void) => void;
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
        $beforeUpdate: (callback: (values: BuildProps<ExtendType<Omit<SchemaProps, "prototype">, {
            nexorm_id: string;
        }>>, fields: BuildProps<ExtendType<Omit<SchemaProps, "prototype">, {
            nexorm_id: string;
        }>>[]) => void) => void;
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
        $beforeSave: (callback: (values: BuildProps<ExtendType<Omit<SchemaProps, "prototype">, {
            nexorm_id: string;
        }>>, fields: BuildProps<ExtendType<Omit<SchemaProps, "prototype">, {
            nexorm_id: string;
        }>>[]) => void) => void;
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
        $afterSave: (callback: (values: BuildProps<ExtendType<Omit<SchemaProps, "prototype">, {
            nexorm_id: string;
        }>>, fields: BuildProps<ExtendType<Omit<SchemaProps, "prototype">, {
            nexorm_id: string;
        }>>[]) => void) => void;
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
        $beforeBulkCreate: (callback: (values: BuildProps<ExtendType<Omit<SchemaProps, "prototype">, {
            nexorm_id: string;
        }>>[], fields: BuildProps<ExtendType<Omit<SchemaProps, "prototype">, {
            nexorm_id: string;
        }>>[]) => void) => void;
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
        $afterBulkCreate: (callback: (values: BuildProps<ExtendType<Omit<SchemaProps, "prototype">, {
            nexorm_id: string;
        }>>[], fields: BuildProps<ExtendType<Omit<SchemaProps, "prototype">, {
            nexorm_id: string;
        }>>[]) => void) => void;
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
        $beforeBulkUpdate: (callback: (name: string, fields: BuildProps<ExtendType<Omit<SchemaProps, "prototype">, {
            nexorm_id: string;
        }>>[]) => void) => void;
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
        $afterBulkUpdate: (callback: (name: string, fields: BuildProps<ExtendType<Omit<SchemaProps, "prototype">, {
            nexorm_id: string;
        }>>[]) => void) => void;
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
        $beforeBulkDestroy: (callback: (name: string, fields: BuildProps<ExtendType<Omit<SchemaProps, "prototype">, {
            nexorm_id: string;
        }>>[]) => void) => void;
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
        $afterBulkDestroy: (callback: (name: string) => void) => void;
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
        $beforeFind: (callback: (values: BuildProps<ExtendType<Omit<SchemaProps, "prototype">, {
            nexorm_id: string;
        }>>) => void) => void;
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
        $afterFind: (callback: (values: BuildProps<ExtendType<Omit<SchemaProps, "prototype">, {
            nexorm_id: string;
        }>>) => void) => void;
    };
}
export {};
