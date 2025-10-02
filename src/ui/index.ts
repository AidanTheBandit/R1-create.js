/**
 * UI utilities module for R1 display optimization
 * Provides tools for 240x282px display, hardware-accelerated CSS, and DOM optimization
 */

import type { R1Dimensions } from '../types';

export const R1_DIMENSIONS: R1Dimensions = {
  width: 240,
  height: 282
};

/**
 * CSS utilities for hardware-accelerated animations and R1 optimization
 */
export class CSSUtils {
  /**
   * Apply hardware-accelerated transform
   * @param element Target element
   * @param transform Transform value (e.g., 'translateX(10px)')
   */
  static setTransform(element: HTMLElement, transform: string): void {
    element.style.transform = transform;
    element.style.willChange = 'transform';
  }

  /**
   * Apply hardware-accelerated opacity
   * @param element Target element
   * @param opacity Opacity value (0-1)
   */
  static setOpacity(element: HTMLElement, opacity: number): void {
    element.style.opacity = opacity.toString();
    element.style.willChange = 'opacity';
  }

  /**
   * Reset will-change property to optimize performance
   * @param element Target element
   */
  static resetWillChange(element: HTMLElement): void {
    element.style.willChange = 'auto';
  }

  /**
   * Add hardware-accelerated transition
   * @param element Target element
   * @param property CSS property to transition
   * @param duration Duration in milliseconds
   * @param easing Easing function (default: ease-out)
   */
  static addTransition(
    element: HTMLElement,
    property: string,
    duration: number,
    easing: string = 'ease-out'
  ): void {
    element.style.transition = `${property} ${duration}ms ${easing}`;
  }

  /**
   * Create optimized CSS animation class
   * @param name Animation name
   * @param keyframes CSS keyframes
   * @param duration Duration in milliseconds
   * @param easing Easing function
   */
  static createAnimation(
    name: string,
    keyframes: string,
    duration: number,
    easing: string = 'ease-out'
  ): void {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes ${name} {
        ${keyframes}
      }
      .${name} {
        animation: ${name} ${duration}ms ${easing};
      }
    `;
    document.head.appendChild(style);
  }
}

/**
 * DOM optimization utilities for minimal DOM changes
 */
export class DOMUtils {
  private static documentFragment: DocumentFragment | null = null;

  /**
   * Batch DOM operations using DocumentFragment
   * @param operations Function containing DOM operations
   * @param container Container element to append fragment to
   */
  static batchOperations(operations: (fragment: DocumentFragment) => void, container: HTMLElement): void {
    const fragment = document.createDocumentFragment();
    operations(fragment);
    container.appendChild(fragment);
  }

  /**
   * Efficiently update element content without full innerHTML replacement
   * @param element Target element
   * @param content New content
   */
  static updateContent(element: HTMLElement, content: string): void {
    if (element.textContent !== content) {
      element.textContent = content;
    }
  }

  /**
   * Toggle class efficiently
   * @param element Target element
   * @param className Class name to toggle
   * @param condition Optional condition for toggle
   */
  static toggleClass(element: HTMLElement, className: string, condition?: boolean): void {
    if (condition !== undefined) {
      element.classList.toggle(className, condition);
    } else {
      element.classList.toggle(className);
    }
  }

  /**
   * Create element with optimized attributes
   * @param tagName Element tag name
   * @param attributes Element attributes
   * @param textContent Optional text content
   */
  static createElement<K extends keyof HTMLElementTagNameMap>(
    tagName: K,
    attributes: Record<string, string> = {},
    textContent?: string
  ): HTMLElementTagNameMap[K] {
    const element = document.createElement(tagName);
    
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });

    if (textContent !== undefined) {
      element.textContent = textContent;
    }

    return element;
  }

  /**
   * Debounce function for reducing DOM updates
   * @param func Function to debounce
   * @param delay Delay in milliseconds
   */
  static debounce<T extends (...args: any[]) => any>(func: T, delay: number): T {
    let timeoutId: NodeJS.Timeout;
    return ((...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(null, args), delay);
    }) as T;
  }
}

/**
 * Layout utilities for R1 display
 */
export class LayoutUtils {
  /**
   * Check if coordinates are within R1 display bounds
   * @param x X coordinate
   * @param y Y coordinate
   */
  static isWithinBounds(x: number, y: number): boolean {
    return x >= 0 && x <= R1_DIMENSIONS.width && y >= 0 && y <= R1_DIMENSIONS.height;
  }

  /**
   * Clamp coordinates to R1 display bounds
   * @param x X coordinate
   * @param y Y coordinate
   */
  static clampToBounds(x: number, y: number): { x: number; y: number } {
    return {
      x: Math.max(0, Math.min(x, R1_DIMENSIONS.width)),
      y: Math.max(0, Math.min(y, R1_DIMENSIONS.height))
    };
  }

  /**
   * Calculate responsive font size based on container
   * @param containerWidth Container width
   * @param baseSize Base font size in px
   * @param minSize Minimum font size in px
   * @param maxSize Maximum font size in px
   */
  static calculateFontSize(
    containerWidth: number,
    baseSize: number = 16,
    minSize: number = 12,
    maxSize: number = 24
  ): number {
    const ratio = containerWidth / R1_DIMENSIONS.width;
    const scaledSize = baseSize * ratio;
    return Math.max(minSize, Math.min(scaledSize, maxSize));
  }

  /**
   * Create CSS for R1-optimized container
   */
  static createR1Container(): string {
    return `
      width: ${R1_DIMENSIONS.width}px;
      height: ${R1_DIMENSIONS.height}px;
      max-width: 100vw;
      max-height: 100vh;
      overflow: hidden;
      position: relative;
      box-sizing: border-box;
    `;
  }

  /**
   * Apply R1 container styles to element
   * @param element Target element
   */
  static applyR1Container(element: HTMLElement): void {
    Object.assign(element.style, {
      width: `${R1_DIMENSIONS.width}px`,
      height: `${R1_DIMENSIONS.height}px`,
      maxWidth: '100vw',
      maxHeight: '100vh',
      overflow: 'hidden',
      position: 'relative',
      boxSizing: 'border-box'
    });
  }
}

/**
 * Performance monitoring utilities
 */
export class PerformanceUtils {
  private static performanceMarks: Map<string, number> = new Map();

  /**
   * Start performance measurement
   * @param name Measurement name
   */
  static startMeasure(name: string): void {
    this.performanceMarks.set(name, performance.now());
  }

  /**
   * End performance measurement and log result
   * @param name Measurement name
   * @param logToConsole Whether to log to console
   */
  static endMeasure(name: string, logToConsole: boolean = true): number {
    const startTime = this.performanceMarks.get(name);
    if (!startTime) {
      console.warn(`No start mark found for: ${name}`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.performanceMarks.delete(name);

    if (logToConsole) {
      console.log(`Performance [${name}]: ${duration.toFixed(2)}ms`);
    }

    return duration;
  }

  /**
   * Monitor frame rate
   * @param duration Duration to monitor in seconds
   * @param callback Callback with average FPS
   */
  static monitorFPS(duration: number, callback: (fps: number) => void): void {
    let frames = 0;
    const startTime = performance.now();

    const tick = () => {
      frames++;
      const currentTime = performance.now();
      const elapsed = (currentTime - startTime) / 1000;

      if (elapsed >= duration) {
        const fps = frames / elapsed;
        callback(fps);
      } else {
        requestAnimationFrame(tick);
      }
    };

    requestAnimationFrame(tick);
  }
}

/**
 * R1 UI Component base class
 */
export abstract class R1Component {
  protected element: HTMLElement;
  protected mounted = false;

  constructor(tagName: string = 'div', className?: string) {
    this.element = document.createElement(tagName);
    if (className) {
      this.element.className = className;
    }
  }

  /**
   * Mount component to container
   * @param container Container element
   */
  mount(container: HTMLElement): void {
    if (this.mounted) {
      console.warn('Component already mounted');
      return;
    }

    container.appendChild(this.element);
    this.mounted = true;
    this.onMount();
  }

  /**
   * Unmount component
   */
  unmount(): void {
    if (!this.mounted) return;

    if (this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    
    this.mounted = false;
    this.onUnmount();
  }

  /**
   * Get component element
   */
  getElement(): HTMLElement {
    return this.element;
  }

  /**
   * Check if component is mounted
   */
  isMounted(): boolean {
    return this.mounted;
  }

  protected abstract onMount(): void;
  protected abstract onUnmount(): void;
}

// UI Design Types
export interface UIDimensions {
  width: 240;
  height: 282;
}

export interface UIFontSizes {
  title: string;      // ~30px on 240px width
  large: string;      // ~24px
  body: string;       // ~20px
  small: string;      // ~15px
  tiny: string;       // ~12px
}

export interface UISpacing {
  xs: string;         // ~3px on 240px width
  sm: string;         // ~6px
  md: string;         // ~8px
  lg: string;         // ~12px
  xl: string;         // ~18px
  xxl: string;        // ~24px
}

export interface UIButtonSizes {
  wide: {
    width: string;
    height: string;
    fontSize: string;
  };
  standard: {
    width: string;
    height: string;
    fontSize: string;
  };
  small: {
    width: string;
    height: string;
    fontSize: string;
  };
  round: {
    width: string;
    height: string;
    borderRadius: string;
  };
}

export interface UIColorPalette {
  background: string;
  primary: string;
  secondary: string;
  disabled: string;
  text: {
    primary: string;
    secondary: string;
    disabled: string;
  };
  status: {
    success: string;
    error: string;
    warning: string;
    info: string;
  };
}

export interface UIContainerOptions {
  width?: string;
  height?: string;
  background?: string;
  padding?: string;
}

export interface UIButtonOptions {
  type?: keyof UIButtonSizes;
  background?: string;
  color?: string;
  borderRadius?: string;
  active?: boolean;
}

export interface UITextOptions {
  size?: keyof UIFontSizes;
  color?: string;
  align?: 'left' | 'center' | 'right';
  weight?: string;
}

export interface UIGridOptions {
  columns?: number;
  gap?: string;
  alignItems?: string;
  justifyItems?: string;
}

/**
 * UI design utilities for R1 device (responsive design system)
 */
export class R1UI {
  private screenWidth = 240;
  private screenHeight = 282;
  private aspectRatio = this.screenHeight / this.screenWidth;
  private baseUnit = 'vw';

  /**
   * Get screen dimensions
   */
  get dimensions(): UIDimensions {
    return {
      width: 240,
      height: 282
    };
  }

  /**
   * Convert pixels to viewport width units
   * @param px Pixel value
   */
  pxToVw(px: number): string {
    return `${(px / this.screenWidth) * 100}${this.baseUnit}`;
  }

  /**
   * Get responsive font sizes
   */
  getFontSizes(): UIFontSizes {
    return {
      title: '12.5vw',      // ~30px on 240px width
      large: '10vw',        // ~24px
      body: '8.33vw',       // ~20px
      small: '6.25vw',      // ~15px
      tiny: '5vw'           // ~12px
    };
  }

  /**
   * Get spacing values
   */
  getSpacing(): UISpacing {
    return {
      xs: '1.25vw',         // ~3px on 240px width
      sm: '2.5vw',          // ~6px
      md: '3.33vw',         // ~8px
      lg: '5vw',            // ~12px
      xl: '7.5vw',          // ~18px
      xxl: '10vw'           // ~24px
    };
  }

  /**
   * Get button dimensions
   */
  getButtonSizes(): UIButtonSizes {
    return {
      wide: {
        width: '80vw',    // ~192px on 240px width
        height: '15vw',   // ~36px
        fontSize: '8.33vw'
      },
      standard: {
        width: '45vw',    // ~108px on 240px width
        height: '15vw',   // ~36px
        fontSize: '8.33vw'
      },
      small: {
        width: '30vw',    // ~72px on 240px width
        height: '12vw',   // ~29px
        fontSize: '6.25vw'
      },
      round: {
        width: '20vw',    // ~48px on 240px width
        height: '20vw',   // ~48px
        borderRadius: '50%'
      }
    };
  }

  /**
   * Create a responsive container
   * @param element Container element
   * @param options Container options
   */
  createContainer(element: HTMLElement, options: UIContainerOptions = {}): void {
    const defaults = {
      width: '100vw',
      height: `${this.aspectRatio * 100}vw`,  // Maintains aspect ratio
      background: '#000000',
      padding: this.getSpacing().md
    };

    const settings = { ...defaults, ...options };

    Object.assign(element.style, {
      width: settings.width,
      height: settings.height,
      background: settings.background,
      padding: settings.padding,
      boxSizing: 'border-box',
      position: 'relative',
      overflow: 'hidden'
    });
  }

  /**
   * Create a touch-optimized button
   * @param button Button element
   * @param options Button options
   */
  createButton(button: HTMLElement, options: UIButtonOptions = {}): void {
    const sizes = this.getButtonSizes();
    const defaults = {
      type: 'wide' as keyof UIButtonSizes,
      background: '#FE5F00',
      color: '#FFFFFF',
      borderRadius: '50vw',
      active: true
    };

    const settings = { ...defaults, ...options };
    const size = sizes[settings.type];

    Object.assign(button.style, {
      width: size.width,
      height: size.height,
      fontSize: 'fontSize' in size ? size.fontSize : this.getFontSizes().body,
      background: settings.active ? settings.background : '#333333',
      color: settings.color,
      border: 'none',
      borderRadius: settings.borderRadius,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      fontWeight: 'bold',
      transition: 'all 0.2s ease',
      userSelect: 'none',
      WebkitTapHighlightColor: 'transparent'
    });

    // Add touch feedback
    button.addEventListener('touchstart', () => {
      button.style.transform = 'scale(0.95)';
    });

    button.addEventListener('touchend', () => {
      button.style.transform = 'scale(1)';
    });
  }

  /**
   * Create a responsive text element
   * @param element Text element
   * @param options Text options
   */
  createText(element: HTMLElement, options: UITextOptions = {}): void {
    const fonts = this.getFontSizes();
    const defaults = {
      size: 'body' as keyof UIFontSizes,
      color: '#FFFFFF',
      align: 'center' as const,
      weight: 'normal'
    };

    const settings = { ...defaults, ...options };

    Object.assign(element.style, {
      fontSize: fonts[settings.size],
      color: settings.color,
      textAlign: settings.align,
      fontWeight: settings.weight,
      lineHeight: '1.2',
      margin: '0',
      padding: '0'
    });
  }

  /**
   * Create a layout grid
   * @param container Container element
   * @param options Grid options
   */
  createGrid(container: HTMLElement, options: UIGridOptions = {}): void {
    const defaults = {
      columns: 2,
      gap: this.getSpacing().md,
      alignItems: 'center',
      justifyItems: 'center'
    };

    const settings = { ...defaults, ...options };

    Object.assign(container.style, {
      display: 'grid',
      gridTemplateColumns: `repeat(${settings.columns}, 1fr)`,
      gap: settings.gap,
      alignItems: settings.alignItems,
      justifyItems: settings.justifyItems,
      width: '100%',
      height: '100%'
    });
  }

  /**
   * Apply theme colors
   */
  getColors(): UIColorPalette {
    return {
      background: '#000000',
      primary: '#FE5F00',      // Orange
      secondary: '#FFFFFF',    // White
      disabled: '#333333',     // Dark gray
      text: {
        primary: '#FFFFFF',
        secondary: '#CCCCCC',
        disabled: '#666666'
      },
      status: {
        success: '#00FF00',
        error: '#FF0000',
        warning: '#FFAA00',
        info: '#0099FF'
      }
    };
  }

  /**
   * Apply viewport meta tag for proper scaling
   */
  setupViewport(): void {
    let viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
      viewport = document.createElement('meta');
      viewport.setAttribute('name', 'viewport');
      document.head.appendChild(viewport);
    }
    viewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no');
  }

  /**
   * Create animated transition between elements
   * @param fromElement Element to transition from
   * @param toElement Element to transition to
   * @param type Transition type: 'slide', 'fade', or 'none'
   * @param duration Duration in milliseconds
   */
  transition(fromElement: HTMLElement, toElement: HTMLElement, type: 'slide' | 'fade' | 'none' = 'slide', duration = 300): void {
    switch (type) {
      case 'slide':
        this.slideTransition(fromElement, toElement, duration);
        break;
      case 'fade':
        this.fadeTransition(fromElement, toElement, duration);
        break;
      case 'none':
        fromElement.style.display = 'none';
        toElement.style.display = 'block';
        break;
    }
  }

  /**
   * Slide transition effect
   * @private
   */
  private slideTransition(fromElement: HTMLElement, toElement: HTMLElement, duration: number): void {
    toElement.style.display = 'block';
    toElement.style.transform = 'translateX(100%)';
    toElement.style.transition = `transform ${duration}ms ease-in-out`;

    fromElement.style.transition = `transform ${duration}ms ease-in-out`;

    setTimeout(() => {
      fromElement.style.transform = 'translateX(-100%)';
      toElement.style.transform = 'translateX(0)';
    }, 10);

    setTimeout(() => {
      fromElement.style.display = 'none';
      fromElement.style.transform = '';
      fromElement.style.transition = '';
      toElement.style.transition = '';
    }, duration + 10);
  }

  /**
   * Fade transition effect
   * @private
   */
  private fadeTransition(fromElement: HTMLElement, toElement: HTMLElement, duration: number): void {
    toElement.style.display = 'block';
    toElement.style.opacity = '0';
    toElement.style.transition = `opacity ${duration}ms ease-in-out`;

    fromElement.style.transition = `opacity ${duration}ms ease-in-out`;

    setTimeout(() => {
      fromElement.style.opacity = '0';
      toElement.style.opacity = '1';
    }, 10);

    setTimeout(() => {
      fromElement.style.display = 'none';
      fromElement.style.opacity = '';
      fromElement.style.transition = '';
      toElement.style.transition = '';
    }, duration + 10);
  }
}

// Export singleton instance
export const ui = new R1UI();