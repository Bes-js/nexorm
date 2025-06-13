import { Model, ModelStatic, FindOptions, LOCK } from "sequelize"
import ErrorHandler from "../errorHandler";
import { errorParser } from "../util/errorParser";
import _ from "lodash";
import { SearchMethodsOptions, models } from "../decorator";
import { CacheManager } from "../util/cacheManager";
import { cachedConfig, readConfig } from "../fileInspector";

export async function searchOne(
    model: ModelStatic<Model<any, any>>,
    filter?: any, 
    options?: SearchMethodsOptions<any>,
    cacheManager?: CacheManager,
    config?: typeof cachedConfig[0]
    ) {
    if (!model) throw new ErrorHandler("Model not found.", "#FF0000");


    if (!filter) filter = {};
    if (!options) options = {};

    var cacheKey = `$seachOne:${
        typeof options.$cache === 'object' ? options.$cache.$key : model.name
    }:${JSON.stringify(filter)}:${JSON.stringify(options)}`;

    if (options.$cache && cacheManager?.$has(cacheKey)) {
        const result = cacheManager?.$get(cacheKey) as any;
        return result;
    };
    

    var filterOptions = parseSearchOneOptions(options) as FindOptions;


    try {
    const result = await model.findOne({ where: filter, ...filterOptions, transaction: (options?.$transaction as any)?.trx });

    if (options.$cache) {
        cacheManager?.$set(
            cacheKey, 
            result?.dataValues, 
            typeof options.$cache === 'object' ? 
            options.$cache.$ttl : 
            config?.$cache?.$duration || 60 * 1000
    );
    };

    return result ? { ...result.dataValues } : null;
    } catch (error) {
        throw errorParser(error);
    };
};


export function parseSearchOneOptions(options: SearchMethodsOptions<any>) {
    var filterOptions = {} as FindOptions;

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

    if (options.hasOwnProperty('$having')) {
        filterOptions.having = options.$having;
    };

    if (options.hasOwnProperty('$raw')) {
        if (typeof options.$raw !== 'boolean') throw new ErrorHandler("Invalid value for $raw. Must be a boolean.", "#FF0000");
        filterOptions.raw = options.$raw || false;
    };

    if (options.hasOwnProperty('$subQuery')) {
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
    }
    if (options.hasOwnProperty('$skipLocked')) {
        if (typeof options.$skipLocked !== 'boolean') throw new ErrorHandler("Invalid value for $skipLocked. Must be a boolean.", "#FF0000");
        filterOptions.skipLocked = options.$skipLocked;
    }
    if (options.hasOwnProperty('$useMaster')) {
        if (typeof options.$useMaster !== 'boolean') throw new ErrorHandler("Invalid value for $useMaster. Must be a boolean.", "#FF0000");
        filterOptions.useMaster = options.$useMaster;
    }
    if (options.hasOwnProperty('$plain')) {
        if (typeof options.$plain !== 'boolean') throw new ErrorHandler("Invalid value for $plain. Must be a boolean.", "#FF0000");
        filterOptions.plain = options.$plain;
    }
    if (options.hasOwnProperty('$paranoid')) {
        if (typeof options.$paranoid !== 'boolean') throw new ErrorHandler("Invalid value for $paranoid. Must be a boolean.", "#FF0000");
        filterOptions.paranoid = options.$paranoid;
    }
    if (options.hasOwnProperty('$subQuery')) {
        if (typeof options.$subQuery !== 'boolean') throw new ErrorHandler("Invalid value for $subQuery. Must be a boolean.", "#FF0000");
        filterOptions.subQuery = options.$subQuery;
    }
    if (options.$logging) {
        if (!["function","boolean"].some((types) => types == typeof options.$logging)) throw new ErrorHandler("Invalid value for $logging. Must be a Function, Boolean or String.", "#FF0000");
        filterOptions.logging = options.$logging;
    }
    if (options.$lock) {
        filterOptions.lock = typeof options.$lock == 'boolean' ?
        options.$lock :
        {
            level: options.$lock.$level == 'key_share' ? LOCK.KEY_SHARE : LOCK.UPDATE,
            of: options.$lock.$of
        };
    }
    if (options.$include) {
        var includes = [];
        for (var includeModel of (options.$include as any[])) {
        var findedModel = models.find((model) => model.name == includeModel?.name);
        if (!findedModel) throw new ErrorHandler(`Model ${includeModel} not found.`, "#FF0000");
          includes.push(includeModel);
        }

        filterOptions.include = includes;
    }
    
    return filterOptions;
};