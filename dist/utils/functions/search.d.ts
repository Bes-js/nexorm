import { Model, ModelStatic, FindOptions } from "sequelize";
import type { StaticProps, SearchMethodsOptions } from "../decorator";
import { CacheManager } from "../util/cacheManager";
import { cachedConfig } from "../fileInspector";
export declare function search(model: ModelStatic<Model<any, any>>, filter?: StaticProps<any>, options?: SearchMethodsOptions<any>, cacheManager?: CacheManager, config?: typeof cachedConfig[0]): Promise<any>;
export declare function parseSearchManyOptions(options: SearchMethodsOptions<any>): FindOptions<any>;
