# Getting Started with R1 Create SDK

This guide will help you get up and running with the R1 Create SDK in minutes.

## 📦 Installation

Install the SDK using npm:

```bash
npm install r1-create
```

Or using yarn:

```bash
yarn add r1-create
```

## 🚀 Quick Start

### Basic Setup

```typescript
import { r1, createR1App } from 'r1-create';

// Simple setup
createR1App(async (sdk) => {
  console.log('R1 App initialized!');

  // Listen for side button press
  sdk.hardware.on('sideClick', () => {
    console.log('Side button clicked!');
  });

  // Ask the LLM something
  await sdk.llm.askLLMSpeak('Hello, how are you today?');
});
```

### Manual Setup

```typescript
import { r1 } from 'r1-create';

// Initialize the SDK
await r1.initialize();

// Use the APIs
r1.hardware.on('sideClick', () => {
  console.log('Button pressed!');
});
```

## 🏗️ Project Structure

Create a basic HTML file for your R1 plugin:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My R1 Plugin</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background: #000;
            color: #fff;
            font-family: Arial, sans-serif;
        }
    </style>
</head>
<body>
    <div id="app">
        <h1>Hello R1!</h1>
        <button id="speak-btn">Speak</button>
    </div>

    <script type="module">
        import { r1 } from 'https://cdn.jsdelivr.net/npm/r1-create@latest/dist/index.js';

        // Initialize
        await r1.initialize();

        // Setup UI
        const speakBtn = document.getElementById('speak-btn');
        speakBtn.addEventListener('click', async () => {
            await r1.messaging.speakText('Hello from R1!');
        });

        // Hardware events
        r1.hardware.on('sideClick', () => {
            r1.messaging.speakText('Side button pressed!');
        });
    </script>
</body>
</html>
```

## 🎯 Core Concepts

### SDK Instance

The main `r1` instance provides access to all SDK features:

```typescript
import { r1 } from 'r1-create';

// Available APIs
r1.hardware     // Hardware access
r1.messaging    // LLM communication
r1.storage      // Data persistence
r1.camera       // Camera control
r1.microphone   // Audio recording
r1.speaker      // Audio playback
r1.ui           // UI utilities
```

### Asynchronous Operations

Many SDK operations are asynchronous:

```typescript
// Always await async operations
await r1.initialize();
await r1.messaging.speakText('Hello!');
await r1.storage.plain.setItem('key', 'value');
```

### Event Handling

Use the hardware API for device events:

```typescript
// Side button
r1.hardware.on('sideClick', () => {
    console.log('PTT pressed');
});

// Scroll wheel
r1.hardware.on('scrollUp', () => {
    console.log('Scrolled up');
});

r1.hardware.on('scrollDown', () => {
    console.log('Scrolled down');
});
```

## 📱 Development Environment

### Browser Development

For development without an R1 device, use Chrome DevTools:

1. Open your HTML file in Chrome
2. Open DevTools (F12)
3. Go to Device Toolbar (Ctrl+Shift+M)
4. Set dimensions to 240x282 pixels
5. Use keyboard shortcuts for hardware simulation

### Keyboard Shortcuts

- **Spacebar**: Simulates side button press
- **Arrow Keys**: Can simulate scroll wheel (custom implementation needed)

## 🔧 Basic Examples

### Text-to-Speech

```typescript
// Direct TTS (no LLM processing)
await r1.messaging.speakText('Hello world!');

// LLM-generated speech
await r1.llm.askLLMSpeak('Tell me a joke');
```

### Data Storage

```typescript
// Store user preferences
await r1.storage.plain.setItem('theme', { dark: true });

// Retrieve data
const theme = await r1.storage.plain.getItem('theme');
console.log(theme); // { dark: true }
```

### Camera Access

```typescript
// Start camera
const stream = await r1.camera.start({ facingMode: 'user' });

// Create video element
const video = r1.camera.createVideoElement();
document.body.appendChild(video);

// Take photo
const photoBlob = await r1.camera.capturePhoto(240, 282);
```

### UI Design

```typescript
import { ui } from 'r1-create';

// Setup viewport
ui.setupViewport();

// Create responsive button
const button = document.createElement('button');
ui.createButton(button, { type: 'wide' });
button.textContent = 'Click me!';
```

## 🐛 Error Handling

Always wrap SDK calls in try-catch blocks:

```typescript
try {
    await r1.messaging.speakText('Hello!');
} catch (error) {
    console.error('TTS failed:', error);
    // Fallback to console output
    console.log('Hello!');
}
```

## 📋 Environment Detection

Check if you're running in R1 environment:

```typescript
// Check available features
const features = await r1.getAvailableFeatures();
console.log('Messaging available:', features.messaging);
console.log('Camera available:', features.camera);

// Conditional feature usage
if (features.messaging) {
    await r1.messaging.speakText('Running on R1!');
} else {
    console.log('Running in browser mode');
}
```

## 🎯 Next Steps

- Explore the [API Reference](./api-reference.md) for detailed documentation
- Check out [Examples](./examples.md) for common use cases
- Learn about [Hardware Guide](./hardware.md) for device-specific features
- Read the [UI Design](./ui-design.md) guide for responsive design

## 🆘 Need Help?

- Check the [Troubleshooting](./troubleshooting.md) guide
- Search existing [GitHub Issues](https://github.com/AidanTheBandit/R1-create.js/issues)
- Create a new issue for bugs or feature requests