import { Model, ModelStatic, CountOptions } from "sequelize"
import ErrorHandler from "../errorHandler";
import { errorParser } from "../util/errorParser";
import _ from "lodash";
import { CountMethodsOptions } from "../decorator";

export async function count(
    model: ModelStatic<Model<any, any>>,
    filter?: any, 
    options?: CountMethodsOptions<any>,
    ) {


    var filterOptions = {} as CountOptions;

    if (!filter) filter = {};
    if (!options) options = {};

    
       if (options.$col) {
            if (!Array.isArray(options.$col)) throw new ErrorHandler("Invalid value for $col. Must be an array.", "#FF0000");
            filterOptions.col = options.$col as string;
       }
    
       
        if (options.$attributes) {
                var type = typeof options.$attributes;
                if (_.isArray(options.$attributes) && options.$attributes instanceof Array) {
                   filterOptions.attributes = options.$attributes as string[];
                } else if (type == 'object' && options.$attributes instanceof Object) {
                    filterOptions.attributes = {
                        exclude: (options.$attributes as any)?.$exclude || [],
                        include: (options.$attributes as any)?.$include || [] 
                    };
                }
            };

        if (options.$distinct) {
            if (typeof options.$distinct !== 'boolean') throw new ErrorHandler("Invalid value for $distinct. Must be a boolean.", "#FF0000");
            filterOptions.distinct = options.$distinct;
        };

        if (options.$group) {
            if (!_.isArray(options.$group)) throw new ErrorHandler("Invalid value for $group. Must be a string.", "#FF0000");
            filterOptions.group = options.$group as string[];
        };

    
        if (options.$paranoid) {
            if (typeof options.$paranoid !== 'boolean') throw new ErrorHandler("Invalid value for $paranoid. Must be a boolean.", "#FF0000");
            filterOptions.paranoid = options.$paranoid;
        };


        if (options.$logging) {
            if (!["function","boolean"].some((types) => types == typeof options.$logging)) throw new ErrorHandler("Invalid value for $logging. Must be a Function, Boolean or String.", "#FF0000");
            filterOptions.logging = options.$logging;
        };


        try {
            return await model.count({ where: filter, ...filterOptions, transaction: (options?.$transaction as any)?.trx });
        } catch (error) {
            throw errorParser(error);
        };

};