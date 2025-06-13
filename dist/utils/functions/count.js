"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.count = count;
const errorHandler_1 = __importDefault(require("../errorHandler"));
const errorParser_1 = require("../util/errorParser");
const lodash_1 = __importDefault(require("lodash"));
async function count(model, filter, options) {
    var filterOptions = {};
    if (!filter)
        filter = {};
    if (!options)
        options = {};
    if (options.$col) {
        if (!Array.isArray(options.$col))
            throw new errorHandler_1.default("Invalid value for $col. Must be an array.", "#FF0000");
        filterOptions.col = options.$col;
    }
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
    if (options.$distinct) {
        if (typeof options.$distinct !== 'boolean')
            throw new errorHandler_1.default("Invalid value for $distinct. Must be a boolean.", "#FF0000");
        filterOptions.distinct = options.$distinct;
    }
    ;
    if (options.$group) {
        if (!lodash_1.default.isArray(options.$group))
            throw new errorHandler_1.default("Invalid value for $group. Must be a string.", "#FF0000");
        filterOptions.group = options.$group;
    }
    ;
    if (options.$paranoid) {
        if (typeof options.$paranoid !== 'boolean')
            throw new errorHandler_1.default("Invalid value for $paranoid. Must be a boolean.", "#FF0000");
        filterOptions.paranoid = options.$paranoid;
    }
    ;
    if (options.$logging) {
        if (!["function", "boolean"].some((types) => types == typeof options.$logging))
            throw new errorHandler_1.default("Invalid value for $logging. Must be a Function, Boolean or String.", "#FF0000");
        filterOptions.logging = options.$logging;
    }
    ;
    try {
        return await model.count({ where: filter, ...filterOptions, transaction: options?.$transaction?.trx });
    }
    catch (error) {
        throw (0, errorParser_1.errorParser)(error);
    }
    ;
}
;
