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