import { Model, ModelStatic, FindOptions } from "sequelize";
import { SearchMethodsOptions } from "../decorator";
import { CacheManager } from "../util/cacheManager";
import { cachedConfig } from "../fileInspector";
export declare function searchOne(model: ModelStatic<Model<any, any>>, filter?: any, options?: SearchMethodsOptions<any>, cacheManager?: CacheManager, config?: typeof cachedConfig[0]): Promise<any>;
export declare function parseSearchOneOptions(options: SearchMethodsOptions<any>): FindOptions<any>;
