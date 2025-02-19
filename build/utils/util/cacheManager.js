"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
class CacheManager extends Map {
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
    $set(key, value, duration) {
        super.set(key, value);
        if (duration) {
            setTimeout(() => {
                this.delete(key);
            }, duration);
        }
        ;
        return this;
    }
    ;
    /**
     * Get a value from cache
     *
     * @param {string} key Key
     * @returns {any}
     * @example cache.$get('key');
     */
    $get(key) {
        return super.get(key);
    }
    ;
    /**
     * Delete a value from cache
     *
     * @param {string} key Key
     * @returns {boolean}
     * @example cache.$delete('key');
     */
    $delete(key) {
        return super.delete(key);
    }
    ;
    /**
     * Clear cache
     *
     * @returns {void}
     * @example cache.$clear();
     */
    $clear() {
        super.clear();
    }
    ;
    /**
     * Check if cache has a key
     *
     * @param {string} key Key
     * @returns {boolean}
     * @example cache.$has('key');
     */
    $has(key) {
        return super.has(key);
    }
    ;
    /**
     * Get cache keys
     *
     * @returns {string[]}
     * @example cache.$keys();
     */
    $keys() {
        return Array.from(super.keys());
    }
    ;
    /**
     * Get cache values
     *
     * @returns {any[]}
     * @example cache.$values();
     */
    $values() {
        return Array.from(super.values());
    }
    ;
    /**
     * Get cache entries
     *
     * @returns {[string, any][]}
     * @example cache.$entries();
     */
    $entries() {
        return Array.from(super.entries());
    }
    ;
    /**
     * Get cache size
     *
     * @returns {number}
     * @example cache.$size;
     */
    $size = super.size;
    /**
     * For each cache
     *
     * @param {(value: any, key: string, map: Map<string, any>) => void} callbackfn Callback
     * @param {any} [thisArg] This
     * @returns {void}
     * @example cache.$forEach((value, key) => console.log(value, key));
     */
    $forEach(callbackfn, thisArg) {
        super.forEach(callbackfn, thisArg);
    }
    ;
    /**
     * Map cache
     *
     * @param {(value: any, key: string, map: Map<string, any>) => any} callbackfn Callback
     * @param {any} [thisArg] This
     * @returns {any[]}
     * @example cache.$map((value, key) => value + key);
     */
    $map(callbackfn, thisArg) {
        return this.$entries().map(([key, value]) => callbackfn(value, key, this));
    }
    ;
    /**
     * Filter cache
     *
     * @param {(value: any, key: string, map: Map<string, any>) => boolean} callbackfn Callback
     * @param {any} [thisArg] This
     * @returns {[string, any][]}
     * @example cache.$filter((value, key) => value === 'test');
     */
    $filter(callbackfn, thisArg) {
        return this.$entries().filter(([key, value]) => callbackfn(value, key, this));
    }
    ;
    /**
     * Find cache
     *
     * @param {(value: any, key: string, map: Map<string, any>) => boolean} callbackfn Callback
     * @param {any} [thisArg] This
     * @returns {[string, any]}
     * @example cache.$find((value, key) => value === 'test');
     */
    $find(callbackfn, thisArg) {
        return this.$toJSON().find(([key, value]) => callbackfn(value, key, this));
    }
    ;
    /**
     * Find with Nexorm Id
     *
     * @param {string} nexorm_id Nexorm Id
     * @returns {[string, any] | undefined}
     * @example cache.$findWithNexormId('nexorm_id');
     */
    $findWithNexormId(nexorm_id) {
        return this.$toJSON().find(([key, value]) => value?.nexorm_id == nexorm_id) || undefined;
    }
    ;
    /**
     * Some cache
     *
     * @param {(value: any, key: string, map: Map<string, any>) => boolean} callbackfn Callback
     * @param {any} [thisArg] This
     * @returns {boolean}
     * @example cache.$some((value, key) => value === 'test');
     */
    $some(callbackfn, thisArg) {
        return this.$entries().some(([key, value]) => callbackfn(value, key, this));
    }
    ;
    /**
     * Every cache
     *
     * @param {(value: any, key: string, map: Map<string, any>) => boolean} callbackfn Callback
     * @param {any} [thisArg] This
     * @returns {boolean}
     * @example cache.$every((value, key) => value === 'test');
     */
    $every(callbackfn, thisArg) {
        return this.$entries().every(([key, value]) => callbackfn(value, key, this));
    }
    ;
    /**
     * Reduce cache
     *
     * @param {(previousValue: any, currentValue: any, key: string, map: Map<string, any>) => any} callbackfn Callback
     * @param {any} [initialValue] Initial value
     * @returns {any}
     * @example cache.$reduce((previousValue, currentValue, key) => previousValue + currentValue, 0);
     */
    $reduce(callbackfn, initialValue) {
        return this.$entries().reduce((previousValue, [key, currentValue]) => callbackfn(previousValue, currentValue, key, this), initialValue);
    }
    ;
    /**
     * Sort cache
     *
     * @param {(a: [string, any], b: [string, any]) => number} callbackfn Callback
     * @returns {[string, any][]}
     * @example cache.$sort((a, b) => a[1] - b[1]);
     */
    $sort(callbackfn) {
        return this.$entries().sort(callbackfn);
    }
    ;
    /**
     * First cache
     *
     * @returns {[string, any]}
     * @example cache.$first();
     */
    $first() {
        return this.$entries()[0];
    }
    ;
    /**
     * Last cache
     *
     * @returns {[string, any]}
     * @example cache.$last();
     */
    $last() {
        return this.$entries()[this.$size - 1];
    }
    ;
    /**
     * Random cache
     *
     * @returns {[string, any]}
     * @example cache.$random();
     */
    $random() {
        return this.$entries()[Math.floor(Math.random() * this.$size)];
    }
    ;
    /**
     * Merge cache
     *
     * @param {Map<string, any>} map Map
     * @returns {CacheManager}
     * @example cache.$merge(new Map([['key', 'value']]));
     */
    $merge(map) {
        map.forEach((value, key) => {
            this.set(key, value);
        });
        return this;
    }
    ;
    /**
     * To Object
     *
     * @returns {{ [key: string]: any }}
     * @example cache.$toObject();
     */
    $toObject() {
        return Object.fromEntries(this.$entries());
    }
    ;
    /**
     * To JSON
     *
     * @returns {any[]}
     * @example cache.$toJSON();
     */
    $toJSON() {
        return [...this.$entries()];
    }
    ;
    /**
     * To String
     *
     * @returns {string}
     * @example cache.$toString();
     */
    $clone() {
        return new CacheManager().$merge(this);
    }
    ;
    /**
     * To String
     *
     * @returns {string}
     * @example cache.$toString();
     */
    $toString() {
        return this.$toJSON().toString();
    }
    ;
    /**
     * Reverse cache
     *
     * @returns {CacheManager}
     * @example cache.$reverse();
     */
    $reverse() {
        return new CacheManager().$merge(new Map(this.$entries().reverse()));
    }
    ;
}
exports.default = CacheManager;
;
