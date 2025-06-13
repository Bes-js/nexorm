import { Model, ModelStatic } from "sequelize";
import { SearchMethodsOptions } from "../decorator";
import { CacheManager } from "../util/cacheManager";
import { cachedConfig } from "../fileInspector";
export declare function distinct(model: ModelStatic<Model<any, any>>, field: string[], filter?: any, options?: SearchMethodsOptions<any>, cacheManager?: CacheManager, config?: typeof cachedConfig[0]): Promise<any>;
