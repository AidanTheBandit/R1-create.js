# API Reference

Complete API documentation for the R1 Create SDK.

## 📋 Table of Contents

- [R1SDK Class](#r1sdk-class)
- [Hardware APIs](#hardware-apis)
- [Messaging APIs](#messaging-apis)
- [Storage APIs](#storage-apis)
- [Media APIs](#media-apis)
- [UI APIs](#ui-apis)
- [Utility Classes](#utility-classes)

## R1SDK Class

The main SDK class providing unified access to all R1 features.

### Constructor

```typescript
const sdk = new R1SDK()
```

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `accelerometer` | `AccelerometerAPI` | Accelerometer sensor access |
| `touch` | `TouchAPI` | Touch simulation |
| `hardware` | `HardwareEvents` | Hardware event handling |
| `deviceControls` | `DeviceControls` | Device control wrapper |
| `storage` | `R1Storage` | Data persistence |
| `messaging` | `R1Messaging` | LLM communication |
| `llm` | `LLMHelpers` | LLM convenience methods |
| `camera` | `CameraAPI` | Camera control |
| `microphone` | `MicrophoneAPI` | Audio recording |
| `speaker` | `SpeakerAPI` | Audio playback |
| `ui` | `R1UI` | UI design utilities |
| `DIMENSIONS` | `R1Dimensions` | Screen dimensions |

### Methods

#### `initialize(): Promise<void>`

Initialize the SDK and check environment.

```typescript
await r1.initialize();
```

#### `getAvailableFeatures(): Promise<AvailableFeatures>`

Get information about available R1 features.

```typescript
const features = await r1.getAvailableFeatures();
// Returns: { storage: boolean, secureStorage: boolean, accelerometer: boolean, ... }
```

#### `createPlugin(config: R1PluginConfig): R1Plugin`

Create a simple plugin with common setup.

```typescript
const plugin = r1.createPlugin({
  onMount: () => console.log('Plugin mounted'),
  onMessage: (data) => console.log('Message:', data),
  onHardwareEvent: (event) => console.log('Event:', event)
});
```

## Hardware APIs

### AccelerometerAPI

Access to the device's accelerometer sensor.

#### `isAvailable(): Promise<boolean>`

Check if accelerometer is available.

```typescript
const available = await r1.accelerometer.isAvailable();
```

#### `start(callback: AccelerometerCallback, options?: AccelerometerOptions): void`

Start receiving accelerometer data.

```typescript
r1.accelerometer.start((data) => {
  console.log(`X: ${data.x}, Y: ${data.y}, Z: ${data.z}`);
}, { frequency: 60 });
```

#### `stop(): void`

Stop receiving accelerometer data.

```typescript
r1.accelerometer.stop();
```

### TouchAPI

Simulate touch events on the screen.

#### `tap(x: number, y: number): void`

Simulate a tap at coordinates.

```typescript
r1.touch.tap(120, 141); // Center of screen
```

#### `touchDown(x: number, y: number): void`

Simulate touch down.

```typescript
r1.touch.touchDown(100, 100);
```

#### `touchUp(x: number, y: number): void`

Simulate touch up.

```typescript
r1.touch.touchUp(100, 100);
```

#### `touchMove(x: number, y: number): void`

Simulate touch move.

```typescript
r1.touch.touchMove(120, 120);
```

### HardwareEvents

Handle hardware button and sensor events.

#### `on(event: HardwareEventType, callback: () => void): void`

Register event listener.

```typescript
r1.hardware.on('sideClick', () => console.log('PTT pressed'));
r1.hardware.on('scrollUp', () => console.log('Scroll up'));
r1.hardware.on('scrollDown', () => console.log('Scroll down'));
```

#### `off(event: HardwareEventType, callback: () => void): void`

Remove event listener.

```typescript
r1.hardware.off('sideClick', myCallback);
```

### DeviceControls

Convenient wrapper for hardware event management.

#### `init(options?: DeviceControlsOptions): void`

Initialize device controls.

```typescript
r1.deviceControls.init({
  sideButtonEnabled: true,
  scrollWheelEnabled: true,
  keyboardFallback: true
});
```

#### `on(event: 'sideButton' | 'scrollWheel', handler: Function): void`

Register event handler.

```typescript
r1.deviceControls.on('sideButton', () => console.log('Pressed'));
r1.deviceControls.on('scrollWheel', (data) => console.log(data.direction));
```

#### `setSideButtonEnabled(enabled: boolean): void`

Enable/disable side button.

```typescript
r1.deviceControls.setSideButtonEnabled(false);
```

#### `triggerSideButton(): void`

Programmatically trigger side button.

```typescript
r1.deviceControls.triggerSideButton();
```

## Messaging APIs

### R1Messaging

Core messaging and LLM communication.

#### `sendMessage(message: string, options?: MessageOptions): Promise<void>`

Send a message to the R1 system.

```typescript
await r1.messaging.sendMessage('Hello!', { useLLM: true });
```

#### `speakText(text: string, options?: MessageOptions): Promise<void>`

Convert text to speech without LLM processing.

```typescript
await r1.messaging.speakText('Hello world!');
```

#### `askLLM(message: string, options?: LLMOptions): Promise<void>`

Send message to LLM for processing.

```typescript
await r1.messaging.askLLM('What is the weather?', { wantsR1Response: true });
```

#### `askLLMSpeak(message: string, saveToJournal?: boolean): Promise<void>`

Ask LLM to generate and speak a response.

```typescript
await r1.messaging.askLLMSpeak('Tell me a joke', true);
```

#### `searchWeb(query: string, options?: MessageOptions): Promise<void>`

Search the web using SERP API.

```typescript
await r1.messaging.searchWeb('current weather in Tokyo');
```

#### `onMessage(callback: MessageHandler): void`

Register message response handler.

```typescript
r1.messaging.onMessage((response) => {
  console.log('Response:', response.message);
  if (response.parsedData) {
    console.log('Parsed data:', response.parsedData);
  }
});
```

### LLMHelpers

Convenience methods for common LLM operations.

#### `askLLMSpeak(message: string, saveToJournal?: boolean): Promise<void>`

Ask LLM to speak response.

```typescript
await r1.llm.askLLMSpeak('Hello!');
```

#### `textToSpeech(text: string, saveToJournal?: boolean): Promise<void>`

Convert text to speech.

```typescript
await r1.llm.textToSpeech('Hello world!');
```

#### `textToSpeechAudio(text: string, options?: SpeechSynthesisOptions): Promise<Blob | null>`

Generate audio file from text-to-speech using browser Web Speech API.

```typescript
const audioBlob = await r1.llm.textToSpeechAudio('Hello world', {
  voice: speechSynthesis.getVoices()[0],
  rate: 1.0,
  pitch: 1.0,
  volume: 0.8
});

if (audioBlob) {
  // Save or play the audio file
  const url = URL.createObjectURL(audioBlob);
  const audio = new Audio(url);
  audio.play();
}
```

**Note:** Currently returns `null` due to Web Speech API limitations. Advanced audio capture techniques (AudioWorklet, WebRTC) would be required for actual audio file generation.

#### `askLLMJSON(message: string, options?: LLMOptions): Promise<void>`

Request JSON response from LLM.

```typescript
await r1.llm.askLLMJSON('List 3 colors in JSON format');
```

#### `getUserMemories(): Promise<void>`

Get user memory/context information.

```typescript
await r1.llm.getUserMemories();
```

#### `analyzeData(prompt: string, data?: any): Promise<void>`

Analyze data with LLM.

```typescript
await r1.llm.analyzeData('Analyze this data', myData);
```

## Storage APIs

### R1Storage

Main storage interface with plain and secure storage.

#### Properties

| Property | Type | Description |
|----------|------|-------------|
| `plain` | `StorageWrapper` | Unencrypted storage |
| `secure` | `StorageWrapper` | Hardware-encrypted storage |

#### `isAvailable(): boolean`

Check if storage is available.

```typescript
if (R1Storage.isAvailable()) {
  // Storage available
}
```

#### `isSecureAvailable(): boolean`

Check if secure storage is available.

```typescript
if (R1Storage.isSecureAvailable()) {
  // Secure storage available
}
```

### StorageWrapper

Enhanced storage with automatic Base64 encoding.

#### `setItem(key: string, value: any): Promise<void>`

Store data (automatically encoded).

```typescript
await r1.storage.plain.setItem('user', { name: 'John', age: 30 });
```

#### `getItem<T>(key: string, parseJson?: boolean): Promise<T | null>`

Retrieve data (automatically decoded).

```typescript
const user = await r1.storage.plain.getItem('user');
// Returns: { name: 'John', age: 30 }
```

#### `removeItem(key: string): Promise<void>`

Remove item from storage.

```typescript
await r1.storage.plain.removeItem('user');
```

#### `clear(): Promise<void>`

Clear all storage.

```typescript
await r1.storage.plain.clear();
```

## Media APIs

### CameraAPI

Camera control and photo capture.

#### `isAvailable(): Promise<boolean>`

Check camera availability.

```typescript
const available = await r1.camera.isAvailable();
```

#### `start(config?: CameraConfig): Promise<MediaStream>`

Start camera stream.

```typescript
const stream = await r1.camera.start({ facingMode: 'user' });
```

#### `stop(): void`

Stop camera stream.

```typescript
r1.camera.stop();
```

#### `capturePhoto(width?: number, height?: number): Promise<Blob>`

Capture photo.

```typescript
const photo = await r1.camera.capturePhoto(240, 282);
```

#### `createVideoElement(): HTMLVideoElement`

Create video element for stream.

```typescript
const video = r1.camera.createVideoElement();
document.body.appendChild(video);
```

### MicrophoneAPI

Audio recording functionality.

#### `isAvailable(): Promise<boolean>`

Check microphone availability.

```typescript
const available = await r1.microphone.isAvailable();
```

#### `start(config?: AudioConfig): Promise<MediaStream>`

Start microphone stream.

```typescript
const stream = await r1.microphone.start({ sampleRate: 44100 });
```

#### `startRecording(options?: RecordingOptions): Promise<void>`

Start audio recording.

```typescript
await r1.microphone.startRecording({ mimeType: 'audio/webm' });
```

#### `stopRecording(): Promise<Blob>`

Stop recording and get audio blob.

```typescript
const audioBlob = await r1.microphone.stopRecording();
```

### SpeakerAPI

Audio playback functionality.

#### `play(source: string | Blob, volume?: number): Promise<void>`

Play audio from URL or blob.

```typescript
await r1.speaker.play(audioBlob);
await r1.speaker.play('sound.mp3', 0.8);
```

#### `playTone(frequency: number, duration: number, volume?: number): Promise<void>`

Play generated tone.

```typescript
await r1.speaker.playTone(440, 1000, 0.5); // A note for 1 second
```

#### `stop(): void`

Stop current playback.

```typescript
r1.speaker.stop();
```

#### `setVolume(volume: number): void`

Set playback volume.

```typescript
r1.speaker.setVolume(0.7);
```

## UI APIs

### R1UI

UI design system for R1's small screen.

#### `setupViewport(): void`

Setup proper viewport for R1 screen.

```typescript
r1.ui.setupViewport();
```

#### `pxToVw(px: number): string`

Convert pixels to viewport width units.

```typescript
const vw = r1.ui.pxToVw(30); // "12.5vw"
```

#### `getFontSizes(): UIFontSizes`

Get responsive font sizes.

```typescript
const fonts = r1.ui.getFontSizes();
// { title: '12.5vw', large: '10vw', body: '8.33vw', ... }
```

#### `getSpacing(): UISpacing`

Get spacing values.

```typescript
const spacing = r1.ui.getSpacing();
// { xs: '1.25vw', sm: '2.5vw', md: '3.33vw', ... }
```

#### `createContainer(element: HTMLElement, options?: UIContainerOptions): void`

Apply container styles.

```typescript
const container = document.getElementById('app');
r1.ui.createContainer(container, { background: '#000' });
```

#### `createButton(button: HTMLElement, options?: UIButtonOptions): void`

Create styled button.

```typescript
const button = document.createElement('button');
r1.ui.createButton(button, { type: 'wide' });
```

#### `createText(element: HTMLElement, options?: UITextOptions): void`

Apply text styles.

```typescript
const title = document.createElement('h1');
r1.ui.createText(title, { size: 'title', color: '#fff' });
```

## Utility Classes

### CSSUtils

Hardware-accelerated CSS utilities.

#### `setTransform(element: HTMLElement, transform: string): void`

Apply hardware-accelerated transform.

```typescript
CSSUtils.setTransform(element, 'translateX(10px)');
```

#### `setOpacity(element: HTMLElement, opacity: number): void`

Apply hardware-accelerated opacity.

```typescript
CSSUtils.setOpacity(element, 0.8);
```

#### `addTransition(element: HTMLElement, property: string, duration: number, easing?: string): void`

Add CSS transition.

```typescript
CSSUtils.addTransition(element, 'transform', 300, 'ease-out');
```

### DOMUtils

DOM manipulation utilities.

#### `batchOperations(operations: Function, container: HTMLElement): void`

Batch DOM operations for performance.

```typescript
DOMUtils.batchOperations((fragment) => {
  for (let i = 0; i < 10; i++) {
    const div = document.createElement('div');
    fragment.appendChild(div);
  }
}, container);
```

#### `debounce<T>(func: T, delay: number): T`

Debounce function calls.

```typescript
const debouncedSearch = DOMUtils.debounce((query) => {
  // Search logic
}, 300);
```

### LayoutUtils

Layout and positioning utilities.

#### `isWithinBounds(x: number, y: number): boolean`

Check if coordinates are within R1 screen bounds.

```typescript
const inBounds = LayoutUtils.isWithinBounds(120, 141);
```

#### `clampToBounds(x: number, y: number): {x: number, y: number}`

Clamp coordinates to screen bounds.

```typescript
const clamped = LayoutUtils.clampToBounds(300, 400);
// Returns: {x: 240, y: 282}
```

### PerformanceUtils

Performance monitoring utilities.

#### `startMeasure(name: string): void`

Start performance measurement.

```typescript
PerformanceUtils.startMeasure('render');
```

#### `endMeasure(name: string, logToConsole?: boolean): number`

End measurement and get duration.

```typescript
const duration = PerformanceUtils.endMeasure('render');
// Logs: "Performance [render]: 16.50ms"
```

#### `monitorFPS(duration: number, callback: (fps: number) => void): void`

Monitor frames per second.

```typescript
PerformanceUtils.monitorFPS(5, (fps) => {
  console.log(`Average FPS: ${fps}`);
});
```

## Type Definitions

### Core Types

```typescript
interface R1Dimensions {
  width: 240;
  height: 282;
}

interface AccelerometerData {
  x: number; // -1 to 1
  y: number; // -1 to 1
  z: number; // -1 to 1
}

interface PluginMessage {
  message: string;
  useLLM?: boolean;
  useSerpAPI?: boolean;
  wantsR1Response?: boolean;
  wantsJournalEntry?: boolean;
  pluginId?: string;
  imageBase64?: string;
}

type HardwareEventType = 'sideClick' | 'longPressStart' | 'longPressEnd' | 'scrollUp' | 'scrollDown';
```

### Configuration Types

```typescript
interface CameraConfig {
  facingMode?: 'user' | 'environment';
  width?: number;
  height?: number;
}

interface AudioConfig {
  sampleRate?: number;
  channelCount?: number;
  echoCancellation?: boolean;
  noiseSuppression?: boolean;
  autoGainControl?: boolean;
}

interface DeviceControlsOptions {
  sideButtonEnabled?: boolean;
  scrollWheelEnabled?: boolean;
  keyboardFallback?: boolean;
}
```

## Error Handling

All async methods can throw errors. Always wrap in try-catch:

```typescript
try {
  await r1.messaging.speakText('Hello!');
} catch (error) {
  console.error('Operation failed:', error.message);
}
```

## Environment Detection

Check feature availability before use:

```typescript
const features = await r1.getAvailableFeatures();

if (features.messaging) {
  await r1.messaging.speakText('Available');
}

if (features.camera) {
  await r1.camera.start();
}
```