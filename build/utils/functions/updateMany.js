"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMany = updateMany;
const errorHandler_1 = __importDefault(require("../errorHandler"));
const errorParser_1 = require("../util/errorParser");
const updateParser_1 = require("../util/updateParser");
const build_1 = require("./build");
async function updateMany(model, where, update, rules, options, schema) {
    var updatedValues = [];
    if (!update)
        throw new errorHandler_1.default("No data provided.", "#FF0000");
    if (!model)
        throw new errorHandler_1.default("No model provided.", "#FF0000");
    if (!model.findAll)
        throw new errorHandler_1.default("Invalid model provided.", "#FF0000");
    try {
        var findedValues = await model.findAll({ where: where });
        if (!findedValues || findedValues.length == 0)
            findedValues = [null];
        for (var findedValue of findedValues) {
            if (!findedValue && options.$upsert) {
                var buildValue = await (0, updateParser_1.updateParser)({}, update, rules, model.name, schema);
                updatedValues.push(await (0, build_1.build)(model, buildValue));
            }
            ;
            if (!findedValue)
                return null;
            var value = await (0, updateParser_1.updateParser)(findedValue, update, rules, model.name, schema);
            if (!value || Object.keys(value)?.length == 0)
                throw new errorHandler_1.default("No data provided.", "#FF0000");
            updatedValues.push((await findedValue.update(value)).dataValues);
        }
        ;
        return updatedValues;
    }
    catch (error) {
        throw (0, errorParser_1.errorParser)(error);
    }
    ;
}
;
