"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildMany = buildMany;
const crypto_1 = __importDefault(require("crypto"));
const errorHandler_1 = __importDefault(require("../errorHandler"));
const errorParser_1 = require("../util/errorParser");
async function buildMany(model, data, options) {
    if (!data)
        throw new errorHandler_1.default("No data provided.", "#FF0000");
    if (!Array.isArray(data))
        throw new errorHandler_1.default("Invalid data type. Must be an array.", "#FF0000");
    if (data.length === 0)
        throw new errorHandler_1.default("No data provided.", "#FF0000");
    if (!model)
        throw new errorHandler_1.default("No model provided.", "#FF0000");
    if (!model.findAll)
        throw new errorHandler_1.default("Invalid model provided.", "#FF0000");
    var filterOptions = {};
    if (!options)
        options = {};
    if (options.$logging) {
        if (!["function", "boolean"].some((types) => types == typeof options.$logging))
            throw new errorHandler_1.default("Invalid value for $logging. Must be a Function, Boolean or String.", "#FF0000");
        filterOptions.logging = options.$logging;
    }
    ;
    const uniqueData = data.map((item) => ({
        ...item,
        ObjectId: `${crypto_1.default.randomUUID()}-${Date.now().toString(5)}`
    }));
    try {
        return (await model.bulkCreate(uniqueData, {
            validate: true,
            individualHooks: true,
            hooks: options?.$hooks ?? true,
            transaction: options?.$transaction?.trx,
            logging: filterOptions.logging
        })).map((item) => item.dataValues) || null;
    }
    catch (error) {
        throw (0, errorParser_1.errorParser)(error);
    }
    ;
}
;
