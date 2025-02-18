import { Model, ModelStatic } from "sequelize";
import { CountMethodsOptions } from "../decorator";
export declare function count(model: ModelStatic<Model<any, any>>, filter?: any, options?: CountMethodsOptions<any>): Promise<number>;
