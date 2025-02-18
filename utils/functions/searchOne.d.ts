import { Model, ModelStatic } from "sequelize";
import { SearchMethodsOptions } from "../decorator";
import CacheManager from "../util/cacheManager";
import { readConfig } from "../fileInspector";
export declare function searchOne(model: ModelStatic<Model<any, any>>, filter?: any, options?: SearchMethodsOptions<any>, cacheManager?: CacheManager, config?: ReturnType<typeof readConfig>[0]): Promise<any>;
