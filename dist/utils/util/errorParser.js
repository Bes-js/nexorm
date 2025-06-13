"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorParser = errorParser;
const errorHandler_1 = __importDefault(require("../errorHandler"));
function errorParser(error) {
    switch (error.name) {
        case 'SequelizeValidationError':
            return new errorHandler_1.default(`Validation failed, ${error?.errors[0].message}`);
        case 'SequelizeUniqueConstraintError':
            if (error?.errors?.length == 0)
                return new errorHandler_1.default(`Unique constraint failed, ${error?.parent}`);
            return new errorHandler_1.default(`Unique constraint failed, '${error?.errors[0]?.path}' must be unique`);
        case 'SequelizeExclusionConstraintError':
            return new errorHandler_1.default(`Exclusion constraint failed, ${error?.errors[0].message}`);
        case 'SequelizeBulkRecordError':
            return new errorHandler_1.default(`Bulk record error occurred: ${error.message}`);
        case 'SequlizeDuplicateRecordError':
            return new errorHandler_1.default(`Duplicate record error occurred: ${error.message}`);
        case 'SequelizeNoRowsUpdatedError':
            return new errorHandler_1.default(`No rows updated: ${error.message}`);
        case 'SequelizeNoRowsDeletedError':
            return new errorHandler_1.default(`No rows deleted: ${error.message}`);
        case 'SequelizeConnectionAcquireTimeoutError':
            return new errorHandler_1.default(`Connection acquire timeout error occurred: ${error.message}`);
        case 'SequelizeConnectionTimeoutError':
            return new errorHandler_1.default(`Connection timeout error occurred: ${error.message}`);
        case 'SequelizeConnectionAuthenticationError':
            return new errorHandler_1.default(`Connection authentication error occurred: ${error.message}`);
        case 'SequelizeConnectionInvalidConnectionError':
            return new errorHandler_1.default(`Connection invalid error occurred: ${error.message}`);
        case 'SequelizeConnectionRefusedError':
            return new errorHandler_1.default(`Connection refused: ${error.message}`);
        case 'SequelizeHostNotFoundError':
            return new errorHandler_1.default(`Host not found: ${error.message}`);
        case 'SequelizeForeignKeyConstraintError':
            return new errorHandler_1.default(`Foreign key constraint failed, '${error?.errors[0].value}' not found`);
        case 'SequelizeDatabaseError':
            if (error?.message?.includes('"AUTOINCREMENT": syntax error'))
                return new errorHandler_1.default(`You can only use one @AutoIncrement or @IdColumn per table`);
            return new errorHandler_1.default(`Database error occurred: ${error.message}`);
        case 'SequelizeConnectionError':
            return new errorHandler_1.default(`Connection error occurred: ${error.message}`);
        case 'SequelizeHostNotFoundError':
            return new errorHandler_1.default(`Host not found: ${error.message}`);
        case 'SequelizeAccessDeniedError':
            return new errorHandler_1.default(`Access denied: ${error.message}`);
        case 'SequelizeTimeoutError':
            return new errorHandler_1.default(`Timeout error occurred: ${error.message}`);
        case 'SequelizeConnectionRefusedError':
            return new errorHandler_1.default(`Connection refused: ${error.message}`);
        case 'SequelizeConnectionTimedOutError':
            return new errorHandler_1.default(`Connection timed out: ${error.message}`);
        case 'SequelizeHostNotReachableError':
            return new errorHandler_1.default(`Host not reachable: ${error.message}`);
        default:
            return new errorHandler_1.default(`Unknown error occurred: ${error.message}`);
    }
    ;
}
;
