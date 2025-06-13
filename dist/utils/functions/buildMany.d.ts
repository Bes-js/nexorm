import { Model, ModelStatic } from "sequelize";
import { BuildMethodsOptions } from "../decorator";
export declare function buildMany(model: ModelStatic<Model<any, any>>, data: any[], options?: BuildMethodsOptions<any>): Promise<any[]>;
