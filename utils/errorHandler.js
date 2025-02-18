"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
class ErrorHandler extends Error {
    constructor(message, hexCode) {
        super(chalk_1.default.hex(hexCode || "#FF0000").bold(message));
        this.name = "Nexorm Error";
        this.message = message;
    }
    ;
}
exports.default = ErrorHandler;
;
