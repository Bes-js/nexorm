"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchOne = searchOne;
exports.parseSearchOneOptions = parseSearchOneOptions;
const sequelize_1 = require("sequelize");
const errorHandler_1 = __importDefault(require("../errorHandler"));
const errorParser_1 = require("../util/errorParser");
const lodash_1 = __importDefault(require("lodash"));
const decorator_1 = require("../decorator");
async function searchOne(model, filter, options, cacheManager, config) {
    if (!model)
        throw new errorHandler_1.default("Model not found.", "#FF0000");
    if (!filter)
        filter = {};
    if (!options)
        options = {};
    var cacheKey = `$seachOne:${typeof options.$cache === 'object' ? options.$cache.$key : model.name}:${JSON.stringify(filter)}:${JSON.stringify(options)}`;
    if (options.$cache && cacheManager?.$has(cacheKey)) {
        const result = cacheManager?.$get(cacheKey);
        return result;
    }
    ;
    var filterOptions = parseSearchOneOptions(options);
    try {
        const result = await model.findOne({ where: filter, ...filterOptions, transaction: options?.$transaction?.trx });
        if (options.$cache) {
            cacheManager?.$set(cacheKey, result?.dataValues, typeof options.$cache === 'object' ?
                options.$cache.$ttl :
                config?.$cache?.$duration || 60 * 1000);
        }
        ;
        return result ? { ...result.dataValues } : null;
    }
    catch (error) {
        throw (0, errorParser_1.errorParser)(error);
    }
    ;
}
;
function parseSearchOneOptions(options) {
    var filterOptions = {};
    if (options.$limit) {
        if (typeof options.$limit !== 'number')
            throw new errorHandler_1.default("Invalid value for $limit. Must be a number.", "#FF0000");
        if (options.$limit < 1)
            throw new errorHandler_1.default("Invalid value for $limit. Must be greater than 0.", "#FF0000");
        filterOptions.limit = options.$limit;
    }
    ;
    if (options.$sort) {
        if (typeof options.$sort !== 'object')
            throw new errorHandler_1.default("Invalid value for $sort. Must be an object.", "#FF0000");
        Object.keys(options.$sort).forEach((key) => {
            if (!options.$sort)
                return;
            options.$sort[key] = options.$sort[key] == -1 || options.$sort[key] == false ? 'DESC' : 'ASC';
        });
        filterOptions.order = Object.entries(options.$sort).map(([key, value]) => [key, value]);
    }
    ;
    if (options.hasOwnProperty('$having')) {
        filterOptions.having = options.$having;
    }
    ;
    if (options.hasOwnProperty('$raw')) {
        if (typeof options.$raw !== 'boolean')
            throw new errorHandler_1.default("Invalid value for $raw. Must be a boolean.", "#FF0000");
        filterOptions.raw = options.$raw || false;
    }
    ;
    if (options.hasOwnProperty('$subQuery')) {
        if (typeof options.$subQuery !== 'boolean')
            throw new errorHandler_1.default("Invalid value for $paginate. Must be a boolean.", "#FF0000");
        filterOptions.subQuery = options.$subQuery || false;
    }
    ;
    if (options.$attributes) {
        var type = typeof options.$attributes;
        if (lodash_1.default.isArray(options.$attributes) && options.$attributes instanceof Array) {
            filterOptions.attributes = options.$attributes;
        }
        else if (type == 'object' && options.$attributes instanceof Object) {
            filterOptions.attributes = {
                exclude: options.$attributes?.$exclude || [],
                include: options.$attributes?.$include || []
            };
        }
    }
    ;
    if (options.$group) {
        if (!lodash_1.default.isArray(options.$group))
            throw new errorHandler_1.default("Invalid value for $group. Must be a string.", "#FF0000");
        filterOptions.group = options.$group;
    }
    if (options.hasOwnProperty('$skipLocked')) {
        if (typeof options.$skipLocked !== 'boolean')
            throw new errorHandler_1.default("Invalid value for $skipLocked. Must be a boolean.", "#FF0000");
        filterOptions.skipLocked = options.$skipLocked;
    }
    if (options.hasOwnProperty('$useMaster')) {
        if (typeof options.$useMaster !== 'boolean')
            throw new errorHandler_1.default("Invalid value for $useMaster. Must be a boolean.", "#FF0000");
        filterOptions.useMaster = options.$useMaster;
    }
    if (options.hasOwnProperty('$plain')) {
        if (typeof options.$plain !== 'boolean')
            throw new errorHandler_1.default("Invalid value for $plain. Must be a boolean.", "#FF0000");
        filterOptions.plain = options.$plain;
    }
    if (options.hasOwnProperty('$paranoid')) {
        if (typeof options.$paranoid !== 'boolean')
            throw new errorHandler_1.default("Invalid value for $paranoid. Must be a boolean.", "#FF0000");
        filterOptions.paranoid = options.$paranoid;
    }
    if (options.hasOwnProperty('$subQuery')) {
        if (typeof options.$subQuery !== 'boolean')
            throw new errorHandler_1.default("Invalid value for $subQuery. Must be a boolean.", "#FF0000");
        filterOptions.subQuery = options.$subQuery;
    }
    if (options.$logging) {
        if (!["function", "boolean"].some((types) => types == typeof options.$logging))
            throw new errorHandler_1.default("Invalid value for $logging. Must be a Function, Boolean or String.", "#FF0000");
        filterOptions.logging = options.$logging;
    }
    if (options.$lock) {
        filterOptions.lock = typeof options.$lock == 'boolean' ?
            options.$lock :
            {
                level: options.$lock.$level == 'key_share' ? sequelize_1.LOCK.KEY_SHARE : sequelize_1.LOCK.UPDATE,
                of: options.$lock.$of
            };
    }
    if (options.$include) {
        var includes = [];
        for (var includeModel of options.$include) {
            var findedModel = decorator_1.models.find((model) => model.name == includeModel?.name);
            if (!findedModel)
                throw new errorHandler_1.default(`Model ${includeModel} not found.`, "#FF0000");
            includes.push(includeModel);
        }
        filterOptions.include = includes;
    }
    return filterOptions;
}
;
