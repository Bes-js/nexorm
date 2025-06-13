import { Model, ModelStatic, DestroyOptions } from "sequelize"
import ErrorHandler from "../errorHandler";
import { errorParser } from "../util/errorParser";
import _ from "lodash";
import { RestoreMethodsOptions } from "../decorator";

export async function restore(
    model: ModelStatic<Model<any, any>>,
    filter?: any, 
    options?: RestoreMethodsOptions,
    ) {


    var filterOptions = {} as DestroyOptions;

    if (!filter) filter = {};
    if (!options) options = {};

        if (options.$limit) {
            if (typeof options.$limit !== 'number') throw new ErrorHandler("Invalid value for $limit. Must be a number.", "#FF0000");
            if (options.$limit < 1) throw new ErrorHandler("Invalid value for $limit. Must be greater than 0.", "#FF0000");
            filterOptions.limit = options.$limit;
        };
    
        if (options.$logging) {
            if (!["function","boolean"].some((types) => types == typeof options.$logging)) throw new ErrorHandler("Invalid value for $logging. Must be a Function, Boolean or String.", "#FF0000");
            filterOptions.logging = options.$logging;
        };

        try {
            return await model.restore({ where: filter, ...filterOptions, transaction: (options?.$transaction as any)?.trx, hooks: options?.$hooks ?? true });
        } catch (error) {
            throw errorParser(error);
        };

};