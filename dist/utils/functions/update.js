"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOne = updateOne;
const errorHandler_1 = __importDefault(require("../errorHandler"));
const updateParser_1 = require("../util/updateParser");
const build_1 = require("./build");
const updateMany_1 = require("./updateMany");
const errorParser_1 = require("../util/errorParser");
async function updateOne(model, where, update, rules, options, schema) {
    if (!options.$multi)
        options.$multi = false;
    /* Multi Update Route */
    if (options.$multi) {
        return (await (0, updateMany_1.updateMany)(model, where, update, rules, options, schema));
    }
    ;
    if (!update)
        throw new errorHandler_1.default("No data provided.", "#FF0000");
    if (!model)
        throw new errorHandler_1.default("No model provided.", "#FF0000");
    if (!model.findAll)
        throw new errorHandler_1.default("Invalid model provided.", "#FF0000");
    try {
        var findedValue = await model.findOne({ where: where, transaction: options?.$transaction?.trx });
        if (!findedValue && options.$upsert) {
            var buildValue = await (0, updateParser_1.updateParser)({ dataValues: where }, update, rules, model.name, schema);
            return (await (0, build_1.build)(model, { ...where, ...buildValue }, { $transaction: options.$transaction, $hooks: options.$hooks })).dataValues;
        }
        ;
        if (!findedValue)
            return null;
        var value = await (0, updateParser_1.updateParser)(findedValue, update, rules, model.name, schema);
        if (!value || Object.keys(value)?.length == 0)
            throw new errorHandler_1.default("No data provided.", "#FF0000");
        for (var key in value) {
            findedValue.changed(key, true);
        }
        ;
        var data = (await findedValue.update(value, { transaction: options?.$transaction?.trx, hooks: options?.$hooks ?? true })).dataValues;
        return data;
    }
    catch (error) {
        throw (0, errorParser_1.errorParser)(error);
    }
    ;
}
;
