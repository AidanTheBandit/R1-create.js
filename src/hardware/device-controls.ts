/**
 * Device Controls module for R1 hardware interaction
 * Provides convenient wrappers for scroll wheel and side button events
 */

export interface DeviceControlsOptions {
  sideButtonEnabled?: boolean;
  scrollWheelEnabled?: boolean;
  keyboardFallback?: boolean;
}

export interface ScrollWheelData {
  direction: 'up' | 'down';
  event?: Event;
}

export type SideButtonHandler = (event?: Event) => void;
export type ScrollWheelHandler = (data: ScrollWheelData) => void;

/**
 * Device Controls for R1 hardware (scroll wheel, side button)
 */
export class DeviceControls {
  private sideButtonEnabled = true;
  private scrollWheelEnabled = true;
  private eventListeners: Map<string, Set<Function>> = new Map();

  /**
   * Initialize device controls
   * @param options Configuration options
   */
  init(options: DeviceControlsOptions = {}): void {
    this.sideButtonEnabled = options.sideButtonEnabled ?? true;
    this.scrollWheelEnabled = options.scrollWheelEnabled ?? true;

    if (this.sideButtonEnabled) {
      this.setupSideButtonListener();
    }

    if (this.scrollWheelEnabled) {
      this.setupScrollWheelListener();
    }

    // Setup keyboard fallback for development
    if (options.keyboardFallback !== false) {
      this.setupKeyboardFallback();
    }
  }

  /**
   * Setup side button event listener
   */
  private setupSideButtonListener(): void {
    window.addEventListener('sideClick', (event) => {
      if (!this.sideButtonEnabled) return;

      this.handleSideButtonClick(event);
    });
  }

  /**
   * Setup scroll wheel event listener
   */
  private setupScrollWheelListener(): void {
    // Flutter sends scrollUp and scrollDown events instead of wheel events
    window.addEventListener('scrollUp', (event) => {
      if (!this.scrollWheelEnabled) return;
      this.handleScrollWheel({ direction: 'up', event });
    });

    window.addEventListener('scrollDown', (event) => {
      if (!this.scrollWheelEnabled) return;
      this.handleScrollWheel({ direction: 'down', event });
    });
  }

  /**
   * Setup keyboard fallback (space bar = side button)
   */
  private setupKeyboardFallback(): void {
    window.addEventListener('keydown', (event) => {
      if (event.code === 'Space') {
        event.preventDefault();
        const sideClickEvent = new CustomEvent('sideClick', {
          detail: { source: 'keyboard' }
        });
        window.dispatchEvent(sideClickEvent);
      }
    });
  }

  /**
   * Handle side button click
   * @param event The side click event
   */
  private handleSideButtonClick(event: Event): void {
    const handlers = this.eventListeners.get('sideButton') || new Set();
    handlers.forEach(handler => handler(event));
  }

  /**
   * Handle scroll wheel events
   * @param data The scroll data
   */
  private handleScrollWheel(data: ScrollWheelData): void {
    const handlers = this.eventListeners.get('scrollWheel') || new Set();

    handlers.forEach(handler => handler(data));
  }

  /**
   * Register event handler
   * @param eventType 'sideButton' or 'scrollWheel'
   * @param handler Event handler function
   */
  on(eventType: 'sideButton' | 'scrollWheel', handler: SideButtonHandler | ScrollWheelHandler): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set());
    }
    this.eventListeners.get(eventType)!.add(handler);
  }

  /**
   * Remove event handler
   * @param eventType 'sideButton' or 'scrollWheel'
   * @param handler Event handler function to remove
   */
  off(eventType: 'sideButton' | 'scrollWheel', handler: SideButtonHandler | ScrollWheelHandler): void {
    const handlers = this.eventListeners.get(eventType);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  /**
   * Enable or disable side button
   * @param enabled Enable state
   */
  setSideButtonEnabled(enabled: boolean): void {
    this.sideButtonEnabled = enabled;
  }

  /**
   * Enable or disable scroll wheel
   * @param enabled Enable state
   */
  setScrollWheelEnabled(enabled: boolean): void {
    this.scrollWheelEnabled = enabled;
  }

  /**
   * Simulate side button click (for testing)
   */
  triggerSideButton(): void {
    const event = new CustomEvent('sideClick', {
      detail: { source: 'programmatic' }
    });
    window.dispatchEvent(event);
  }

  /**
   * Check if side button is enabled
   */
  isSideButtonEnabled(): boolean {
    return this.sideButtonEnabled;
  }

  /**
   * Check if scroll wheel is enabled
   */
  isScrollWheelEnabled(): boolean {
    return this.scrollWheelEnabled;
  }

  /**
   * Get all registered event listeners for debugging
   */
  getEventListeners(): Record<string, number> {
    const result: Record<string, number> = {};
    this.eventListeners.forEach((handlers, eventType) => {
      result[eventType] = handlers.size;
    });
    return result;
  }
}

// Export singleton instance
export const deviceControls = new DeviceControls();