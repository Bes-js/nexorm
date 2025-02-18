"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.restore = restore;
const errorHandler_1 = __importDefault(require("../errorHandler"));
const errorParser_1 = require("../util/errorParser");
async function restore(model, filter, options) {
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
    if (options.$logging) {
        if (!["function", "boolean"].some((types) => types == typeof options.$logging))
            throw new errorHandler_1.default("Invalid value for $logging. Must be a Function, Boolean or String.", "#FF0000");
        filterOptions.logging = options.$logging;
    }
    ;
    try {
        return await model.restore({ where: filter, ...filterOptions });
    }
    catch (error) {
        throw (0, errorParser_1.errorParser)(error);
    }
    ;
}
;
