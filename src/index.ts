/**
 * R1 Create SDK
 * Unofficial community SDK for building R1/RabbitOS plugins
 * 
 * Features:
 * - Hardware access (accelerometer, touch, PTT, scroll)
 * - Secure/plain storage with Base64 encoding
 * - LLM interaction and messaging
 * - Optimized UI utilities for 240x282px display
 * - Media APIs (camera, microphone, speaker)
 * - Event-driven architecture
 * - Mobile performance optimizations
 */

// Type definitions
export * from './types';
export type { HardwareEventType } from './types';

// Hardware APIs
export {
  AccelerometerAPI,
  TouchAPI,
  HardwareEvents,
  accelerometer,
  touch,
  hardwareEvents,
  // New device controls
  DeviceControls,
  deviceControls,
  type DeviceControlsOptions,
  type ScrollWheelData,
  type SideButtonHandler,
  type ScrollWheelHandler
} from './hardware';

// Storage APIs
export {
  Base64Utils,
  R1Storage,
  storage
} from './storage';

// LLM and messaging APIs
export {
  R1Messaging,
  LLMHelpers,
  messaging,
  llmHelpers
} from './llm';

// UI utilities
export {
  CSSUtils,
  DOMUtils,
  LayoutUtils,
  PerformanceUtils,
  R1Component,
  R1_DIMENSIONS,
  // New UI design system
  R1UI,
  ui,
  type UIDimensions,
  type UIFontSizes,
  type UISpacing,
  type UIButtonSizes,
  type UIColorPalette,
  type UIContainerOptions,
  type UIButtonOptions,
  type UITextOptions,
  type UIGridOptions
} from './ui';

// Media APIs
export {
  CameraAPI,
  MicrophoneAPI,
  SpeakerAPI,
  MediaUtils,
  camera,
  microphone,
  speaker
} from './media';

// Import types and instances for internal use
import type { HardwareEventType } from './types';
import { 
  accelerometer, 
  touch, 
  hardwareEvents,
  deviceControls
} from './hardware';
import { storage, R1Storage } from './storage';
import { messaging, llmHelpers } from './llm';
import { R1_DIMENSIONS, ui } from './ui';
import { camera, microphone, speaker, MediaUtils } from './media';

/**
 * R1 SDK main class
 * Provides a unified interface to all R1 capabilities
 */
export class R1SDK {
  // Hardware access
  public readonly accelerometer = accelerometer;
  public readonly touch = touch;
  public readonly hardware = hardwareEvents;
  public readonly deviceControls = deviceControls;
  
  // Storage
  public readonly storage = storage;
  
  // LLM and messaging
  public readonly messaging = messaging;
  public readonly llm = llmHelpers;
  
  // Media
  public readonly camera = camera;
  public readonly microphone = microphone;
  public readonly speaker = speaker;

  // UI
  public readonly ui = ui;
  
  // Constants
  public readonly DIMENSIONS = R1_DIMENSIONS;

  /**
   * Initialize the SDK and check environment
   */
  async initialize(): Promise<void> {
    // Check if running in R1 environment
    if (typeof window === 'undefined') {
      throw new Error('R1 SDK must be used in a browser environment');
    }

    // Log SDK initialization
    console.log('R1 SDK initialized');
    console.log(`Display dimensions: ${R1_DIMENSIONS.width}x${R1_DIMENSIONS.height}px`);
    
    // Check available features
    const features = await this.getAvailableFeatures();
    console.log('Available features:', features);
  }

  /**
   * Get available R1 features
   */
  async getAvailableFeatures(): Promise<{
    storage: boolean;
    secureStorage: boolean;
    accelerometer: boolean;
    camera: boolean;
    microphone: boolean;
    speaker: boolean;
    messaging: boolean;
  }> {
    return {
      storage: R1Storage.isAvailable(),
      secureStorage: R1Storage.isSecureAvailable(),
      accelerometer: await this.accelerometer.isAvailable(),
      camera: await this.camera.isAvailable(),
      microphone: await this.microphone.isAvailable(),
      speaker: await MediaUtils.isSupported('speaker'),
      messaging: typeof PluginMessageHandler !== 'undefined'
    };
  }

  /**
   * Create a simple R1 plugin with common setup
   * @param config Plugin configuration
   */
  createPlugin(config: {
    onMount?: () => void;
    onUnmount?: () => void;
    onMessage?: (data: any) => void;
    onHardwareEvent?: (event: string) => void;
  }): R1Plugin {
    return new R1Plugin(config);
  }
}

/**
 * Simple plugin class for quick R1 app development
 */
export class R1Plugin {
  private mounted = false;

  constructor(private config: {
    onMount?: () => void;
    onUnmount?: () => void;
    onMessage?: (data: any) => void;
    onHardwareEvent?: (event: string) => void;
  }) {
    this.setupEventListeners();
  }

  mount(): void {
    if (this.mounted) return;
    
    this.mounted = true;
    this.config.onMount?.();
  }

  unmount(): void {
    if (!this.mounted) return;
    
    this.mounted = false;
    this.config.onUnmount?.();
  }

  private setupEventListeners(): void {
    // Setup message handling
    if (this.config.onMessage) {
      messaging.onMessage(this.config.onMessage);
    }

    // Setup hardware event handling
    if (this.config.onHardwareEvent) {
      const events: HardwareEventType[] = [
        'sideClick',
        'longPressStart',
        'longPressEnd',
        'scrollUp',
        'scrollDown'
      ];

      events.forEach(event => {
        hardwareEvents.on(event, () => {
          this.config.onHardwareEvent?.(event);
        });
      });
    }
  }
}

// Create and export default SDK instance
export const r1 = new R1SDK();

// Export convenience functions
export const initializeR1 = () => r1.initialize();

/**
 * Quick setup function for simple R1 plugins
 * @param setup Setup function that receives the SDK instance
 */
export const createR1App = (setup: (sdk: R1SDK) => void) => {
  document.addEventListener('DOMContentLoaded', async () => {
    await r1.initialize();
    setup(r1);
  });
};

// Default export
export default r1;