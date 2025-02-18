import { Model, ModelStatic } from "sequelize";
import type { UpdateMethodsOptions, UpdateOptions, RulesOptions, StaticProps } from '../decorator';
export declare function updateOne(model: ModelStatic<Model<any, any>>, where: StaticProps<any>, update: UpdateOptions<any>, rules: RulesOptions<any>, options: UpdateMethodsOptions, schema: any): Promise<any>;
