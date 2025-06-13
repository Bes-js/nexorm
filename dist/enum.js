"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColumnType = void 0;
exports.ColumnType = {
    String: String,
    Number: Number,
    Boolean: Boolean,
    BigInt: BigInt,
    Date: Date,
    Array: (types) => types ? Array(types) : Array.prototype,
    Object: Object,
    Buffer: Buffer,
    Integer: BigInt,
};
