/**
 * Core types for R1/RabbitOS Plugin SDK
 */

// Hardware types
export interface AccelerometerData {
  x: number;  // -1 to 1: positive = tilt right, negative = tilt left
  y: number;  // -1 to 1: positive = tilt forward, negative = tilt back  
  z: number;  // -1 to 1: positive = facing up, negative = facing down
}

export interface AccelerometerOptions {
  frequency?: number; // Sampling frequency in Hz
}

export interface TouchEvent {
  type: 'tap' | 'down' | 'up' | 'move' | 'cancel';
  x: number;
  y: number;
}

// Storage types
export interface StorageAPI {
  setItem(key: string, value: string): Promise<void>;
  getItem(key: string): Promise<string | null>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
}

export interface CreationStorage {
  plain: StorageAPI;
  secure: StorageAPI;
}

// LLM and messaging types
export interface PluginMessage {
  message: string;
  useLLM?: boolean;
  useSerpAPI?: boolean;
  wantsR1Response?: boolean;
  wantsJournalEntry?: boolean;
  pluginId?: string;
  imageBase64?: string;
}

export interface PluginMessageResponse {
  message: string;
  pluginId: string;
  data?: string; // JSON string with response data
}

// UI types
export interface R1Dimensions {
  width: 240;
  height: 282;
}

// Event types
export type HardwareEventType = 
  | 'sideClick'
  | 'longPressStart' 
  | 'longPressEnd'
  | 'scrollUp'
  | 'scrollDown';

// Global interface extensions
declare global {
  interface Window {
    creationStorage: CreationStorage;
    creationSensors: {
      accelerometer: {
        isAvailable(): Promise<boolean>;
        start(callback: (data: AccelerometerData) => void, options?: AccelerometerOptions): void;
        stop(): void;
      };
    };
    onPluginMessage?: (data: PluginMessageResponse) => void;
  }

  // Global message handlers
  const PluginMessageHandler: {
    postMessage(message: string): void;
  };
  
  const closeWebView: {
    postMessage(message: string): void;
  };
  
  const TouchEventHandler: {
    postMessage(message: string): void;
  };
}

/**
 * Options for speech synthesis
 */
export interface SpeechSynthesisOptions {
  voice?: SpeechSynthesisVoice;
  rate?: number;    // 0.1 to 10
  pitch?: number;   // 0 to 2
  volume?: number;  // 0 to 1
}

export {};