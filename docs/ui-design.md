# UI Design Guide

Responsive design system and utilities for R1's 240x282px display.

## 📋 Table of Contents

- [Design Principles](#design-principles)
- [Viewport Setup](#viewport-setup)
- [Design Tokens](#design-tokens)
- [Layout System](#layout-system)
- [Component Library](#component-library)
- [Responsive Design](#responsive-design)
- [Performance Optimization](#performance-optimization)
- [Accessibility](#accessibility)
- [Best Practices](#best-practices)

## Design Principles

### R1 Device Constraints

- **Screen Size:** 240x282 pixels (portrait)
- **Aspect Ratio:** ~1.175:1
- **Touch Interface:** Capacitive touchscreen
- **Performance:** Limited processing power
- **Context:** Mobile, always-on device

### Core Principles

1. **Clarity:** Simple, clear interfaces
2. **Efficiency:** Minimize interactions
3. **Performance:** Hardware-accelerated animations
4. **Consistency:** Unified design language
5. **Accessibility:** Usable by everyone

## Viewport Setup

### Proper Viewport Configuration

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <style>
        /* Prevent scrolling and zooming */
        body {
            margin: 0;
            padding: 0;
            overflow: hidden;
            touch-action: none;
        }
    </style>
</head>
<body>
    <!-- Your app content -->
</body>
</html>
```

### SDK Viewport Setup

```typescript
import { ui } from 'r1-create';

// Automatically setup proper viewport
ui.setupViewport();
```

## Design Tokens

### Color Palette

```typescript
import { ui } from 'r1-create';

const colors = ui.getColors();
console.log(colors);

/*
{
  primary: '#FE5F00',     // R1 Orange
  secondary: '#333333',   // Dark Gray
  background: '#000000',  // Black
  surface: '#111111',     // Dark Surface
  text: '#FFFFFF',        // White
  textSecondary: '#CCCCCC', // Light Gray
  error: '#FF4444',       // Red
  success: '#44FF44',     // Green
  warning: '#FFAA00'      // Orange
}
*/
```

### Typography Scale

```typescript
const fonts = ui.getFontSizes();
console.log(fonts);

/*
{
  title: '18px',    // Main headings
  large: '16px',    // Large text
  body: '14px',     // Body text
  small: '12px',    // Small text/captions
  tiny: '10px'      // Tiny text
}
*/
```

### Spacing Scale

```typescript
const spacing = ui.getSpacing();
console.log(spacing);

/*
{
  xs: '4px',   // Extra small
  sm: '8px',   // Small
  md: '16px',  // Medium
  lg: '24px',  // Large
  xl: '32px',  // Extra large
  xxl: '48px'  // Extra extra large
}
*/
```

### Button Sizes

```typescript
const buttonSizes = ui.getButtonSizes();
console.log(buttonSizes);

/*
{
  small: { height: '32px', padding: '8px 12px' },
  standard: { height: '44px', padding: '12px 16px' },
  wide: { height: '48px', padding: '14px 20px' }
}
*/
```

## Layout System

### Container Setup

```typescript
// Create main container
const container = document.createElement('div');
ui.createContainer(container, {
  background: '#000000',
  padding: ui.getSpacing().md
});

document.body.appendChild(container);
```

### Grid System

```typescript
// Create responsive grid
const grid = document.createElement('div');
ui.createGrid(grid, {
  columns: 2,
  gap: ui.getSpacing().md,
  align: 'center'
});

// Add items to grid
for (let i = 0; i < 4; i++) {
  const item = document.createElement('div');
  item.textContent = `Item ${i + 1}`;
  Object.assign(item.style, {
    padding: ui.getSpacing().md,
    background: ui.getColors().surface,
    borderRadius: '4px',
    textAlign: 'center'
  });
  grid.appendChild(item);
}

container.appendChild(grid);
```

### Flexbox Layouts

```typescript
// Vertical stack
const stack = document.createElement('div');
Object.assign(stack.style, {
  display: 'flex',
  flexDirection: 'column',
  gap: ui.getSpacing().md,
  height: '100vh',
  padding: ui.getSpacing().md
});

// Horizontal layout
const row = document.createElement('div');
Object.assign(row.style, {
  display: 'flex',
  flexDirection: 'row',
  gap: ui.getSpacing().sm,
  alignItems: 'center'
});
```

## Component Library

### Button Component

```typescript
// Create different button types
const primaryBtn = document.createElement('button');
ui.createButton(primaryBtn, {
  type: 'wide',
  background: ui.getColors().primary,
  color: ui.getColors().text
});
primaryBtn.textContent = 'Primary Action';

const secondaryBtn = document.createElement('button');
ui.createButton(secondaryBtn, {
  type: 'standard',
  background: ui.getColors().surface,
  color: ui.getColors().text
});
secondaryBtn.textContent = 'Secondary';

const smallBtn = document.createElement('button');
ui.createButton(smallBtn, {
  type: 'small',
  background: 'transparent',
  color: ui.getColors().textSecondary,
  border: `1px solid ${ui.getColors().textSecondary}`
});
smallBtn.textContent = 'Cancel';
```

### Text Component

```typescript
// Create styled text elements
const title = document.createElement('h1');
ui.createText(title, {
  size: 'title',
  color: ui.getColors().text,
  align: 'center',
  weight: 'bold'
});
title.textContent = 'Welcome to R1';

const body = document.createElement('p');
ui.createText(body, {
  size: 'body',
  color: ui.getColors().textSecondary,
  align: 'left',
  lineHeight: '1.4'
});
body.textContent = 'This is body text with proper styling.';

const caption = document.createElement('small');
ui.createText(caption, {
  size: 'small',
  color: ui.getColors().textSecondary,
  align: 'center',
  transform: 'uppercase'
});
caption.textContent = 'Caption text';
```

### Input Component

```typescript
// Create styled input
const input = document.createElement('input');
Object.assign(input.style, {
  width: '100%',
  padding: ui.getSpacing().md,
  fontSize: ui.getFontSizes().body,
  background: ui.getColors().surface,
  color: ui.getColors().text,
  border: `1px solid ${ui.getColors().textSecondary}`,
  borderRadius: '4px',
  outline: 'none'
});

input.placeholder = 'Enter text...';

// Focus styles
input.addEventListener('focus', () => {
  input.style.borderColor = ui.getColors().primary;
});

input.addEventListener('blur', () => {
  input.style.borderColor = ui.getColors().textSecondary;
});
```

### Card Component

```typescript
function createCard(title: string, content: string) {
  const card = document.createElement('div');
  Object.assign(card.style, {
    background: ui.getColors().surface,
    borderRadius: '8px',
    padding: ui.getSpacing().md,
    margin: ui.getSpacing().sm,
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
  });

  const cardTitle = document.createElement('h3');
  ui.createText(cardTitle, {
    size: 'large',
    color: ui.getColors().text,
    margin: `0 0 ${ui.getSpacing().sm} 0`
  });
  cardTitle.textContent = title;

  const cardContent = document.createElement('p');
  ui.createText(cardContent, {
    size: 'body',
    color: ui.getColors().textSecondary,
    margin: '0'
  });
  cardContent.textContent = content;

  card.appendChild(cardTitle);
  card.appendChild(cardContent);

  return card;
}
```

## Responsive Design

### Viewport Units

```typescript
// Use viewport width for responsive sizing
const responsiveWidth = ui.pxToVw(100); // "41.67vw"
const responsiveHeight = ui.pxToVh(50);  // "17.73vh"

element.style.width = responsiveWidth;
element.style.height = responsiveHeight;
```

### Breakpoint System

```typescript
// R1 doesn't have traditional breakpoints, but you can create responsive logic
function getResponsiveSize(baseSize: number): string {
  // Scale based on screen width
  const scale = window.innerWidth / 240; // R1 width as baseline
  const responsiveSize = Math.min(baseSize * scale, baseSize * 1.2); // Cap at 120%
  return `${responsiveSize}px`;
}

const button = document.createElement('button');
button.style.fontSize = getResponsiveSize(16);
```

### Touch-Friendly Sizing

```typescript
// Minimum touch target size: 44px
const MIN_TOUCH_SIZE = 44;

function createTouchFriendlyButton(text: string) {
  const button = document.createElement('button');
  Object.assign(button.style, {
    minWidth: `${MIN_TOUCH_SIZE}px`,
    minHeight: `${MIN_TOUCH_SIZE}px`,
    padding: ui.getSpacing().md,
    fontSize: ui.getFontSizes().body,
    background: ui.getColors().primary,
    color: ui.getColors().text,
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  });

  button.textContent = text;
  return button;
}
```

## Performance Optimization

### Hardware Acceleration

```typescript
import { CSSUtils } from 'r1-create';

// Use hardware-accelerated properties
CSSUtils.setTransform(element, 'translateX(10px)');
CSSUtils.setOpacity(element, 0.8);

// Hardware-accelerated animations
CSSUtils.addTransition(element, 'transform', 300, 'ease-out');
```

### DOM Optimization

```typescript
import { DOMUtils } from 'r1-create';

// Batch DOM operations
DOMUtils.batchOperations((fragment) => {
  for (let i = 0; i < 100; i++) {
    const div = document.createElement('div');
    div.textContent = `Item ${i}`;
    fragment.appendChild(div);
  }
}, container);
```

### Memory Management

```typescript
// Clean up event listeners
class UIComponent {
  private elements: HTMLElement[] = [];
  private listeners: Array<{element: HTMLElement, event: string, handler: Function}> = [];

  addElement(element: HTMLElement) {
    this.elements.push(element);
  }

  addListener(element: HTMLElement, event: string, handler: Function) {
    element.addEventListener(event, handler);
    this.listeners.push({ element, event, handler });
  }

  destroy() {
    // Remove all listeners
    this.listeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });

    // Clear references
    this.elements.forEach(element => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    });

    this.elements = [];
    this.listeners = [];
  }
}
```

## Accessibility

### Touch Targets

```typescript
// Ensure all interactive elements meet minimum size
const buttons = document.querySelectorAll('button');
buttons.forEach(button => {
  const rect = button.getBoundingClientRect();
  if (rect.width < 44 || rect.height < 44) {
    console.warn('Button too small for touch:', button);
  }
});
```

### Color Contrast

```typescript
// Check contrast ratios
function getContrastRatio(color1: string, color2: string): number {
  // Implementation for WCAG contrast calculation
  // Return ratio between 1-21
  return 4.5; // Placeholder
}

const textContrast = getContrastRatio(
  ui.getColors().text,
  ui.getColors().background
);

if (textContrast < 4.5) {
  console.warn('Text contrast too low');
}
```

### Focus Management

```typescript
// Manage focus for keyboard navigation
class FocusManager {
  private focusableElements: HTMLElement[] = [];

  addFocusable(element: HTMLElement) {
    this.focusableElements.push(element);
    element.tabIndex = 0;
  }

  focusNext() {
    const currentIndex = this.focusableElements.indexOf(document.activeElement as HTMLElement);
    const nextIndex = (currentIndex + 1) % this.focusableElements.length;
    this.focusableElements[nextIndex].focus();
  }

  focusPrevious() {
    const currentIndex = this.focusableElements.indexOf(document.activeElement as HTMLElement);
    const prevIndex = currentIndex <= 0 ? this.focusableElements.length - 1 : currentIndex - 1;
    this.focusableElements[prevIndex].focus();
  }
}
```

### Screen Reader Support

```typescript
// Add ARIA labels
const button = document.createElement('button');
button.setAttribute('aria-label', 'Play audio');
button.setAttribute('role', 'button');

// Announce dynamic content
function announceToScreenReader(message: string) {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.style.position = 'absolute';
  announcement.style.left = '-10000px';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}
```

## Best Practices

### Layout Principles

1. **Single Column:** Use single-column layouts for simplicity
2. **Touch First:** Design for touch interaction primarily
3. **Thumb Zone:** Place important controls in thumb-reachable areas
4. **Progressive Disclosure:** Show information progressively

```typescript
// Single column layout
const layout = document.createElement('div');
Object.assign(layout.style, {
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  padding: ui.getSpacing().md,
  gap: ui.getSpacing().md
});

// Thumb-friendly button placement
const primaryAction = document.createElement('div');
Object.assign(primaryAction.style, {
  position: 'fixed',
  bottom: ui.getSpacing().lg,
  left: ui.getSpacing().md,
  right: ui.getSpacing().md
});
```

### Visual Hierarchy

1. **Size:** Use font sizes to establish hierarchy
2. **Color:** Use color sparingly for emphasis
3. **Spacing:** Use spacing to group related elements
4. **Typography:** Limit to 2-3 font sizes

```typescript
// Visual hierarchy example
const header = document.createElement('header');
ui.createText(header, { size: 'title', weight: 'bold' });

const section = document.createElement('section');
ui.createText(section, { size: 'large', color: ui.getColors().text });

const content = document.createElement('p');
ui.createText(content, { size: 'body', color: ui.getColors().textSecondary });

const caption = document.createElement('small');
ui.createText(caption, { size: 'small', color: ui.getColors().textSecondary });
```

### Animation Guidelines

1. **Purposeful:** Animations should serve a purpose
2. **Fast:** Keep animations under 300ms
3. **Hardware Accelerated:** Use transform and opacity
4. **Consistent:** Use consistent timing functions

```typescript
// Good animations
function slideIn(element: HTMLElement) {
  CSSUtils.setTransform(element, 'translateX(100%)');
  CSSUtils.setOpacity(element, 0);

  // Trigger animation
  requestAnimationFrame(() => {
    CSSUtils.addTransition(element, 'transform', 300, 'ease-out');
    CSSUtils.addTransition(element, 'opacity', 300, 'ease-out');
    CSSUtils.setTransform(element, 'translateX(0)');
    CSSUtils.setOpacity(element, 1);
  });
}
```

### Error States

1. **Clear Messages:** Use simple, clear error messages
2. **Recovery Actions:** Provide ways to recover from errors
3. **Non-blocking:** Don't block the entire interface
4. **Temporary:** Show errors temporarily

```typescript
function showError(message: string, action?: () => void) {
  const errorDiv = document.createElement('div');
  Object.assign(errorDiv.style, {
    position: 'fixed',
    top: ui.getSpacing().md,
    left: ui.getSpacing().md,
    right: ui.getSpacing().md,
    background: ui.getColors().error,
    color: ui.getColors().text,
    padding: ui.getSpacing().md,
    borderRadius: '4px',
    zIndex: '1000'
  });

  errorDiv.textContent = message;

  if (action) {
    const retryBtn = document.createElement('button');
    ui.createButton(retryBtn, { type: 'small' });
    retryBtn.textContent = 'Retry';
    retryBtn.onclick = action;
    errorDiv.appendChild(retryBtn);
  }

  document.body.appendChild(errorDiv);

  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (errorDiv.parentNode) {
      errorDiv.parentNode.removeChild(errorDiv);
    }
  }, 5000);
}
```

### Testing Checklist

- [ ] **Screen Fit:** All content fits within 240x282px
- [ ] **Touch Targets:** All interactive elements ≥44px
- [ ] **Contrast:** Text meets WCAG AA standards
- [ ] **Performance:** No janky animations or slow interactions
- [ ] **Responsiveness:** Works across different viewport sizes
- [ ] **Accessibility:** Screen reader compatible
- [ ] **Error Handling:** Graceful error states
- [ ] **Loading States:** Appropriate loading indicators

## Examples

### Complete App Layout

```typescript
import { r1, ui } from 'r1-create';

class R1App {
  private container: HTMLElement;

  constructor() {
    this.container = document.createElement('div');
    ui.createContainer(this.container);
    document.body.appendChild(this.container);
    this.render();
  }

  private render() {
    // Header
    const header = document.createElement('header');
    Object.assign(header.style, {
      textAlign: 'center',
      marginBottom: ui.getSpacing().lg
    });

    const title = document.createElement('h1');
    ui.createText(title, { size: 'title' });
    title.textContent = 'My R1 App';
    header.appendChild(title);

    // Main content
    const main = document.createElement('main');
    Object.assign(main.style, {
      flex: '1',
      display: 'flex',
      flexDirection: 'column',
      gap: ui.getSpacing().md
    });

    // Action buttons
    const buttonRow = document.createElement('div');
    Object.assign(buttonRow.style, {
      display: 'flex',
      gap: ui.getSpacing().sm
    });

    const speakBtn = document.createElement('button');
    ui.createButton(speakBtn, { type: 'wide' });
    speakBtn.textContent = 'Speak';
    speakBtn.onclick = () => r1.messaging.speakText('Hello from R1!');

    const llmBtn = document.createElement('button');
    ui.createButton(llmBtn, { type: 'standard' });
    llmBtn.textContent = 'Ask AI';
    llmBtn.onclick = () => r1.llm.askLLMSpeak('Tell me a joke');

    buttonRow.appendChild(speakBtn);
    buttonRow.appendChild(llmBtn);

    // Status area
    const status = document.createElement('div');
    ui.createText(status, { size: 'small', align: 'center' });
    status.textContent = 'Ready';

    // Footer
    const footer = document.createElement('footer');
    Object.assign(footer.style, {
      marginTop: 'auto',
      textAlign: 'center'
    });

    const version = document.createElement('small');
    ui.createText(version, { size: 'tiny', color: ui.getColors().textSecondary });
    version.textContent = 'v1.2.0';
    footer.appendChild(version);

    // Assemble
    main.appendChild(buttonRow);
    main.appendChild(status);

    this.container.appendChild(header);
    this.container.appendChild(main);
    this.container.appendChild(footer);
  }
}

// Initialize
await r1.initialize();
new R1App();
```

### Theme System

```typescript
class ThemeManager {
  private themes = {
    light: {
      background: '#FFFFFF',
      surface: '#F5F5F5',
      text: '#000000',
      textSecondary: '#666666',
      primary: '#007AFF'
    },
    dark: {
      background: '#000000',
      surface: '#111111',
      text: '#FFFFFF',
      textSecondary: '#CCCCCC',
      primary: '#FE5F00'
    }
  };

  private currentTheme = 'dark';

  applyTheme(themeName: string) {
    this.currentTheme = themeName;
    const theme = this.themes[themeName];

    Object.entries(theme).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--color-${key}`, value);
    });
  }

  getCurrentTheme() {
    return this.themes[this.currentTheme];
  }
}

const themeManager = new ThemeManager();
themeManager.applyTheme('dark');
```

This comprehensive UI design guide provides everything you need to create beautiful, performant, and accessible interfaces for the R1 device. Remember to always test on actual R1 hardware for the best experience.