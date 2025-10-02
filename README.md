# R1 Create SDK

Unofficial community JavaScript/TypeScript SDK for building R1/RabbitOS plugins with full hardware access, AI integration, and mobile optimization.

## Features

- 🔧 **Hardware Access**: Accelerometer, touch simulation, PTT button, scroll wheel
- 💾 **Storage**: Secure and plain storage with automatic Base64 encoding
- 🤖 **LLM Integration**: Direct interaction with R1's AI system + text-to-speech
- 🌐 **Web Search**: SERP API integration for real-time information
- 📱 **Optimized UI**: Purpose-built for 240x282px display with hardware acceleration
- 🎨 **UI Design System**: Responsive components and design utilities
- 🎥 **Media APIs**: Camera, microphone, speaker with web standard compatibility
- 🎮 **Device Controls**: Convenient hardware event management
- ⚡ **Performance**: Minimal DOM operations, hardware-accelerated CSS
- 📦 **TypeScript**: Full type definitions and IntelliSense support

## Installation

```bash
npm install r1-create
```

## Quick Start

```typescript
import { r1, createR1App, deviceControls, ui } from 'r1-create';

// Simple setup
createR1App(async (sdk) => {
  console.log('R1 App initialized!');
  
  // Setup UI
  ui.setupViewport();
  
  // Setup device controls
  deviceControls.init();
  deviceControls.on('sideButton', () => {
    console.log('Side button clicked!');
  });
  
  // Text-to-speech
  await sdk.messaging.speakText('Hello from R1!');
  
  // Ask the LLM something
  await sdk.llm.askLLMSpeak('Hello, how are you today?');
});
```

## Core APIs

### Hardware

```typescript
// Accelerometer
await r1.accelerometer.start((data) => {
  console.log(`Tilt: x=${data.x}, y=${data.y}, z=${data.z}`);
});

// Touch simulation
r1.touch.tap(120, 141); // Center of screen

// Hardware buttons
r1.hardware.on('sideClick', () => console.log('PTT clicked'));
r1.hardware.on('scrollUp', () => console.log('Scroll up'));
```

### Storage

```typescript
// Store user preferences (automatically Base64 encoded)
await r1.storage.plain.setItem('theme', { dark: true, color: 'blue' });
const theme = await r1.storage.plain.getItem('theme');

// Secure storage for sensitive data
await r1.storage.secure.setItem('api_key', 'secret123');
const apiKey = await r1.storage.secure.getItem('api_key', false); // Get as string
```

### LLM Integration

```typescript
// Send message to LLM
await r1.messaging.sendMessage('What time is it?', { useLLM: true });

// Ask LLM to speak response
await r1.llm.askLLMSpeak('Tell me a joke', true); // Save to journal

// Direct text-to-speech (no LLM processing)
await r1.messaging.speakText('Hello world!');
await r1.llm.textToSpeech('This will be spoken directly');

// Web search with SERP API
await r1.messaging.searchWeb('current weather in Tokyo');

// Send message with plugin ID and image
await r1.messaging.sendMessage('Analyze this image', {
  useLLM: true,
  pluginId: 'image-analyzer',
  imageBase64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
});

// Get structured JSON response
await r1.llm.askLLMJSON('List 3 facts about rabbits in JSON format');

// Handle responses
r1.messaging.onMessage((response) => {
  if (response.parsedData) {
    console.log('Parsed response:', response.parsedData);
  }
});
```

### Media APIs

```typescript
// Camera
const stream = await r1.camera.start({ facingMode: 'user' });
const videoElement = r1.camera.createVideoElement();
document.body.appendChild(videoElement);

// Capture photo
const photo = r1.camera.capturePhoto(240, 282);

// Microphone
await r1.microphone.startRecording();
const audioBlob = await r1.microphone.stopRecording();

// Speaker
await r1.speaker.play(audioBlob);
await r1.speaker.playTone(440, 1000); // A note for 1 second
```

### UI Utilities

```typescript
import { LayoutUtils, CSSUtils, R1_DIMENSIONS } from 'r1-create';

// Create R1-optimized container
const container = document.createElement('div');
LayoutUtils.applyR1Container(container);

// Hardware-accelerated animations
CSSUtils.setTransform(element, 'translateX(10px)');
CSSUtils.addTransition(element, 'transform', 300);

// Screen dimensions
console.log(`Screen: ${R1_DIMENSIONS.width}x${R1_DIMENSIONS.height}px`);
```

### UI Design System

```typescript
import { ui } from 'r1-create';

// Setup viewport for proper scaling
ui.setupViewport();

// Create responsive button
const button = document.createElement('button');
ui.createButton(button, { type: 'wide', background: '#FE5F00' });
button.textContent = 'Press Me';

// Create responsive text
const title = document.createElement('h1');
ui.createText(title, { size: 'title', color: '#FFFFFF' });
title.textContent = 'Welcome';

// Create grid layout
const grid = document.createElement('div');
ui.createGrid(grid, { columns: 2, gap: ui.getSpacing().md });

// Get design tokens
const colors = ui.getColors();
const fonts = ui.getFontSizes();
const spacing = ui.getSpacing();

// Convert pixels to viewport units
const vwValue = ui.pxToVw(30); // "12.5vw"
```

### Device Controls

```typescript
import { deviceControls } from 'r1-create';

// Initialize with options
deviceControls.init({
  sideButtonEnabled: true,
  scrollWheelEnabled: true,
  keyboardFallback: true // Space bar simulates side button
});

// Register event handlers
deviceControls.on('sideButton', (event) => {
  console.log('Side button pressed');
});

deviceControls.on('scrollWheel', (data) => {
  console.log('Scrolled', data.direction); // 'up' or 'down'
});

// Control enable/disable
deviceControls.setSideButtonEnabled(false);
deviceControls.setScrollWheelEnabled(true);

// Programmatic triggering (for testing)
deviceControls.triggerSideButton();
```

## Advanced Usage

### Custom Plugin Class

```typescript
import { R1Plugin } from 'r1-create';

const plugin = new R1Plugin({
  onMount: () => console.log('Plugin mounted'),
  onMessage: (data) => console.log('Received:', data),
  onHardwareEvent: (event) => console.log('Hardware event:', event)
});

plugin.mount();
```

### Performance Monitoring

```typescript
import { PerformanceUtils } from 'r1-create';

// Measure performance
PerformanceUtils.startMeasure('animation');
// ... do animation work
PerformanceUtils.endMeasure('animation');

// Monitor frame rate
PerformanceUtils.monitorFPS(5, (fps) => {
  console.log(`Average FPS: ${fps}`);
});
```

### Component Development

```typescript
import { R1Component } from 'r1-create';

class MyComponent extends R1Component {
  protected onMount(): void {
    this.element.innerHTML = `
      <div style="width: 240px; height: 282px;">
        <h1>My R1 Component</h1>
      </div>
    `;
  }

  protected onUnmount(): void {
    // Cleanup
  }
}

const component = new MyComponent();
component.mount(document.body);
```

## Device Specifications

- **Display**: 240x282px portrait
- **Hardware**: Accelerometer, PTT button, scroll wheel
- **Storage**: Secure (Android M+) and plain storage
- **Audio**: Microphone, speaker
- **Camera**: Front/back cameras
- **AI**: Full LLM integration

## Best Practices

1. **Optimize for Mobile**: Use hardware-accelerated CSS properties (`transform`, `opacity`)
2. **Minimize DOM Operations**: Use `DOMUtils.batchOperations()` for multiple changes
3. **Handle Storage Errors**: Always check if storage is available before use
4. **Audio Context**: Initialize audio on user interaction for browser compatibility
5. **Memory Management**: Clean up event listeners and media streams

## TypeScript Support

The SDK is built with TypeScript and includes comprehensive type definitions:

```typescript
import type { 
  AccelerometerData, 
  PluginMessage, 
  StorageAPI,
  HardwareEventType 
} from 'r1-create';
```

## Error Handling

```typescript
try {
  await r1.storage.secure.setItem('key', 'value');
} catch (error) {
  if (error.message.includes('not available')) {
    // Fallback to plain storage
    await r1.storage.plain.setItem('key', 'value');
  }
}
```

## Examples

See the [examples directory](./examples) for complete plugin examples:

- Basic Plugin Template
- Camera Photo App
- Voice Recorder
- Text-to-Speech App
- Web Search Integration
- Accelerometer Game
- LLM Chat Interface
- UI Design System Demo
- Device Controls Example

## API Reference

Full API documentation is available in the TypeScript definitions and inline JSDoc comments.

## License

Apache-2.0 - See [LICENSE](./LICENSE) file for details.

## Contributing

Contributions welcome! Please read our contributing guidelines and submit pull requests to our [GitHub repository](https://github.com/AidanTheBandit/R1-create.js).