# R1 SDK Examples

This directory contains example applications demonstrating various features of the R1 Create SDK.

## Examples

### 1. Basic Plugin (`basic/`)
Simple plugin demonstrating:
- Hardware event handling (side button, scroll wheel)
- Accelerometer data display
- LLM interaction
- Storage operations

### 2. Camera App (`camera/`)
Camera application showing:
- Camera access and preview
- Photo capture
- Image storage and display
- Hardware-accelerated UI

### 3. Voice Recorder (`voice/`)
Voice recording app with:
- Microphone access
- Audio recording and playback
- Audio storage with Base64 encoding
- Voice-to-LLM integration

### 4. Accelerometer Game (`accelerometer/`)
Simple tilt-based game featuring:
- Real-time accelerometer input
- Hardware-accelerated animations
- Game state management
- Performance optimization

### 5. LLM Chat (`chat/`)
Chat interface demonstrating:
- Conversational LLM interaction
- Message history storage
- Voice input/output
- UI optimization for R1 display

## Running Examples

1. Build the SDK first:
   ```bash
   npm run build
   ```

2. Serve the examples using a local server:
   ```bash
   npx http-server examples -p 8080
   ```

3. Navigate to `http://localhost:8080/[example-name]/` in your browser

## Note for R1 Device

These examples are designed to work in the R1 environment where the hardware APIs are available. When running in a regular browser:
- Hardware events won't trigger
- Storage APIs may not be available
- LLM interactions will fail
- Media permissions may be restricted

The examples include fallback behavior and error handling for development purposes.