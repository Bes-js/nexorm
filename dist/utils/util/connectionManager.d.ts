export declare class ConnectionManager {
    private static connections;
    private static listeners;
    private static connecting;
    static markConnected(provider: string): void;
    static markConnecting(provider: string): void;
    static isConnecting(provider: string): boolean;
    static markDisconnected(provider: string): void;
    static isConnected(provider: string): boolean;
    static connectIfNotConnected(provider: string): Promise<void>;
    static waitUntilConnected(provider: string, timeoutMs?: number): Promise<void>;
}
