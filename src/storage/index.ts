/**
 * Storage API module for R1 plugin data persistence
 * Provides both plain and secure storage with automatic Base64 encoding
 */

import type { StorageAPI, CreationStorage } from '../types';

/**
 * Utility functions for Base64 encoding/decoding
 */
export class Base64Utils {
  /**
   * Encode data to Base64 string
   * @param data Data to encode (string or object)
   */
  static encode(data: any): string {
    const jsonString = typeof data === 'string' ? data : JSON.stringify(data);
    return btoa(jsonString);
  }

  /**
   * Decode Base64 string to data
   * @param encoded Base64 encoded string
   * @param parseJson Whether to parse as JSON (default: true)
   */
  static decode<T = any>(encoded: string, parseJson: boolean = true): T {
    const decoded = atob(encoded);
    return parseJson ? JSON.parse(decoded) : (decoded as T);
  }

  /**
   * Safely decode Base64 string, returns null if invalid
   * @param encoded Base64 encoded string
   * @param parseJson Whether to parse as JSON (default: true)
   */
  static safeDecode<T = any>(encoded: string | null, parseJson: boolean = true): T | null {
    if (!encoded) return null;
    
    try {
      const decoded = atob(encoded);
      return parseJson ? JSON.parse(decoded) : (decoded as T);
    } catch (error) {
      console.warn('Failed to decode storage data:', error);
      return null;
    }
  }
}

/**
 * Enhanced storage wrapper with automatic Base64 encoding and JSON support
 */
class StorageWrapper implements StorageAPI {
  constructor(private storage: StorageAPI) {}

  /**
   * Store data with automatic Base64 encoding
   * @param key Storage key
   * @param value Data to store (will be JSON stringified and Base64 encoded)
   */
  async setItem(key: string, value: any): Promise<void> {
    const encoded = Base64Utils.encode(value);
    await this.storage.setItem(key, encoded);
  }

  /**
   * Retrieve and decode data
   * @param key Storage key
   * @param parseJson Whether to parse as JSON (default: true)
   */
  async getItem<T = any>(key: string, parseJson: boolean = true): Promise<T | null> {
    const encoded = await this.storage.getItem(key);
    return Base64Utils.safeDecode<T>(encoded, parseJson);
  }

  /**
   * Remove item from storage
   * @param key Storage key
   */
  async removeItem(key: string): Promise<void> {
    await this.storage.removeItem(key);
  }

  /**
   * Clear all storage
   */
  async clear(): Promise<void> {
    await this.storage.clear();
  }

  /**
   * Store raw Base64 data (for manual encoding)
   * @param key Storage key
   * @param base64Value Base64 encoded string
   */
  async setRaw(key: string, base64Value: string): Promise<void> {
    await this.storage.setItem(key, base64Value);
  }

  /**
   * Get raw Base64 data (without decoding)
   * @param key Storage key
   */
  async getRaw(key: string): Promise<string | null> {
    return await this.storage.getItem(key);
  }
}

/**
 * Enhanced Creation Storage with Base64 utilities
 */
export class R1Storage {
  private _plain?: StorageWrapper;
  private _secure?: StorageWrapper;

  /**
   * Plain storage (unencrypted, Base64 encoded)
   */
  get plain(): StorageWrapper {
    if (!this._plain) {
      if (!window.creationStorage?.plain) {
        throw new Error('Plain storage not available. Make sure you are running in R1 environment.');
      }
      this._plain = new StorageWrapper(window.creationStorage.plain);
    }
    return this._plain;
  }

  /**
   * Secure storage (hardware-encrypted, Base64 encoded)
   * Requires Android M or higher
   */
  get secure(): StorageWrapper {
    if (!this._secure) {
      if (!window.creationStorage?.secure) {
        throw new Error('Secure storage not available. Make sure you are running on Android M+ in R1 environment.');
      }
      this._secure = new StorageWrapper(window.creationStorage.secure);
    }
    return this._secure;
  }

  /**
   * Check if storage is available
   */
  static isAvailable(): boolean {
    return typeof window !== 'undefined' && !!window.creationStorage;
  }

  /**
   * Check if secure storage is available
   */
  static isSecureAvailable(): boolean {
    return this.isAvailable() && !!window.creationStorage.secure;
  }

  /**
   * Utility to store user preferences with type safety
   * @param prefs User preferences object
   * @param useSecure Whether to use secure storage (default: false)
   */
  async setPreferences<T extends Record<string, any>>(prefs: T, useSecure: boolean = false): Promise<void> {
    const storage = useSecure ? this.secure : this.plain;
    await storage.setItem('user_preferences', prefs);
  }

  /**
   * Utility to get user preferences with type safety
   * @param useSecure Whether to use secure storage (default: false)
   */
  async getPreferences<T extends Record<string, any>>(useSecure: boolean = false): Promise<T | null> {
    const storage = useSecure ? this.secure : this.plain;
    return await storage.getItem<T>('user_preferences');
  }

  /**
   * Utility to store sensitive data (API keys, tokens, etc.)
   * @param key Storage key
   * @param value Sensitive data
   */
  async setSecret(key: string, value: string): Promise<void> {
    await this.secure.setItem(`secret_${key}`, value);
  }

  /**
   * Utility to get sensitive data
   * @param key Storage key
   */
  async getSecret(key: string): Promise<string | null> {
    return await this.secure.getItem<string>(`secret_${key}`, false);
  }
}

// Export singleton instance
export const storage = new R1Storage();