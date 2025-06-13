"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionManager = void 0;
const errorHandler_1 = __importDefault(require("../errorHandler"));
const fileInspector_1 = require("../fileInspector");
class ConnectionManager {
    static connections = {};
    static listeners = {};
    static connecting = {};
    static markConnected(provider) {
        this.connections[provider] = true;
        (this.listeners[provider] || []).forEach(cb => cb());
        this.listeners[provider] = [];
        this.connecting[provider] = false;
    }
    static markConnecting(provider) {
        if (this.connecting[provider])
            return;
        this.connecting[provider] = true;
    }
    ;
    static isConnecting(provider) {
        return !!this.connecting[provider];
    }
    static markDisconnected(provider) {
        this.connections[provider] = false;
    }
    static isConnected(provider) {
        return !!this.connections[provider];
    }
    static async connectIfNotConnected(provider) {
        if (this.isConnected(provider))
            return;
        if (this.isConnecting(provider)) {
            return this.waitUntilConnected(provider);
        }
        ;
        try {
            await (0, fileInspector_1.connect)(provider);
            this.markConnected(provider);
        }
        catch (error) {
            this.markDisconnected(provider);
            throw new errorHandler_1.default(`Failed to Connect to ‘${provider}’`, "#FF0000");
        }
        ;
    }
    ;
    static async waitUntilConnected(provider, timeoutMs = 5000) {
        if (this.isConnected(provider))
            return;
        return Promise.race([
            new Promise((resolve) => {
                if (!this.listeners[provider])
                    this.listeners[provider] = [];
                this.listeners[provider].push(resolve);
            }),
            new Promise((_, reject) => setTimeout(() => {
                reject(new errorHandler_1.default(`Connection to ‘${provider}’ timed out. Please check your network, configuration or enable $autoConnect.`, "#FF0000"));
            }, timeoutMs))
        ]);
    }
}
exports.ConnectionManager = ConnectionManager;
