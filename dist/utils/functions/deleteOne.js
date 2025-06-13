"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOne = deleteOne;
const errorHandler_1 = __importDefault(require("../errorHandler"));
const errorParser_1 = require("../util/errorParser");
async function deleteOne(model, filter, options) {
    var filterOptions = {};
    if (!filter)
        filter = {};
    if (!options)
        options = {};
    if (options.$limit) {
        if (typeof options.$limit !== 'number')
            throw new errorHandler_1.default("Invalid value for $limit. Must be a number.", "#FF0000");
        if (options.$limit < 1)
            throw new errorHandler_1.default("Invalid value for $limit. Must be greater than 0.", "#FF0000");
        filterOptions.limit = options.$limit;
    }
    ;
    if (options.$force) {
        if (typeof options.$force !== 'boolean')
            throw new errorHandler_1.default("Invalid value for $force. Must be a boolean.", "#FF0000");
        filterOptions.force = options.$force;
    }
    ;
    if (options.$truncate) {
        if (typeof options.$truncate !== 'boolean')
            throw new errorHandler_1.default("Invalid value for $truncate. Must be a boolean.", "#FF0000");
        filterOptions.truncate = options.$truncate;
    }
    ;
    if (options.$logging) {
        if (!["function", "boolean"].some((types) => types == typeof options.$logging))
            throw new errorHandler_1.default("Invalid value for $logging. Must be a Function, Boolean or String.", "#FF0000");
        filterOptions.logging = options.$logging;
    }
    ;
    try {
        var findData = await model.findOne({ where: filter, ...filterOptions, transaction: options?.$transaction?.trx });
        if (!findData)
            return null;
        return await findData.destroy({ force: filterOptions.force, logging: filterOptions.logging, transaction: options?.$transaction?.trx, hooks: options?.$hooks ?? true });
    }
    catch (error) {
        throw (0, errorParser_1.errorParser)(error);
    }
    ;
}
;
