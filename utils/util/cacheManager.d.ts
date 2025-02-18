export default class CacheManager extends Map {
    /**
     * Cache Manager
     *
     * @class CacheManager
     * @extends {Map}
     * @returns {CacheManager}
     * @example const cache = new CacheManager();
     */
    /**
     * Set a value to cache
     *
     * @param {string} key Key
     * @param {any} value Value
     * @param {number} [duration] Duration
     * @returns {CacheManager}
     * @example cache.$set('key', 'value', 1000);
     */
    $set(key: string, value: any, duration?: number): this;
    /**
     * Get a value from cache
     *
     * @param {string} key Key
     * @returns {any}
     * @example cache.$get('key');
     */
    $get(key: string): any;
    /**
     * Delete a value from cache
     *
     * @param {string} key Key
     * @returns {boolean}
     * @example cache.$delete('key');
     */
    $delete(key: string): boolean;
    /**
     * Clear cache
     *
     * @returns {void}
     * @example cache.$clear();
     */
    $clear(): void;
    /**
     * Check if cache has a key
     *
     * @param {string} key Key
     * @returns {boolean}
     * @example cache.$has('key');
     */
    $has(key: string): boolean;
    /**
     * Get cache keys
     *
     * @returns {string[]}
     * @example cache.$keys();
     */
    $keys(): string[];
    /**
     * Get cache values
     *
     * @returns {any[]}
     * @example cache.$values();
     */
    $values(): any[];
    /**
     * Get cache entries
     *
     * @returns {[string, any][]}
     * @example cache.$entries();
     */
    $entries(): [string, any][];
    /**
     * Get cache size
     *
     * @returns {number}
     * @example cache.$size;
     */
    $size: number;
    /**
     * For each cache
     *
     * @param {(value: any, key: string, map: Map<string, any>) => void} callbackfn Callback
     * @param {any} [thisArg] This
     * @returns {void}
     * @example cache.$forEach((value, key) => console.log(value, key));
     */
    $forEach(callbackfn: (value: any, key: string, map: Map<string, any>) => void, thisArg?: any): void;
    /**
     * Map cache
     *
     * @param {(value: any, key: string, map: Map<string, any>) => any} callbackfn Callback
     * @param {any} [thisArg] This
     * @returns {any[]}
     * @example cache.$map((value, key) => value + key);
     */
    $map(callbackfn: (value: any, key: string, map: Map<string, any>) => any, thisArg?: any): any[];
    /**
     * Filter cache
     *
     * @param {(value: any, key: string, map: Map<string, any>) => boolean} callbackfn Callback
     * @param {any} [thisArg] This
     * @returns {[string, any][]}
     * @example cache.$filter((value, key) => value === 'test');
     */
    $filter(callbackfn: (value: any, key: string, map: Map<string, any>) => boolean, thisArg?: any): [string, any][];
    /**
     * Find cache
     *
     * @param {(value: any, key: string, map: Map<string, any>) => boolean} callbackfn Callback
     * @param {any} [thisArg] This
     * @returns {[string, any]}
     * @example cache.$find((value, key) => value === 'test');
     */
    $find(callbackfn: (value: any, key: string, map: Map<string, any>) => boolean, thisArg?: any): [string, any];
    /**
     * Find with Nexorm Id
     *
     * @param {string} nexorm_id Nexorm Id
     * @returns {[string, any] | undefined}
     * @example cache.$findWithNexormId('nexorm_id');
     */
    $findWithNexormId(nexorm_id: string): [string, any] | undefined;
    /**
     * Some cache
     *
     * @param {(value: any, key: string, map: Map<string, any>) => boolean} callbackfn Callback
     * @param {any} [thisArg] This
     * @returns {boolean}
     * @example cache.$some((value, key) => value === 'test');
     */
    $some(callbackfn: (value: any, key: string, map: Map<string, any>) => boolean, thisArg?: any): boolean;
    /**
     * Every cache
     *
     * @param {(value: any, key: string, map: Map<string, any>) => boolean} callbackfn Callback
     * @param {any} [thisArg] This
     * @returns {boolean}
     * @example cache.$every((value, key) => value === 'test');
     */
    $every(callbackfn: (value: any, key: string, map: Map<string, any>) => boolean, thisArg?: any): boolean;
    /**
     * Reduce cache
     *
     * @param {(previousValue: any, currentValue: any, key: string, map: Map<string, any>) => any} callbackfn Callback
     * @param {any} [initialValue] Initial value
     * @returns {any}
     * @example cache.$reduce((previousValue, currentValue, key) => previousValue + currentValue, 0);
     */
    $reduce(callbackfn: (previousValue: any, currentValue: any, key: string, map: Map<string, any>) => any, initialValue?: any): any;
    /**
     * Sort cache
     *
     * @param {(a: [string, any], b: [string, any]) => number} callbackfn Callback
     * @returns {[string, any][]}
     * @example cache.$sort((a, b) => a[1] - b[1]);
     */
    $sort(callbackfn: (a: [string, any], b: [string, any]) => number): [string, any][];
    /**
     * First cache
     *
     * @returns {[string, any]}
     * @example cache.$first();
     */
    $first(): [string, any];
    /**
     * Last cache
     *
     * @returns {[string, any]}
     * @example cache.$last();
     */
    $last(): [string, any];
    /**
     * Random cache
     *
     * @returns {[string, any]}
     * @example cache.$random();
     */
    $random(): [string, any];
    /**
     * Merge cache
     *
     * @param {Map<string, any>} map Map
     * @returns {CacheManager}
     * @example cache.$merge(new Map([['key', 'value']]));
     */
    $merge(map: Map<string, any>): CacheManager;
    /**
     * To Object
     *
     * @returns {{ [key: string]: any }}
     * @example cache.$toObject();
     */
    $toObject(): {
        [key: string]: any;
    };
    /**
     * To JSON
     *
     * @returns {any[]}
     * @example cache.$toJSON();
     */
    $toJSON(): any[];
    /**
     * To String
     *
     * @returns {string}
     * @example cache.$toString();
     */
    $clone(): CacheManager;
    /**
     * To String
     *
     * @returns {string}
     * @example cache.$toString();
     */
    $toString(): string;
    /**
     * Reverse cache
     *
     * @returns {CacheManager}
     * @example cache.$reverse();
     */
    $reverse(): CacheManager;
}
