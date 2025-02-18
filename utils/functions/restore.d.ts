import { Model, ModelStatic } from "sequelize";
import { RestoreMethodsOptions } from "../decorator";
export declare function restore(model: ModelStatic<Model<any, any>>, filter?: any, options?: RestoreMethodsOptions): Promise<void>;
