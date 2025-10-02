/**
 * Hardware API module for R1 device access
 * Provides accelerometer, touch simulation, and hardware button events
 */

import type { AccelerometerData, AccelerometerOptions, TouchEvent, HardwareEventType } from '../types';

export class AccelerometerAPI {
  private isListening = false;
  private currentCallback?: (data: AccelerometerData) => void;

  /**
   * Check if accelerometer is available on the device
   */
  async isAvailable(): Promise<boolean> {
    return await window.creationSensors?.accelerometer?.isAvailable() ?? false;
  }

  /**
   * Start receiving accelerometer data
   * @param callback Function to handle accelerometer data
   * @param options Configuration options including frequency
   */
  start(callback: (data: AccelerometerData) => void, options?: AccelerometerOptions): void {
    if (this.isListening) {
      this.stop();
    }

    this.currentCallback = callback;
    this.isListening = true;

    if (window.creationSensors?.accelerometer) {
      window.creationSensors.accelerometer.start(callback, options);
    }
  }

  /**
   * Stop receiving accelerometer data
   */
  stop(): void {
    if (this.isListening && window.creationSensors?.accelerometer) {
      window.creationSensors.accelerometer.stop();
      this.isListening = false;
      this.currentCallback = undefined;
    }
  }

  /**
   * Check if currently listening for accelerometer data
   */
  isActive(): boolean {
    return this.isListening;
  }
}

export class TouchAPI {
  /**
   * Simulate a tap at specific coordinates
   * @param x X coordinate (0-240)
   * @param y Y coordinate (0-282)
   */
  tap(x: number, y: number): void {
    this.sendTouchEvent({ type: 'tap', x, y });
  }

  /**
   * Simulate touch down event
   * @param x X coordinate
   * @param y Y coordinate
   */
  touchDown(x: number, y: number): void {
    this.sendTouchEvent({ type: 'down', x, y });
  }

  /**
   * Simulate touch up event
   * @param x X coordinate
   * @param y Y coordinate
   */
  touchUp(x: number, y: number): void {
    this.sendTouchEvent({ type: 'up', x, y });
  }

  /**
   * Simulate touch move event
   * @param x X coordinate
   * @param y Y coordinate
   */
  touchMove(x: number, y: number): void {
    this.sendTouchEvent({ type: 'move', x, y });
  }

  /**
   * Cancel touch event
   * @param x X coordinate
   * @param y Y coordinate
   */
  touchCancel(x: number, y: number): void {
    this.sendTouchEvent({ type: 'cancel', x, y });
  }

  private sendTouchEvent(event: TouchEvent): void {
    if (typeof TouchEventHandler !== 'undefined') {
      TouchEventHandler.postMessage(JSON.stringify(event));
    }
  }
}

export class HardwareEvents {
  private listeners: Map<HardwareEventType, Set<() => void>> = new Map();

  constructor() {
    this.initializeEventListeners();
  }

  /**
   * Add event listener for hardware button events
   * @param event Event type to listen for
   * @param callback Function to call when event occurs
   */
  on(event: HardwareEventType, callback: () => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  /**
   * Remove event listener
   * @param event Event type
   * @param callback Function to remove
   */
  off(event: HardwareEventType, callback: () => void): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback);
    }
  }

  /**
   * Remove all listeners for an event type
   * @param event Event type to clear
   */
  removeAllListeners(event?: HardwareEventType): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }

  private initializeEventListeners(): void {
    // Only initialize in browser environment
    if (typeof window === 'undefined') return;
    
    // Side button (PTT) events
    window.addEventListener('sideClick', () => {
      this.emit('sideClick');
    });

    window.addEventListener('longPressStart', () => {
      this.emit('longPressStart');
    });

    window.addEventListener('longPressEnd', () => {
      this.emit('longPressEnd');
    });

    // Scroll wheel events
    window.addEventListener('scrollUp', () => {
      this.emit('scrollUp');
    });

    window.addEventListener('scrollDown', () => {
      this.emit('scrollDown');
    });
  }

  private emit(event: HardwareEventType): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback());
    }
  }
}

// Export singleton instances
export const accelerometer = new AccelerometerAPI();
export const touch = new TouchAPI();
export const hardwareEvents = new HardwareEvents();

// Re-export device controls
export { DeviceControls, deviceControls } from './device-controls';
export type { DeviceControlsOptions, ScrollWheelData, SideButtonHandler, ScrollWheelHandler } from './device-controls';