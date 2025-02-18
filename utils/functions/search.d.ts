import { Model, ModelStatic } from "sequelize";
import type { StaticProps, SearchMethodsOptions } from "../decorator";
import CacheManager from "../util/cacheManager";
import { readConfig } from "../fileInspector";
export declare function search(model: ModelStatic<Model<any, any>>, filter?: StaticProps<any>, options?: SearchMethodsOptions<any>, cacheManager?: CacheManager, config?: ReturnType<typeof readConfig>[0]): Promise<any>;
