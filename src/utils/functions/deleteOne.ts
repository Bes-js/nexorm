import { Model, ModelStatic, DestroyOptions } from "sequelize"
import ErrorHandler from "../errorHandler";
import { errorParser } from "../util/errorParser";
import _ from "lodash";
import { DeleteMethodsOptions } from "../decorator";

export async function deleteOne(
    model: ModelStatic<Model<any, any>>,
    filter?: any, 
    options?: DeleteMethodsOptions<any>,
    ) {


    var filterOptions = {} as DestroyOptions;

    if (!filter) filter = {};
    if (!options) options = {};

        if (options.$limit) {
            if (typeof options.$limit !== 'number') throw new ErrorHandler("Invalid value for $limit. Must be a number.", "#FF0000");
            if (options.$limit < 1) throw new ErrorHandler("Invalid value for $limit. Must be greater than 0.", "#FF0000");
            filterOptions.limit = options.$limit;
        };
    
        if (options.$force) {
            if (typeof options.$force !== 'boolean') throw new ErrorHandler("Invalid value for $force. Must be a boolean.", "#FF0000");
            filterOptions.force = options.$force;
        };
       
        if (options.$truncate) {
            if (typeof options.$truncate !== 'boolean') throw new ErrorHandler("Invalid value for $truncate. Must be a boolean.", "#FF0000");
            filterOptions.truncate = options.$truncate;
        };
    
        if (options.$logging) {
            if (!["function","boolean"].some((types) => types == typeof options.$logging)) throw new ErrorHandler("Invalid value for $logging. Must be a Function, Boolean or String.", "#FF0000");
            filterOptions.logging = options.$logging;
        };


        try {
            var findData = await model.findOne({ where: filter, ...filterOptions });
            if (!findData) return null;

            return await findData.destroy({ force: filterOptions.force, logging: filterOptions.logging }); 
        } catch (error) {
            throw errorParser(error);
        };
              
};