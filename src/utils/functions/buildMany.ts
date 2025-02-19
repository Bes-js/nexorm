import { Model, ModelStatic } from "sequelize"
import crypto from 'crypto';
import ErrorHandler from "../errorHandler";
import { errorParser } from "../util/errorParser";

export async function buildMany(
    model: ModelStatic<Model<any, any>>,
    data: any[]
) {

    if (!data) throw new ErrorHandler("No data provided.", "#FF0000");
    if (!Array.isArray(data)) throw new ErrorHandler("Invalid data type. Must be an array.", "#FF0000");
    if (data.length === 0) throw new ErrorHandler("No data provided.", "#FF0000");
    if (!model) throw new ErrorHandler("No model provided.", "#FF0000");
    if (!model.findAll) throw new ErrorHandler("Invalid model provided.", "#FF0000");

    const uniqueData = data.map((item) => ({
        ...item,
        nexorm_id: crypto.randomUUID()
    }));

    try {
        return (await model.bulkCreate(uniqueData, {
            validate: true,
            individualHooks: true
        })).map((item) => item.dataValues) || null;
        
    } catch (error) {
        throw errorParser(error);
    };

};