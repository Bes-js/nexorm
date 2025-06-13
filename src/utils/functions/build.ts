import { CreateOptions, Model, ModelStatic } from "sequelize"
import crypto from 'crypto';
import ErrorHandler from "../errorHandler";
import { errorParser } from "../util/errorParser";
import { BuildMethodsOptions } from "../decorator";

export async function build(
    model: ModelStatic<Model<any, any>>,
    data: any,
    options?: BuildMethodsOptions<any>
) {

    if (!data) throw new ErrorHandler("No data provided.", "#FF0000");
    if (!model) throw new ErrorHandler("No model provided.", "#FF0000");
    if (!model.findAll) throw new ErrorHandler("Invalid model provided.", "#FF0000");


    var filterOptions = {} as CreateOptions;

    if (!options) options = {};

    if (options.$logging) {
        if (!["function", "boolean"].some((types) => types == typeof options.$logging)) throw new ErrorHandler("Invalid value for $logging. Must be a Function, Boolean or String.", "#FF0000");
        filterOptions.logging = options.$logging;
    };

    const uniqueData = {
        ...data,
        ObjectId: `${crypto.randomUUID()}-${Date.now().toString(5)}`
    };

    try {
        return (await model.create(uniqueData, {
            transaction: (options?.$transaction as any)?.trx,
            hooks: options?.$hooks ?? true,
            logging: filterOptions.logging
        })).dataValues || null;
    } catch (error) {
        throw errorParser(error);
    };
};