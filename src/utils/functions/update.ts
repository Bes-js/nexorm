import { Model, ModelStatic } from "sequelize"
import ErrorHandler from "../errorHandler";
import type { UpdateMethodsOptions, UpdateOptions, RulesOptions, StaticProps } from '../decorator';

import { updateParser } from "../util/updateParser";
import { build } from './build';
import { updateMany } from "./updateMany";
import { errorParser } from "../util/errorParser";

export async function updateOne(
    model: ModelStatic<Model<any, any>>,
    where: StaticProps<any>,
    update: UpdateOptions<any>,
    rules: RulesOptions<any>,
    options: UpdateMethodsOptions,
    schema: any
) {
    
    if (!options.$multi) options.$multi = false;

    /* Multi Update Route */
    if (options.$multi) {
        return (await updateMany(model, where, update, rules, options, schema));
    };


    if (!update) throw new ErrorHandler("No data provided.", "#FF0000");
    if (!model) throw new ErrorHandler("No model provided.", "#FF0000");
    if (!model.findAll) throw new ErrorHandler("Invalid model provided.", "#FF0000");


    try {
    var findedValue = await model.findOne({ where: where, transaction: (options?.$transaction as any)?.trx });
    if (!findedValue && options.$upsert) {
        var buildValue = await updateParser({ dataValues: where } as any, update, rules, model.name, schema);        

        return (await build(model, { ...where, ...buildValue },{ $transaction: options.$transaction, $hooks: options.$hooks })).dataValues;
    };
    if (!findedValue) return null;
    var value = await updateParser(findedValue,update, rules, model.name, schema);
    
    if (!value || Object.keys(value)?.length == 0) throw new ErrorHandler("No data provided.", "#FF0000");


    for (var key in value) {
        findedValue.changed(key as any, true);
    };


    var data = (await findedValue.update(value,{ transaction: (options?.$transaction as any)?.trx, hooks: options?.$hooks ?? true })).dataValues;
    

    return data;
    } catch (error) {
        throw errorParser(error);
    };
};
