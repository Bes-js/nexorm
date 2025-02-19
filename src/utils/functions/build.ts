import { Model, ModelStatic } from "sequelize"
import crypto from 'crypto';
import ErrorHandler from "../errorHandler";
import { errorParser } from "../util/errorParser";

export async function build(
    model: ModelStatic<Model<any, any>>,
    data: any
) {

    if (!data) throw new ErrorHandler("No data provided.", "#FF0000");
    if (!model) throw new ErrorHandler("No model provided.", "#FF0000");
    if (!model.findAll) throw new ErrorHandler("Invalid model provided.", "#FF0000");

    const uniqueData = {
        ...data,
        nexorm_id: crypto.randomUUID()
    };

       try {
           return (await model.create(uniqueData)).dataValues || null;
       } catch (error) {
           throw errorParser(error);
       };
};