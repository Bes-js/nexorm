import ErrorHandler from "../errorHandler";
import { Model, ModelStatic } from "sequelize"
import type { UpdateMethodsOptions, UpdateOptions, RulesOptions, StaticProps } from '../decorator';

import { errorParser } from "../util/errorParser";
import { updateParser } from "../util/updateParser";
import { build } from './build';


export async function updateMany(
    model: ModelStatic<Model<any, any>>,
    where: StaticProps<any>,
    update: UpdateOptions<any>,
    rules: RulesOptions<any>,
    options: UpdateMethodsOptions,
    schema: any
) {

    var updatedValues = [] as any[];

    if (!update) throw new ErrorHandler("No data provided.", "#FF0000");
    if (!model) throw new ErrorHandler("No model provided.", "#FF0000");
    if (!model.findAll) throw new ErrorHandler("Invalid model provided.", "#FF0000");


    try {
    var findedValues = await model.findAll({ where: where, transaction: (options.$transaction as any)?.trx }) as any[];
    if (!findedValues || findedValues.length == 0) findedValues = [null];

    for (var findedValue of findedValues) {
        
        if (!findedValue && options.$upsert) {
            var buildValue = await updateParser({} as any, update, rules, model.name, schema);

            updatedValues.push(await build(model, { ...where, ...buildValue},{ $transaction: options.$transaction, $hooks: options?.$hooks ?? true }));
            continue;
        };
        
        if (!findedValue) return null;
        var value = await updateParser(findedValue, update, rules, model.name, schema);
        if (!value || Object.keys(value)?.length == 0) throw new ErrorHandler("No data provided.", "#FF0000");

        for (var key in value) {
            findedValue.changed(key as any, true);
        };

        updatedValues.push((await findedValue.update(value,{ transaction: (options.$transaction as any)?.trx, hooks: options?.$hooks ?? true })).dataValues);
    };

    return updatedValues;
    } catch (error) {
        throw errorParser(error);
    };
};