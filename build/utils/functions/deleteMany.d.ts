import { Model, ModelStatic } from "sequelize";
import { DeleteMethodsOptions } from "../decorator";
export declare function deleteMany(model: ModelStatic<Model<any, any>>, filter?: any, options?: DeleteMethodsOptions<any>): Promise<number>;
