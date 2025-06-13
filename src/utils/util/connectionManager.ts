import ErrorHandler from "../errorHandler";
import { connect } from "../fileInspector";

export class ConnectionManager {
    private static connections: Record<string, boolean> = {};
    private static listeners: Record<string, (() => void)[]> = {};
    private static connecting: Record<string, boolean> = {};
  
    static markConnected(provider: string) {
      this.connections[provider] = true;
      (this.listeners[provider] || []).forEach(cb => cb());
      this.listeners[provider] = [];
      this.connecting[provider] = false;
    }

    static markConnecting(provider: string) {
      if (this.connecting[provider]) return;
      this.connecting[provider] = true;
    };

    static isConnecting(provider: string) {
      return !!this.connecting[provider];
    }
  
    static markDisconnected(provider: string) {
      this.connections[provider] = false;
    }
  
    static isConnected(provider: string) {
      return !!this.connections[provider];
    }

    static async connectIfNotConnected(provider: string): Promise<void> {
        if (this.isConnected(provider)) return;
        if (this.isConnecting(provider)) {
            return this.waitUntilConnected(provider);
        };
        try {
            await connect(provider);
            this.markConnected(provider);
        } catch (error) {
            this.markDisconnected(provider);
            throw new ErrorHandler(`Failed to Connect to ‘${provider}’`, "#FF0000");
        };
    };
  
    static async waitUntilConnected(provider: string, timeoutMs: number = 5000): Promise<void> {
        if (this.isConnected(provider)) return;
    
        return Promise.race([
          new Promise<void>((resolve) => {
            if (!this.listeners[provider]) this.listeners[provider] = [];
            this.listeners[provider].push(resolve);
          }),
          new Promise<void>((_, reject) =>
            setTimeout(() => {
                reject(new ErrorHandler(`Connection to ‘${provider}’ timed out. Please check your network, configuration or enable $autoConnect.`, "#FF0000"));
            }, timeoutMs)
          )
        ]);
      }
  }