"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = defineConfig;
function defineConfig(config) {
    if (Array.isArray(config)) {
        return config;
    }
    else {
        return [config];
    }
}
;
