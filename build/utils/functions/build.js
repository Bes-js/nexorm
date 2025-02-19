"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.build = build;
const crypto_1 = __importDefault(require("crypto"));
const errorHandler_1 = __importDefault(require("../errorHandler"));
const errorParser_1 = require("../util/errorParser");
async function build(model, data) {
    if (!data)
        throw new errorHandler_1.default("No data provided.", "#FF0000");
    if (!model)
        throw new errorHandler_1.default("No model provided.", "#FF0000");
    if (!model.findAll)
        throw new errorHandler_1.default("Invalid model provided.", "#FF0000");
    const uniqueData = {
        ...data,
        nexorm_id: crypto_1.default.randomUUID()
    };
    try {
        return (await model.create(uniqueData)).dataValues || null;
    }
    catch (error) {
        throw (0, errorParser_1.errorParser)(error);
    }
    ;
}
;
