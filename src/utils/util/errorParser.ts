import ErrorHandler from "../errorHandler";

export function errorParser(error: any) {
    
    switch (error.name) {
        case 'SequelizeValidationError':
            return new ErrorHandler(`Validation failed, ${error?.errors[0].message}`);
        case 'SequelizeUniqueConstraintError':
            if (error?.errors?.length == 0) return new ErrorHandler(`Unique constraint failed, ${error?.parent}`);
            return new ErrorHandler(`Unique constraint failed, '${error?.errors[0]?.path}' must be unique`);
        case 'SequelizeExclusionConstraintError':
            return new ErrorHandler(`Exclusion constraint failed, ${error?.errors[0].message}`);
        case 'SequelizeBulkRecordError':
            return new ErrorHandler(`Bulk record error occurred: ${error.message}`);
        case 'SequlizeDuplicateRecordError':
            return new ErrorHandler(`Duplicate record error occurred: ${error.message}`);
        case 'SequelizeNoRowsUpdatedError':
            return new ErrorHandler(`No rows updated: ${error.message}`);
        case 'SequelizeNoRowsDeletedError':
            return new ErrorHandler(`No rows deleted: ${error.message}`);
        case 'SequelizeConnectionAcquireTimeoutError':
            return new ErrorHandler(`Connection acquire timeout error occurred: ${error.message}`);
        case 'SequelizeConnectionTimeoutError':
            return new ErrorHandler(`Connection timeout error occurred: ${error.message}`);
        case 'SequelizeConnectionAuthenticationError':
            return new ErrorHandler(`Connection authentication error occurred: ${error.message}`);
        case 'SequelizeConnectionInvalidConnectionError':
            return new ErrorHandler(`Connection invalid error occurred: ${error.message}`);
        case 'SequelizeConnectionRefusedError':
            return new ErrorHandler(`Connection refused: ${error.message}`);
        case 'SequelizeHostNotFoundError':
            return new ErrorHandler(`Host not found: ${error.message}`);
        case 'SequelizeForeignKeyConstraintError':
            return new ErrorHandler(`Foreign key constraint failed, '${error?.errors[0].value}' not found`);
        case 'SequelizeDatabaseError':
            if (error?.message?.includes('"AUTOINCREMENT": syntax error')) return new ErrorHandler(`You can only use one @AutoIncrement per table`);
            return new ErrorHandler(`Database error occurred: ${error.message}`);
        case 'SequelizeConnectionError':
            return new ErrorHandler(`Connection error occurred: ${error.message}`);
        case 'SequelizeHostNotFoundError':
            return new ErrorHandler(`Host not found: ${error.message}`);
        case 'SequelizeAccessDeniedError':
            return new ErrorHandler(`Access denied: ${error.message}`);
        case 'SequelizeTimeoutError':
            return new ErrorHandler(`Timeout error occurred: ${error.message}`);
        case 'SequelizeConnectionRefusedError':
            return new ErrorHandler(`Connection refused: ${error.message}`);
        case 'SequelizeConnectionTimedOutError':
            return new ErrorHandler(`Connection timed out: ${error.message}`);
        case 'SequelizeHostNotReachableError':
            return new ErrorHandler(`Host not reachable: ${error.message}`);
        default:
            return new ErrorHandler(`Unknown error occurred: ${error.message}`);
    };
};