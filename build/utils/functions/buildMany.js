"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildMany = buildMany;
const crypto_1 = __importDefault(require("crypto"));
const errorHandler_1 = __importDefault(require("../errorHandler"));
const errorParser_1 = require("../util/errorParser");
async function buildMany(model, data) {
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
    const uniqueData = data.map((item) => ({
        ...item,
        nexorm_id: crypto_1.default.randomUUID()
    }));
    try {
        return (await model.bulkCreate(uniqueData, {
            validate: true,
            individualHooks: true
        })).map((item) => item.dataValues) || null;
    }
    catch (error) {
        throw (0, errorParser_1.errorParser)(error);
    }
    ;
}
;
