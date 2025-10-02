# Hardware Guide

Complete guide to accessing R1 device hardware features.

## 📋 Table of Contents

- [Device Specifications](#device-specifications)
- [Accelerometer](#accelerometer)
- [Touch Simulation](#touch-simulation)
- [Hardware Buttons](#hardware-buttons)
- [Device Controls](#device-controls)
- [Hardware Events](#hardware-events)
- [Development Simulation](#development-simulation)

## Device Specifications

### Physical Dimensions
- **Screen Size:** 240x282 pixels (portrait)
- **Aspect Ratio:** ~1.175:1
- **Display Technology:** LCD/TFT
- **Touch:** Capacitive touchscreen

### Hardware Components
- **Accelerometer:** 3-axis motion sensor
- **Buttons:** Side PTT button, scroll wheel
- **Audio:** Microphone, speaker
- **Camera:** Front and rear cameras
- **Storage:** Internal flash memory
- **Connectivity:** WiFi, Bluetooth, cellular

### Performance Characteristics
- **CPU:** ARM-based processor
- **Memory:** Limited RAM (optimize for performance)
- **Battery:** Extended use capability
- **Thermal:** Passive cooling

## Accelerometer

Access the device's built-in accelerometer for motion detection.

### Basic Usage

```typescript
import { r1 } from 'r1-create';

// Check availability
const available = await r1.accelerometer.isAvailable();
if (!available) {
  console.log('Accelerometer not supported');
  return;
}

// Start accelerometer with callback
r1.accelerometer.start((data) => {
  console.log(`X: ${data.x}, Y: ${data.y}, Z: ${data.z}`);
}, {
  frequency: 60  // Updates per second
});

// Stop accelerometer
r1.accelerometer.stop();
```

### Data Format

```typescript
interface AccelerometerData {
  x: number;  // -1 to 1 (left/right tilt)
  y: number;  // -1 to 1 (up/down tilt)
  z: number;  // -1 to 1 (forward/backward tilt)
}
```

### Configuration Options

```typescript
interface AccelerometerOptions {
  frequency?: number;  // Updates per second (default: 60)
}
```

### Practical Examples

#### Tilt Detection

```typescript
r1.accelerometer.start((data) => {
  const threshold = 0.2;

  if (Math.abs(data.x) > threshold) {
    if (data.x > 0) {
      console.log('Tilted right');
    } else {
      console.log('Tilted left');
    }
  }

  if (Math.abs(data.y) > threshold) {
    if (data.y > 0) {
      console.log('Tilted down');
    } else {
      console.log('Tilted up');
    }
  }
});
```

#### Motion Gesture Recognition

```typescript
let lastData = { x: 0, y: 0, z: 0 };
let gestureStart = Date.now();

r1.accelerometer.start((data) => {
  const deltaX = data.x - lastData.x;
  const deltaY = data.y - lastData.y;
  const deltaZ = data.z - lastData.z;

  // Detect shake gesture
  const totalMovement = Math.abs(deltaX) + Math.abs(deltaY) + Math.abs(deltaZ);
  if (totalMovement > 1.5) {
    console.log('Shake detected!');
  }

  lastData = { ...data };
});
```

#### Orientation Detection

```typescript
r1.accelerometer.start((data) => {
  // Simple orientation detection
  if (Math.abs(data.z) > 0.8) {
    if (data.z > 0) {
      console.log('Screen facing up');
    } else {
      console.log('Screen facing down');
    }
  } else if (Math.abs(data.y) > 0.8) {
    if (data.y > 0) {
      console.log('Portrait - bottom up');
    } else {
      console.log('Portrait - bottom down');
    }
  }
});
```

## Touch Simulation

Programmatically simulate touch events on the screen.

### Touch Methods

```typescript
// Single tap
r1.touch.tap(120, 141);  // Center of screen

// Touch down
r1.touch.touchDown(100, 100);

// Touch move
r1.touch.touchMove(120, 120);

// Touch up
r1.touch.touchUp(120, 120);
```

### Coordinate System

- **Origin:** Top-left corner (0, 0)
- **Width:** 0-240 pixels
- **Height:** 0-282 pixels
- **Center:** (120, 141)

### Practical Examples

#### Swipe Gesture

```typescript
function simulateSwipe(startX, startY, endX, endY, duration = 500) {
  r1.touch.touchDown(startX, startY);

  const steps = 10;
  const stepDuration = duration / steps;

  for (let i = 1; i <= steps; i++) {
    setTimeout(() => {
      const progress = i / steps;
      const currentX = startX + (endX - startX) * progress;
      const currentY = startY + (endY - startY) * progress;
      r1.touch.touchMove(currentX, currentY);

      if (i === steps) {
        r1.touch.touchUp(endX, endY);
      }
    }, stepDuration * i);
  }
}

// Swipe right
simulateSwipe(50, 141, 190, 141);
```

#### Tap Sequence

```typescript
function tapAtCoordinates(coords, delay = 100) {
  coords.forEach((coord, index) => {
    setTimeout(() => {
      r1.touch.tap(coord.x, coord.y);
    }, delay * index);
  });
}

// Tap multiple points
tapAtCoordinates([
  { x: 60, y: 71 },   // Top-left quadrant
  { x: 180, y: 71 },  // Top-right quadrant
  { x: 60, y: 211 },  // Bottom-left quadrant
  { x: 180, y: 211 }  // Bottom-right quadrant
]);
```

## Hardware Buttons

Access to physical buttons on the R1 device.

### Button Types

- **Side Button (PTT):** Main action button
- **Scroll Wheel:** Up/down scrolling

### Event Handling

```typescript
// Side button events
r1.hardware.on('sideClick', () => {
  console.log('Side button pressed');
});

r1.hardware.on('longPressStart', () => {
  console.log('Long press started');
});

r1.hardware.on('longPressEnd', () => {
  console.log('Long press ended');
});

// Scroll wheel events
r1.hardware.on('scrollUp', () => {
  console.log('Scrolled up');
});

r1.hardware.on('scrollDown', () => {
  console.log('Scrolled down');
});
```

### Event Types

```typescript
type HardwareEventType =
  | 'sideClick'        // Quick press of side button
  | 'longPressStart'   // Side button held down
  | 'longPressEnd'     // Side button released after long press
  | 'scrollUp'         // Scroll wheel rotated up
  | 'scrollDown';      // Scroll wheel rotated down
```

### Practical Examples

#### Button State Machine

```typescript
let buttonState = 'idle';
let pressStartTime = 0;

r1.hardware.on('longPressStart', () => {
  buttonState = 'longPressing';
  pressStartTime = Date.now();
  console.log('Recording started...');
});

r1.hardware.on('longPressEnd', () => {
  const pressDuration = Date.now() - pressStartTime;

  if (pressDuration > 1000) {
    console.log('Long press action');
  } else {
    console.log('Short press action');
  }

  buttonState = 'idle';
});

r1.hardware.on('sideClick', () => {
  if (buttonState === 'idle') {
    console.log('Quick press');
  }
});
```

#### Scroll Navigation

```typescript
let currentIndex = 0;
const items = ['Item 1', 'Item 2', 'Item 3', 'Item 4'];

r1.hardware.on('scrollUp', () => {
  currentIndex = Math.max(0, currentIndex - 1);
  console.log('Selected:', items[currentIndex]);
});

r1.hardware.on('scrollDown', () => {
  currentIndex = Math.min(items.length - 1, currentIndex + 1);
  console.log('Selected:', items[currentIndex]);
});

r1.hardware.on('sideClick', () => {
  console.log('Activated:', items[currentIndex]);
});
```

## Device Controls

Convenient wrapper for hardware event management.

### Initialization

```typescript
import { deviceControls } from 'r1-create';

deviceControls.init({
  sideButtonEnabled: true,
  scrollWheelEnabled: true,
  keyboardFallback: true  // Space bar simulates side button
});
```

### Event Registration

```typescript
// Side button
deviceControls.on('sideButton', (event) => {
  console.log('Side button pressed');
});

// Scroll wheel
deviceControls.on('scrollWheel', (data) => {
  console.log('Scrolled', data.direction); // 'up' or 'down'
});
```

### Control Management

```typescript
// Enable/disable controls
deviceControls.setSideButtonEnabled(false);
deviceControls.setScrollWheelEnabled(true);

// Check status
const sideEnabled = deviceControls.isSideButtonEnabled();
const scrollEnabled = deviceControls.isScrollWheelEnabled();

// Programmatic triggering
deviceControls.triggerSideButton();
```

### Advanced Example

```typescript
// Custom gesture recognition
let scrollCount = 0;
let lastScrollTime = 0;

deviceControls.on('scrollWheel', (data) => {
  const now = Date.now();
  scrollCount++;

  // Detect rapid scrolling
  if (now - lastScrollTime < 200) {
    if (scrollCount >= 3) {
      console.log('Rapid scroll detected!');
      scrollCount = 0;
    }
  } else {
    scrollCount = 1;
  }

  lastScrollTime = now;
});

// Context-sensitive actions
let mode = 'normal';

deviceControls.on('sideButton', () => {
  switch (mode) {
    case 'normal':
      console.log('Enter menu mode');
      mode = 'menu';
      break;
    case 'menu':
      console.log('Select item');
      mode = 'normal';
      break;
  }
});
```

## Hardware Events

Complete event system for hardware interactions.

### Event Listener Management

```typescript
// Add listener
const listener = () => console.log('Event fired');
r1.hardware.on('sideClick', listener);

// Remove listener
r1.hardware.off('sideClick', listener);
```

### Event Propagation

Hardware events follow this order:
1. **Raw Event** → Device firmware
2. **Flutter Layer** → R1 OS
3. **WebView** → Plugin environment
4. **SDK** → Your application

### Event Timing

- **sideClick:** Immediate on button release
- **longPressStart:** After ~500ms hold
- **longPressEnd:** On button release
- **scrollUp/Down:** Immediate on wheel movement

### Error Handling

```typescript
try {
  r1.hardware.on('sideClick', () => {
    // Handle event
  });
} catch (error) {
  console.error('Hardware event setup failed:', error);
}
```

## Development Simulation

Tools for testing hardware features during development.

### Keyboard Fallbacks

```typescript
// Device controls automatically provides keyboard fallbacks
deviceControls.init({
  keyboardFallback: true
});

// Space bar = side button
// Arrow keys = scroll wheel (can be implemented)
```

### Browser Developer Tools

1. **Console Testing:**
   ```javascript
   // Test accelerometer (won't work in browser)
   r1.accelerometer.isAvailable().then(console.log);

   // Test touch simulation
   r1.touch.tap(120, 141);
   ```

2. **Device Emulation:**
   - Open Chrome DevTools
   - Click device toolbar icon
   - Set dimensions to 240x282
   - Test responsive design

### Mock Hardware Events

```typescript
// For testing event handlers
function simulateHardwareEvent(eventType: string) {
  const event = new CustomEvent(eventType);
  window.dispatchEvent(event);
}

// Simulate side button press
simulateHardwareEvent('sideClick');
```

### Development Checklist

- [ ] Test on actual R1 device
- [ ] Verify touch coordinates (0-240, 0-282)
- [ ] Check accelerometer permissions
- [ ] Test audio playback after user interaction
- [ ] Verify storage availability
- [ ] Test LLM messaging in R1 environment

### Performance Considerations

1. **Event Throttling:**
   ```typescript
   // Throttle rapid events
   let lastEvent = 0;
   r1.hardware.on('scrollUp', () => {
     const now = Date.now();
     if (now - lastEvent > 100) {  // 100ms throttle
       // Handle event
       lastEvent = now;
     }
   });
   ```

2. **Memory Management:**
   ```typescript
   // Clean up event listeners
   const cleanup = () => {
     r1.accelerometer.stop();
     // Remove other listeners
   };

   // Call cleanup when plugin unmounts
   ```

3. **Battery Optimization:**
   ```typescript
   // Only enable accelerometer when needed
   function startMotionDetection() {
     r1.accelerometer.start(handleMotion);
   }

   function stopMotionDetection() {
     r1.accelerometer.stop();
   }
   ```

## Best Practices

### Hardware Access
1. **Check availability** before using features
2. **Handle permissions** gracefully
3. **Provide fallbacks** for unsupported features
4. **Clean up resources** when done

### User Experience
1. **Visual feedback** for button presses
2. **Audio confirmation** for actions
3. **Consistent behavior** across app
4. **Accessible controls** for all users

### Performance
1. **Throttle events** to prevent overload
2. **Debounce inputs** for better UX
3. **Monitor battery** usage
4. **Optimize animations** for small screen

### Error Handling
1. **Graceful degradation** when hardware unavailable
2. **User-friendly messages** for errors
3. **Retry mechanisms** for transient failures
4. **Logging** for debugging