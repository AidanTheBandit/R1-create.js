# Examples

Practical code examples for common R1 Create SDK use cases.

## 📋 Table of Contents

- [Basic Plugin](#basic-plugin)
- [Text-to-Speech App](#text-to-speech-app)
- [Camera Photo App](#camera-photo-app)
- [Voice Recorder](#voice-recorder)
- [Web Search Integration](#web-search-integration)
- [Hardware Game](#hardware-game)
- [UI Design Demo](#ui-design-demo)
- [Device Controls Example](#device-controls-example)

## Basic Plugin

A minimal R1 plugin that demonstrates core functionality.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Basic R1 Plugin</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background: #000;
            color: #fff;
            font-family: Arial, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
        }
        button {
            background: #FE5F00;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 25px;
            font-size: 16px;
            margin: 10px;
            cursor: pointer;
        }
        button:active {
            transform: scale(0.95);
        }
    </style>
</head>
<body>
    <h1>Basic R1 Plugin</h1>
    <button id="speak-btn">Speak</button>
    <button id="llm-btn">Ask LLM</button>
    <div id="status">Initializing...</div>

    <script type="module">
        import { r1 } from 'https://cdn.jsdelivr.net/npm/r1-create@latest/dist/index.js';

        const statusDiv = document.getElementById('status');
        const speakBtn = document.getElementById('speak-btn');
        const llmBtn = document.getElementById('llm-btn');

        // Initialize SDK
        try {
            await r1.initialize();
            statusDiv.textContent = 'Ready!';

            // Setup event handlers
            r1.messaging.onMessage((response) => {
                console.log('Received:', response);
                statusDiv.textContent = `Response: ${response.message}`;
            });

            // Hardware events
            r1.hardware.on('sideClick', () => {
                r1.messaging.speakText('Side button pressed!');
                statusDiv.textContent = 'Side button pressed!';
            });

            // UI events
            speakBtn.addEventListener('click', async () => {
                await r1.messaging.speakText('Hello from R1!');
                statusDiv.textContent = 'Speaking...';
            });

            llmBtn.addEventListener('click', async () => {
                await r1.llm.askLLMSpeak('What is the capital of France?');
                statusDiv.textContent = 'Asking LLM...';
            });

        } catch (error) {
            statusDiv.textContent = `Error: ${error.message}`;
            console.error('SDK initialization failed:', error);
        }
    </script>
</body>
</html>
```

## Text-to-Speech App

A dedicated text-to-speech application.

```typescript
import { r1, ui } from 'r1-create';

// Initialize UI
ui.setupViewport();

// Create UI elements
const container = document.createElement('div');
ui.createContainer(container);

const title = document.createElement('h1');
ui.createText(title, { size: 'title', align: 'center' });
title.textContent = 'Text-to-Speech';

const input = document.createElement('input');
Object.assign(input.style, {
  width: '80vw',
  padding: '10px',
  fontSize: '16px',
  margin: '10px 0',
  borderRadius: '5px',
  border: '1px solid #333',
  background: '#111',
  color: '#fff'
});
input.placeholder = 'Enter text to speak...';

const speakBtn = document.createElement('button');
ui.createButton(speakBtn, { type: 'wide' });
speakBtn.textContent = 'Speak';

const llmBtn = document.createElement('button');
ui.createButton(llmBtn, { type: 'standard' });
llmBtn.textContent = 'Ask AI';

const status = document.createElement('div');
ui.createText(status, { size: 'small', align: 'center' });
status.textContent = 'Ready';

// Assemble UI
container.appendChild(title);
container.appendChild(input);
container.appendChild(speakBtn);
container.appendChild(llmBtn);
container.appendChild(status);
document.body.appendChild(container);

// Initialize SDK
await r1.initialize();

// Event handlers
speakBtn.addEventListener('click', async () => {
  const text = input.value.trim();
  if (text) {
    status.textContent = 'Speaking...';
    await r1.messaging.speakText(text);
    status.textContent = 'Ready';
  }
});

llmBtn.addEventListener('click', async () => {
  const text = input.value.trim();
  if (text) {
    status.textContent = 'Asking AI...';
    await r1.llm.askLLMSpeak(text);
    status.textContent = 'Ready';
  }
});

// Hardware controls
r1.hardware.on('sideClick', () => {
  speakBtn.click();
});
```

## Camera Photo App

Photo capture and display application.

```typescript
import { r1, ui } from 'r1-create';

// Initialize UI
ui.setupViewport();

const container = document.createElement('div');
ui.createContainer(container);

const title = document.createElement('h1');
ui.createText(title, { size: 'title' });
title.textContent = 'Camera App';

const video = document.createElement('video');
Object.assign(video.style, {
  width: '100%',
  maxHeight: '60vh',
  objectFit: 'cover',
  borderRadius: '5px'
});

const canvas = document.createElement('canvas');
canvas.style.display = 'none';

const captureBtn = document.createElement('button');
ui.createButton(captureBtn, { type: 'wide' });
captureBtn.textContent = 'Take Photo';

const switchBtn = document.createElement('button');
ui.createButton(switchBtn, { type: 'standard' });
switchBtn.textContent = 'Switch Camera';

const status = document.createElement('div');
ui.createText(status, { size: 'small' });
status.textContent = 'Initializing camera...';

// Assemble UI
container.appendChild(title);
container.appendChild(video);
container.appendChild(captureBtn);
container.appendChild(switchBtn);
container.appendChild(status);
document.body.appendChild(container);

// Initialize SDK
await r1.initialize();

// Camera variables
let stream = null;

async function startCamera() {
  try {
    stream = await r1.camera.start({ facingMode: 'user' });
    const videoElement = r1.camera.createVideoElement();
    video.srcObject = stream;
    status.textContent = 'Camera ready';
  } catch (error) {
    status.textContent = `Camera error: ${error.message}`;
  }
}

// Start camera
await startCamera();

// Event handlers
captureBtn.addEventListener('click', async () => {
  if (!stream) return;

  status.textContent = 'Capturing...';
  try {
    const photoBlob = await r1.camera.capturePhoto(240, 282);

    // Display captured photo
    const img = new Image();
    img.src = URL.createObjectURL(photoBlob);
    img.style.width = '100%';
    img.style.borderRadius = '5px';

    // Replace video with photo
    container.replaceChild(img, video);

    status.textContent = 'Photo captured!';
  } catch (error) {
    status.textContent = `Capture failed: ${error.message}`;
  }
});

switchBtn.addEventListener('click', async () => {
  if (!stream) return;

  status.textContent = 'Switching camera...';
  try {
    await r1.camera.switchCamera();
    status.textContent = 'Camera switched';
  } catch (error) {
    status.textContent = `Switch failed: ${error.message}`;
  }
});

// Hardware controls
r1.hardware.on('sideClick', () => {
  captureBtn.click();
});
```

## Voice Recorder

Audio recording and playback application.

```typescript
import { r1, ui } from 'r1-create';

// Initialize UI
ui.setupViewport();

const container = document.createElement('div');
ui.createContainer(container);

const title = document.createElement('h1');
ui.createText(title, { size: 'title' });
title.textContent = 'Voice Recorder';

const recordBtn = document.createElement('button');
ui.createButton(recordBtn, { type: 'wide' });
recordBtn.textContent = 'Start Recording';

const playBtn = document.createElement('button');
ui.createButton(playBtn, { type: 'standard' });
playBtn.textContent = 'Play Recording';
playBtn.disabled = true;

const status = document.createElement('div');
ui.createText(status, { size: 'small' });
status.textContent = 'Ready';

// Assemble UI
container.appendChild(title);
container.appendChild(recordBtn);
container.appendChild(playBtn);
container.appendChild(status);
document.body.appendChild(container);

// Initialize SDK
await r1.initialize();

// Recording state
let isRecording = false;
let recordedAudio = null;

recordBtn.addEventListener('click', async () => {
  if (isRecording) {
    // Stop recording
    status.textContent = 'Processing...';
    try {
      recordedAudio = await r1.microphone.stopRecording();
      recordBtn.textContent = 'Start Recording';
      playBtn.disabled = false;
      status.textContent = 'Recording saved';
      isRecording = false;
    } catch (error) {
      status.textContent = `Recording failed: ${error.message}`;
    }
  } else {
    // Start recording
    status.textContent = 'Recording...';
    try {
      await r1.microphone.startRecording();
      recordBtn.textContent = 'Stop Recording';
      isRecording = true;
    } catch (error) {
      status.textContent = `Recording failed: ${error.message}`;
    }
  }
});

playBtn.addEventListener('click', async () => {
  if (!recordedAudio) return;

  status.textContent = 'Playing...';
  try {
    await r1.speaker.play(recordedAudio);
    status.textContent = 'Playback complete';
  } catch (error) {
    status.textContent = `Playback failed: ${error.message}`;
  }
});

// Hardware controls
r1.hardware.on('sideClick', () => {
  recordBtn.click();
});
```

## Web Search Integration

Application that searches the web using SERP API.

```typescript
import { r1, ui } from 'r1-create';

// Initialize UI
ui.setupViewport();

const container = document.createElement('div');
ui.createContainer(container);

const title = document.createElement('h1');
ui.createText(title, { size: 'title' });
title.textContent = 'Web Search';

const input = document.createElement('input');
Object.assign(input.style, {
  width: '80vw',
  padding: '10px',
  fontSize: '16px',
  margin: '10px 0',
  borderRadius: '5px',
  border: '1px solid #333',
  background: '#111',
  color: '#fff'
});
input.placeholder = 'Search the web...';

const searchBtn = document.createElement('button');
ui.createButton(searchBtn, { type: 'wide' });
searchBtn.textContent = 'Search';

const results = document.createElement('div');
ui.createText(results, { size: 'small' });
results.style.marginTop = '20px';

// Assemble UI
container.appendChild(title);
container.appendChild(input);
container.appendChild(searchBtn);
container.appendChild(results);
document.body.appendChild(container);

// Initialize SDK
await r1.initialize();

// Message handler
r1.messaging.onMessage((response) => {
  if (response.parsedData && response.parsedData.results) {
    const searchResults = response.parsedData.results;
    results.innerHTML = searchResults.map(result =>
      `<div style="margin: 10px 0; padding: 10px; background: #111; border-radius: 5px;">
        <strong>${result.title}</strong><br>
        <small>${result.url}</small><br>
        ${result.snippet}
      </div>`
    ).join('');
  }
});

searchBtn.addEventListener('click', async () => {
  const query = input.value.trim();
  if (query) {
    results.textContent = 'Searching...';
    await r1.messaging.searchWeb(query);
  }
});

// Hardware controls
r1.hardware.on('sideClick', () => {
  searchBtn.click();
});
```

## Hardware Game

Simple game using accelerometer and hardware controls.

```typescript
import { r1, ui } from 'r1-create';

// Initialize UI
ui.setupViewport();

const container = document.createElement('div');
ui.createContainer(container);

const title = document.createElement('h1');
ui.createText(title, { size: 'title' });
title.textContent = 'Tilt Game';

const ball = document.createElement('div');
Object.assign(ball.style, {
  width: '20px',
  height: '20px',
  background: '#FE5F00',
  borderRadius: '50%',
  position: 'absolute',
  left: '50%',
  top: '50%',
  transform: 'translate(-50%, -50%)'
});

const score = document.createElement('div');
ui.createText(score, { size: 'large', align: 'center' });
score.textContent = 'Score: 0';

const instructions = document.createElement('div');
ui.createText(instructions, { size: 'small', align: 'center' });
instructions.textContent = 'Tilt device to move ball';

// Assemble UI
container.appendChild(title);
container.appendChild(ball);
container.appendChild(score);
container.appendChild(instructions);
document.body.appendChild(container);

// Initialize SDK
await r1.initialize();

// Game state
let ballX = 120;
let ballY = 141;
let gameScore = 0;
let accelerometerStarted = false;

// Start accelerometer
r1.accelerometer.start((data) => {
  if (!accelerometerStarted) {
    accelerometerStarted = true;
    instructions.textContent = 'Use side button to restart';
  }

  // Update ball position based on tilt
  ballX += data.x * 5;
  ballY += data.y * 5;

  // Keep ball in bounds
  ballX = Math.max(10, Math.min(230, ballX));
  ballY = Math.max(10, Math.min(272, ballY));

  // Update ball position
  ball.style.left = `${ballX}px`;
  ball.style.top = `${ballY}px`;

  // Simple scoring (move ball to center to score)
  const centerX = 120;
  const centerY = 141;
  const distance = Math.sqrt((ballX - centerX) ** 2 + (ballY - centerY) ** 2);

  if (distance < 20) {
    gameScore += 10;
    score.textContent = `Score: ${gameScore}`;
    r1.messaging.speakText('Point!');
  }
});

// Hardware controls
r1.hardware.on('sideClick', () => {
  // Reset game
  ballX = 120;
  ballY = 141;
  gameScore = 0;
  score.textContent = 'Score: 0';
  ball.style.left = `${ballX}px`;
  ball.style.top = `${ballY}px`;
  r1.messaging.speakText('Game reset!');
});
```

## UI Design Demo

Showcase of the UI design system.

```typescript
import { r1, ui } from 'r1-create';

// Initialize UI
ui.setupViewport();

const container = document.createElement('div');
ui.createContainer(container);

const title = document.createElement('h1');
ui.createText(title, { size: 'title' });
title.textContent = 'UI Design Demo';

// Create various button types
const wideBtn = document.createElement('button');
ui.createButton(wideBtn, { type: 'wide' });
wideBtn.textContent = 'Wide Button';

const standardBtn = document.createElement('button');
ui.createButton(standardBtn, { type: 'standard' });
standardBtn.textContent = 'Standard';

const smallBtn = document.createElement('button');
ui.createButton(smallBtn, { type: 'small' });
smallBtn.textContent = 'Small';

// Create text examples
const heading = document.createElement('h2');
ui.createText(heading, { size: 'large', color: '#FE5F00' });
heading.textContent = 'Large Heading';

const bodyText = document.createElement('p');
ui.createText(bodyText, { size: 'body' });
bodyText.textContent = 'This is body text with normal size.';

const smallText = document.createElement('p');
ui.createText(smallText, { size: 'small' });
smallText.textContent = 'This is smaller text for secondary information.';

// Create grid layout
const grid = document.createElement('div');
ui.createGrid(grid, { columns: 2, gap: ui.getSpacing().md });

for (let i = 1; i <= 4; i++) {
  const gridItem = document.createElement('div');
  ui.createText(gridItem, { size: 'body', align: 'center' });
  gridItem.textContent = `Grid Item ${i}`;
  Object.assign(gridItem.style, {
    padding: ui.getSpacing().md,
    background: '#111',
    borderRadius: '5px'
  });
  grid.appendChild(gridItem);
}

// Assemble UI
container.appendChild(title);
container.appendChild(wideBtn);
container.appendChild(standardBtn);
container.appendChild(smallBtn);
container.appendChild(heading);
container.appendChild(bodyText);
container.appendChild(smallText);
container.appendChild(grid);
document.body.appendChild(container);

// Initialize SDK
await r1.initialize();

// Add interactions
wideBtn.addEventListener('click', () => {
  r1.messaging.speakText('Wide button pressed!');
});

standardBtn.addEventListener('click', () => {
  r1.messaging.speakText('Standard button pressed!');
});

smallBtn.addEventListener('click', () => {
  r1.messaging.speakText('Small button pressed!');
});
```

## Device Controls Example

Demonstration of the device controls wrapper.

```typescript
import { r1, deviceControls, ui } from 'r1-create';

// Initialize UI
ui.setupViewport();

const container = document.createElement('div');
ui.createContainer(container);

const title = document.createElement('h1');
ui.createText(title, { size: 'title' });
title.textContent = 'Device Controls';

const status = document.createElement('div');
ui.createText(status, { size: 'body' });
status.textContent = 'Initializing device controls...';

const controls = document.createElement('div');
ui.createText(controls, { size: 'small' });
controls.innerHTML = `
  <div>Side Button: Disabled</div>
  <div>Scroll Wheel: Disabled</div>
  <div>Events: 0</div>
`;

// Assemble UI
container.appendChild(title);
container.appendChild(status);
container.appendChild(controls);
document.body.appendChild(container);

// Initialize SDK
await r1.initialize();

// Initialize device controls
deviceControls.init({
  sideButtonEnabled: true,
  scrollWheelEnabled: true,
  keyboardFallback: true
});

status.textContent = 'Device controls ready!';

// Event counters
let sideButtonCount = 0;
let scrollUpCount = 0;
let scrollDownCount = 0;

// Register event handlers
deviceControls.on('sideButton', () => {
  sideButtonCount++;
  r1.messaging.speakText('Side button pressed!');
  updateDisplay();
});

deviceControls.on('scrollWheel', (data) => {
  if (data.direction === 'up') {
    scrollUpCount++;
  } else {
    scrollDownCount++;
  }
  updateDisplay();
});

function updateDisplay() {
  controls.innerHTML = `
    <div>Side Button: ${deviceControls.isSideButtonEnabled() ? 'Enabled' : 'Disabled'} (${sideButtonCount})</div>
    <div>Scroll Wheel: ${deviceControls.isScrollWheelEnabled() ? 'Enabled' : 'Disabled'}</div>
    <div>Scroll Up: ${scrollUpCount}, Scroll Down: ${scrollDownCount}</div>
  `;
}

updateDisplay();

// Demo: Toggle controls
setTimeout(() => {
  deviceControls.setSideButtonEnabled(false);
  updateDisplay();
  r1.messaging.speakText('Side button disabled');
}, 5000);

setTimeout(() => {
  deviceControls.setSideButtonEnabled(true);
  updateDisplay();
  r1.messaging.speakText('Side button enabled');
}, 10000);
```