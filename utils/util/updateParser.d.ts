import type { UpdateOptions, RulesOptions } from '../decorator';
import { Model } from 'sequelize';
export declare function updateParser(sequelizeModel: Model<any, any>, update: UpdateOptions<any>, rules: RulesOptions<any>, modelName: string, schema: any): Promise<any>;
