# Troubleshooting

Common issues and solutions when using the R1 Create SDK.

## 📋 Table of Contents

- [Installation Issues](#installation-issues)
- [Runtime Errors](#runtime-errors)
- [Hardware Access](#hardware-access)
- [Audio/Video Issues](#audiovideo-issues)
- [Storage Problems](#storage-problems)
- [LLM/Messaging Issues](#llmmessaging-issues)
- [UI/Layout Problems](#uilayout-problems)
- [Development Environment](#development-environment)

## Installation Issues

### Package Not Found

**Error:** `Cannot find module 'r1-create'`

**Solutions:**
1. **Check installation:**
   ```bash
   npm list r1-create
   ```

2. **Reinstall package:**
   ```bash
   npm uninstall r1-create
   npm install r1-create
   ```

3. **Clear cache:**
   ```bash
   npm cache clean --force
   npm install
   ```

4. **Check package.json:**
   ```json
   {
     "dependencies": {
       "r1-create": "^1.2.0"
     }
   }
   ```

### TypeScript Errors

**Error:** `Cannot find name 'r1'`

**Solutions:**
1. **Import types:**
   ```typescript
   import { r1, R1SDK } from 'r1-create';
   ```

2. **Check TypeScript config:**
   ```json
   {
     "compilerOptions": {
       "moduleResolution": "node",
       "esModuleInterop": true
     }
   }
   ```

3. **Update TypeScript:**
   ```bash
   npm install typescript@latest --save-dev
   ```

## Runtime Errors

### SDK Not Initialized

**Error:** `R1 SDK must be used in a browser environment`

**Solutions:**
1. **Initialize SDK first:**
   ```typescript
   await r1.initialize();
   ```

2. **Check environment:**
   ```typescript
   if (typeof window === 'undefined') {
     console.error('SDK requires browser environment');
   }
   ```

### Method Not Found

**Error:** `TypeError: r1.messaging.speakText is not a function`

**Solutions:**
1. **Update to latest version:**
   ```bash
   npm update r1-create
   ```

2. **Check SDK version:**
   ```typescript
   console.log('SDK version check needed');
   ```

3. **Clear browser cache** and reload

4. **Reinstall dependencies:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

## Hardware Access

### Accelerometer Not Working

**Error:** `Accelerometer not available`

**Solutions:**
1. **Check permissions:**
   ```typescript
   const available = await r1.accelerometer.isAvailable();
   if (!available) {
     console.log('Accelerometer not supported');
   }
   ```

2. **Request permissions:**
   ```typescript
   try {
     await r1.accelerometer.start();
   } catch (error) {
     console.log('Permission denied or not supported');
   }
   ```

3. **Check device orientation:**
   - Some devices don't have accelerometers
   - Test on actual R1 device

### Hardware Events Not Firing

**Error:** Hardware button events not detected

**Solutions:**
1. **Check event registration:**
   ```typescript
   r1.hardware.on('sideClick', () => {
     console.log('Button pressed');
   });
   ```

2. **Test in R1 environment:**
   - Hardware events only work on R1 device
   - Use keyboard fallback for development

3. **Check event names:**
   ```typescript
   // Correct event names
   'sideClick', 'longPressStart', 'longPressEnd', 'scrollUp', 'scrollDown'
   ```

## Audio/Video Issues

### Camera Not Accessible

**Error:** `Camera not available` or permission denied

**Solutions:**
1. **Check HTTPS:**
   - Camera requires HTTPS in production
   - Use `localhost` for development

2. **Request permissions:**
   ```typescript
   try {
     await r1.camera.start();
   } catch (error) {
     console.log('Camera permission denied');
   }
   ```

3. **Check camera availability:**
   ```typescript
   const available = await r1.camera.isAvailable();
   ```

4. **Handle multiple cameras:**
   ```typescript
   await r1.camera.start({ facingMode: 'environment' }); // Back camera
   ```

### Microphone Issues

**Error:** `Microphone not available`

**Solutions:**
1. **Check permissions:**
   ```typescript
   const available = await r1.microphone.isAvailable();
   ```

2. **Request user interaction:**
   - Audio context requires user gesture
   - Call after button click

3. **Check audio constraints:**
   ```typescript
   await r1.microphone.start({
     sampleRate: 44100,
     echoCancellation: true
   });
   ```

### Speaker Not Working

**Error:** Audio playback fails

**Solutions:**
1. **Check audio availability:**
   ```typescript
   const features = await r1.getAvailableFeatures();
   if (!features.speaker) {
     console.log('Speaker not available');
   }
   ```

2. **User interaction required:**
   ```typescript
   // Must be called after user interaction
   document.addEventListener('click', async () => {
     await r1.speaker.play(audioBlob);
   });
   ```

3. **Check audio format:**
   ```typescript
   // Supported formats: Blob, URL string
   await r1.speaker.play(audioBlob);
   await r1.speaker.play('sound.mp3');
   ```

## Storage Problems

### Storage Not Available

**Error:** `Storage operations fail`

**Solutions:**
1. **Check storage availability:**
   ```typescript
   const features = await r1.getAvailableFeatures();
   if (!features.storage) {
     console.log('Storage not available');
   }
   ```

2. **Use plain storage fallback:**
   ```typescript
   try {
     await r1.storage.secure.setItem('key', 'value');
   } catch (error) {
     // Fallback to plain storage
     await r1.storage.plain.setItem('key', 'value');
   }
   ```

3. **Check storage quota:**
   - Storage may be full
   - Clear old data if needed

### Data Encoding Issues

**Error:** Stored data corrupted

**Solutions:**
1. **Automatic encoding:**
   - SDK automatically Base64 encodes data
   - No manual encoding needed

2. **Data types:**
   ```typescript
   // Objects are automatically JSON stringified
   await r1.storage.plain.setItem('user', { name: 'John', age: 30 });

   // Retrieved as original type
   const user = await r1.storage.plain.getItem('user');
   // Returns: { name: 'John', age: 30 }
   ```

## LLM/Messaging Issues

### Messages Not Sent

**Error:** LLM requests fail

**Solutions:**
1. **Check messaging availability:**
   ```typescript
   const features = await r1.getAvailableFeatures();
   if (!features.messaging) {
     console.log('Messaging not available - not in R1 environment');
   }
   ```

2. **Handle responses:**
   ```typescript
   r1.messaging.onMessage((response) => {
     console.log('Response:', response);
   });
   ```

3. **Check message format:**
   ```typescript
   await r1.messaging.sendMessage('Hello', { useLLM: true });
   ```

### Text-to-Speech Fails

**Error:** `speakText` method not found or fails

**Solutions:**
1. **Update SDK version:**
   ```bash
   npm update r1-create
   ```

2. **Check method availability:**
   ```typescript
   if (typeof r1.messaging.speakText === 'function') {
     await r1.messaging.speakText('Hello');
   }
   ```

3. **Use LLM method:**
   ```typescript
   await r1.llm.textToSpeech('Hello');
   ```

## UI/Layout Problems

### Elements Not Visible

**Error:** UI elements don't appear correctly

**Solutions:**
1. **Setup viewport:**
   ```typescript
   r1.ui.setupViewport();
   ```

2. **Use responsive units:**
   ```typescript
   const width = r1.ui.pxToVw(100); // Convert to viewport width
   element.style.width = width;
   ```

3. **Check container setup:**
   ```typescript
   r1.ui.createContainer(document.body);
   ```

### Touch Events Not Working

**Error:** Touch interactions fail

**Solutions:**
1. **Enable touch events:**
   ```typescript
   r1.touch.tap(x, y);
   ```

2. **Check coordinates:**
   ```typescript
   // R1 screen bounds: 240x282
   const inBounds = x >= 0 && x <= 240 && y >= 0 && y <= 282;
   ```

3. **Use proper event handlers:**
   ```typescript
   element.addEventListener('touchstart', (e) => {
     e.preventDefault(); // Prevent scrolling
   });
   ```

## Development Environment

### Browser Compatibility

**Issues:** Features not working in certain browsers

**Solutions:**
1. **Check feature support:**
   ```typescript
   const features = await r1.getAvailableFeatures();
   console.log('Supported features:', features);
   ```

2. **Use fallbacks:**
   ```typescript
   if (!features.camera) {
     console.log('Camera not supported, using fallback');
   }
   ```

3. **Test in multiple browsers:**
   - Chrome/Edge: Full support
   - Firefox: Limited support
   - Safari: Limited support

### Hot Reload Issues

**Error:** Changes not reflected during development

**Solutions:**
1. **Clear browser cache:**
   - Hard refresh (Ctrl+F5)
   - Clear browser storage

2. **Restart dev server:**
   ```bash
   npm run dev
   ```

3. **Check file watching:**
   - Ensure TypeScript compilation is running
   - Check for file system permissions

### Console Errors

**Common errors and solutions:**

1. **CORS errors:**
   - Use local development server
   - Configure CORS headers

2. **Mixed content warnings:**
   - Use HTTPS in production
   - Use HTTP for local development

3. **Service worker conflicts:**
   - Disable service workers during development
   - Clear application cache

## Debug Tools

### Feature Detection

```typescript
// Check all available features
const features = await r1.getAvailableFeatures();
console.table(features);
```

### Performance Monitoring

```typescript
// Monitor performance
import { PerformanceUtils } from 'r1-create';

PerformanceUtils.startMeasure('operation');
// ... your code
const duration = PerformanceUtils.endMeasure('operation');
console.log(`Operation took ${duration}ms`);
```

### Error Logging

```typescript
// Comprehensive error handling
try {
  await r1.initialize();
  await r1.messaging.speakText('Hello');
} catch (error) {
  console.error('SDK Error:', {
    message: error.message,
    stack: error.stack,
    sdkVersion: '1.2.0',
    userAgent: navigator.userAgent,
    features: await r1.getAvailableFeatures()
  });
}
```

## Getting Help

If these solutions don't resolve your issue:

1. **Check GitHub Issues:** Search existing issues
2. **Create New Issue:** Include:
   - SDK version (`npm list r1-create`)
   - Browser and OS
   - Code sample that reproduces the issue
   - Error messages and stack traces
   - Steps to reproduce

3. **Community Support:** Join R1 developer communities

## Version Compatibility

| SDK Version | R1 OS Version | Key Features |
|-------------|---------------|--------------|
| 1.0.x | 1.0+ | Basic hardware, storage, LLM |
| 1.1.x | 1.0+ | SERP API, enhanced messaging |
| 1.2.x | 1.0+ | UI design system, device controls |

Always use the latest SDK version for best compatibility and features.