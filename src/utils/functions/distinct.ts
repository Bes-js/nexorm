import { Model, ModelStatic, FindOptions, LOCK } from "sequelize"
import ErrorHandler from "../errorHandler";
import { errorParser } from "../util/errorParser";
import _ from "lodash";
import { SearchMethodsOptions } from "../decorator";
import { CacheManager } from "../util/cacheManager";
import { cachedConfig, readConfig } from "../fileInspector";

export async function distinct(
    model: ModelStatic<Model<any, any>>,
    field: string[],
    filter?: any, 
    options?: SearchMethodsOptions<any>,
    cacheManager?: CacheManager,
    config?: typeof cachedConfig[0]
    ) {


    if (!field || field.length == 0) throw new ErrorHandler("No field provided.", "#FF0000");

    var filterOptions = {} as FindOptions;

    if (!filter) filter = {};
    if (!options) options = {};

    var cacheKey = `$distinct:${
        typeof options.$cache === 'object' ? options.$cache.$key : model.name
    }:${JSON.stringify(filter)}:${JSON.stringify(field)}:${JSON.stringify(options)}`;
    
    if (options.$cache && cacheManager?.$has(cacheKey)) {
        const result = cacheManager?.$get(cacheKey) as any;
        return result;
    };

    if (options.$limit) {
            if (typeof options.$limit !== 'number') throw new ErrorHandler("Invalid value for $limit. Must be a number.", "#FF0000");
            if (options.$limit < 1) throw new ErrorHandler("Invalid value for $limit. Must be greater than 0.", "#FF0000");
            filterOptions.limit = options.$limit;
        };
    
        if (options.$sort) {
            if (typeof options.$sort !== 'object') throw new ErrorHandler("Invalid value for $sort. Must be an object.", "#FF0000");
            Object.keys(options.$sort).forEach((key) => {
                if (!options.$sort) return;
                options.$sort[key] = options.$sort[key] == -1 || options.$sort[key] == false ? 'DESC' : 'ASC' as any;
            });
    
            filterOptions.order = Object.entries(options.$sort).map(([key, value]) => [key, value as any]);
        };
    
        /*
        if (options.$include) {
            filterOptions.include = options.$include.map((include) => {
                return {
                    model: include.$model,
                    attributes: include.$attributes as any,
                    as: include.$as || undefined
                }
            });
        };
        */
    
        if (options.$having) {
            filterOptions.having = options.$having;
        };
    
        if (options.$raw) {
            if (typeof options.$raw !== 'boolean') throw new ErrorHandler("Invalid value for $raw. Must be a boolean.", "#FF0000");
            filterOptions.raw = options.$raw || false;
        };
    
        if (options.$subQuery) {
            if (typeof options.$subQuery !== 'boolean') throw new ErrorHandler("Invalid value for $paginate. Must be a boolean.", "#FF0000");
            filterOptions.subQuery = options.$subQuery || false;
        };
    
        if (options.$attributes) {
            var type = typeof options.$attributes;
            if (_.isArray(options.$attributes) && options.$attributes instanceof Array) {
               filterOptions.attributes = options.$attributes as string[];
            } else if (type == 'object' && options.$attributes instanceof Object) {
                filterOptions.attributes = {
                    exclude: (options.$attributes as any)?.$exclude || [],
                    include: (options.$attributes as any)?.$include || [] 
                };
            }
        };
    
        if (options.$group) {
            if (!_.isArray(options.$group)) throw new ErrorHandler("Invalid value for $group. Must be a string.", "#FF0000");
            filterOptions.group = options.$group as string[];
        };
    
        if (options.$skipLocked) {
            if (typeof options.$skipLocked !== 'boolean') throw new ErrorHandler("Invalid value for $skipLocked. Must be a boolean.", "#FF0000");
            filterOptions.skipLocked = options.$skipLocked;
        };
    
        if (options.$useMaster) {
            if (typeof options.$useMaster !== 'boolean') throw new ErrorHandler("Invalid value for $useMaster. Must be a boolean.", "#FF0000");
            filterOptions.useMaster = options.$useMaster;
        };
    
        if (options.$plain) {
            if (typeof options.$plain !== 'boolean') throw new ErrorHandler("Invalid value for $plain. Must be a boolean.", "#FF0000");
            filterOptions.plain = options.$plain;
        };
    
        if (options.$paranoid) {
            if (typeof options.$paranoid !== 'boolean') throw new ErrorHandler("Invalid value for $paranoid. Must be a boolean.", "#FF0000");
            filterOptions.paranoid = options.$paranoid;
        };
    
        if (options.$subQuery) {
            if (typeof options.$subQuery !== 'boolean') throw new ErrorHandler("Invalid value for $subQuery. Must be a boolean.", "#FF0000");
            filterOptions.subQuery = options.$subQuery;
        };
    
        if (options.$logging) {
            if (!["function","boolean"].some((types) => types == typeof options.$logging)) throw new ErrorHandler("Invalid value for $logging. Must be a Function, Boolean or String.", "#FF0000");
            filterOptions.logging = options.$logging;
        };
    
        if (options.$lock) {
            filterOptions.lock = typeof options.$lock == 'boolean' ?
            options.$lock : 
            { 
                level: options.$lock.$level == 'key_share' ? LOCK.KEY_SHARE : LOCK.UPDATE,
                of: options.$lock.$of
            };
        };


      
    try {
    const result = await model.findAll({ where: filter, ...filterOptions, attributes: [...field], transaction: (options?.$transaction as any)?.trx , nest: true, benchmark: true, });
    

    if (options.$cache) {
        cacheManager?.$set(
            cacheKey, 
            result?.map((item) => {
                return field.map((x) => item.dataValues[x])
            }), 
            typeof options.$cache === 'object' ? 
            options.$cache.$ttl : 
            config?.$cache?.$duration || 60 * 1000
    );
    };

    return result ? { ...result.map((x) => {
        return field.map((y) => x.dataValues[y])
    }) } : null;
    } catch (error) {
        throw errorParser(error);
    };
};