# Next.js Full SDK Test App

Comprehensive test application for the R1 Create SDK using Next.js.

## What it covers

- Core SDK initialization and feature checks
- Hardware APIs (accelerometer, touch, hardware events, device controls)
- Storage APIs (Base64 utilities, plain/secure storage helpers)
- Messaging and LLM APIs (including timeout, STT, push-to-talk, search, email, image analysis)
- STT transcript simulation path through `onPluginMessage`
- AI image-generation prompt workflow (manual and smoke-path send)
- AI calling-style JSON schema workflow (manual and smoke-path send)
- Full LLM helper coverage (`getUserMemories`, `analyzeData`, `performTask`, `textToSpeech`, `textToSpeechAudio`, `getUISuggestions`, `analyzeImageBase64`)
- UI utilities and component lifecycle
- Media utilities and manual camera/microphone/speaker tests

## Run

From repository root:

```bash
cd examples/nextjs-test-app
npm install
npm run dev
```

Then open:

- http://localhost:3000

## Device Log Relay (Socket.IO)

This app includes a Socket.IO relay server to stream console logs from a device creation.

Start relay server in a second terminal:

```bash
cd examples/nextjs-test-app
npm run relay
```

Then in the dashboard, connect to relay URL (default: `http://localhost:3031`).

The dashboard now auto-fills relay URL using the current page host:

- `${window.location.protocol}//${window.location.hostname}:3031`

You can also click **Use Current Address** in the UI to reset it.

To forward logs from a device/webview, include this bridge in your creation:

```html
<script>
	window.__R1_RELAY_URL__ = 'http://YOUR_HOST:3031';
	window.__R1_DEVICE_ID__ = 'my-r1-device';
</script>
<script src="https://cdn.socket.io/4.8.1/socket.io.min.js"></script>
<script src="/path/to/device-console-bridge.js"></script>
```

Bridge file location:

- `examples/nextjs-test-app/log-relay/device-console-bridge.js`

## Notes

- Some tests are environment-dependent and will be marked as skipped in non-R1 environments.
- Manual media tests require browser permissions.
- `closePlugin` can close the webview on device, so it is intentionally a manual button.
- For AI image generation and AI-calling tests, the app verifies request flow and response handling; exact model behavior depends on runtime LLM capabilities.
- The UI includes a compact small-screen mode and a live hardware panel for side button/PTT, long press, scroll, and accelerometer monitoring.
