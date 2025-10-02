# Contributing

Guidelines for contributing to the R1 Create SDK.

## 🚀 Ways to Contribute

- **Bug Reports:** Report bugs and issues
- **Feature Requests:** Suggest new features
- **Code Contributions:** Submit pull requests
- **Documentation:** Improve docs and examples
- **Testing:** Help test on different devices

## 📋 Development Setup

### Prerequisites

- **Node.js:** >= 16.0.0
- **npm:** Latest version
- **Git:** Latest version
- **TypeScript:** Knowledge of TypeScript

### Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/AidanTheBandit/R1-create.js.git
   cd r1-create.js
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development:**
   ```bash
   npm run dev  # Watch mode for development
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

5. **Run tests:**
   ```bash
   npm test
   ```

### Project Structure

```
r1-create.js/
├── src/                    # Source code
│   ├── index.ts           # Main SDK exports
│   ├── types/             # TypeScript definitions
│   ├── hardware/          # Hardware APIs
│   ├── llm/               # LLM and messaging
│   ├── storage/           # Storage APIs
│   ├── media/             # Camera, mic, speaker
│   └── ui/                # UI utilities
├── dist/                  # Built distribution files
├── docs/                  # Documentation
├── examples/              # Example implementations
├── test.js                # Test suite
└── package.json           # Package configuration
```

## 🐛 Reporting Bugs

### Bug Report Template

When reporting bugs, please include:

1. **SDK Version:** `npm list r1-create`
2. **Environment:**
   - Browser and version
   - Node.js version
   - R1 device (if applicable)
3. **Steps to Reproduce:**
   - Clear, numbered steps
   - Minimal code example
4. **Expected Behavior:**
   - What should happen
5. **Actual Behavior:**
   - What actually happens
6. **Error Messages:**
   - Console errors, stack traces
7. **Additional Context:**
   - Screenshots, videos
   - Related issues

### Example Bug Report

```markdown
**Bug: Camera API fails on iOS Safari**

**SDK Version:** 1.2.0
**Browser:** Safari 16.0
**Device:** iPhone 13

**Steps to Reproduce:**
1. Call `r1.camera.start()`
2. Permission prompt appears
3. Grant permission
4. Camera fails to start with error

**Expected:** Camera stream starts successfully
**Actual:** Error: "Camera not available"

**Error Message:**
```
TypeError: undefined is not an object (evaluating 'stream.getVideoTracks')
```

**Additional Context:**
- Works fine on Chrome
- Tested on multiple iOS devices
- Camera permissions are granted
```

## ✨ Feature Requests

### Feature Request Template

For new features, please provide:

1. **Feature Description:**
   - What the feature does
   - Why it's needed
2. **Use Cases:**
   - Specific scenarios
   - Target users
3. **API Design:**
   - Proposed method signatures
   - Integration with existing APIs
4. **Implementation Notes:**
   - Technical requirements
   - Breaking changes (if any)

### Example Feature Request

```markdown
**Feature: Background Audio Playback**

**Description:**
Add ability to play audio in background when app is not focused.

**Use Cases:**
- Music player apps
- Voice assistant responses
- Notification sounds

**Proposed API:**
```typescript
// New method
r1.speaker.playInBackground(audioBlob, options);

// Options
interface BackgroundAudioOptions {
  loop?: boolean;
  volume?: number;
  onComplete?: () => void;
}
```

**Implementation Notes:**
- Requires Web Audio API
- Handle audio context suspension
- Respect user media preferences
```

## 💻 Code Contributions

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Run tests:**
   ```bash
   npm test
   ```
5. **Build and verify:**
   ```bash
   npm run build
   ```
6. **Commit your changes:**
   ```bash
   git commit -m "Add: Brief description of changes"
   ```
7. **Push to your fork:**
   ```bash
   git push origin feature/your-feature-name
   ```
8. **Create a Pull Request**

### Coding Standards

#### TypeScript Guidelines

- **Strict mode:** All code must pass TypeScript strict checks
- **Type annotations:** Explicit types for all parameters and return values
- **Interfaces:** Use interfaces for object shapes
- **Generics:** Use generics for reusable components

```typescript
// ✅ Good
interface UserData {
  name: string;
  age: number;
}

function processUser<T extends UserData>(user: T): T {
  // Implementation
  return user;
}

// ❌ Bad
function processUser(user: any): any {
  // Implementation
  return user;
}
```

#### Code Style

- **ES6+ features:** Use modern JavaScript features
- **Async/await:** Prefer over Promises for readability
- **Arrow functions:** Use for concise callbacks
- **Destructuring:** Use for object/array access

```typescript
// ✅ Good
async function initializeSDK() {
  const { camera, microphone } = r1;
  const [cameraAvailable, micAvailable] = await Promise.all([
    camera.isAvailable(),
    microphone.isAvailable()
  ]);
  return { cameraAvailable, micAvailable };
}

// ❌ Bad
function initializeSDK() {
  return r1.camera.isAvailable().then(cameraAvailable => {
    return r1.microphone.isAvailable().then(micAvailable => {
      return { cameraAvailable, micAvailable };
    });
  });
}
```

#### Error Handling

- **Try/catch:** Wrap async operations
- **Descriptive errors:** Provide clear error messages
- **Graceful degradation:** Handle failures gracefully

```typescript
// ✅ Good
async function startCamera() {
  try {
    const available = await r1.camera.isAvailable();
    if (!available) {
      throw new Error('Camera not supported on this device');
    }
    return await r1.camera.start();
  } catch (error) {
    console.error('Camera initialization failed:', error);
    // Provide fallback or user feedback
    return null;
  }
}
```

### Testing

#### Unit Tests

- **Test file location:** `test.js`
- **Test all public APIs**
- **Mock external dependencies**
- **Test error conditions**

#### Manual Testing

- **Browser compatibility:** Test in Chrome, Firefox, Safari
- **Device testing:** Test on actual R1 device when possible
- **Edge cases:** Test with invalid inputs, network failures, etc.

### Documentation

#### Code Documentation

- **JSDoc comments:** Document all public methods
- **Parameter descriptions:** Explain each parameter
- **Return values:** Document return types and values
- **Examples:** Include usage examples

```typescript
/**
 * Starts camera capture with specified options
 * @param config Camera configuration options
 * @returns Promise resolving to MediaStream
 * @throws Error if camera not available or permission denied
 * @example
 * ```typescript
 * const stream = await r1.camera.start({ facingMode: 'user' });
 * ```
 */
async function start(config?: CameraConfig): Promise<MediaStream> {
  // Implementation
}
```

#### API Documentation

- **Update API reference:** Add new methods to `docs/api-reference.md`
- **Examples:** Add code examples to `docs/examples.md`
- **Changelog:** Document breaking changes

## 📝 Documentation Contributions

### Improving Documentation

1. **Fix typos and grammar**
2. **Clarify confusing explanations**
3. **Add missing examples**
4. **Update outdated information**

### Adding Examples

1. **Create new example files** in `examples/` directory
2. **Include README.md** with setup instructions
3. **Test examples** to ensure they work
4. **Add to examples index** in documentation

### Documentation Standards

- **Markdown format:** Use standard Markdown
- **Code blocks:** Include syntax highlighting
- **Table of contents:** For long documents
- **Cross-references:** Link related documents

## 🔄 Pull Request Process

### PR Checklist

- [ ] **Tests pass:** `npm test`
- [ ] **Build succeeds:** `npm run build`
- [ ] **TypeScript strict:** No type errors
- [ ] **Documentation updated:** API docs, examples
- [ ] **Changelog updated:** For breaking changes
- [ ] **Commit messages:** Clear and descriptive

### PR Template

```markdown
## Description
Brief description of the changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Manual testing completed
- [ ] Browser compatibility checked

## Additional Notes
Any additional information or context
```

### Review Process

1. **Automated checks:** Tests and build must pass
2. **Code review:** At least one maintainer review
3. **Approval:** Changes approved by maintainer
4. **Merge:** PR merged by maintainer

## 🎯 Areas for Contribution

### High Priority

- **Browser compatibility:** Test and fix issues across browsers
- **Performance optimization:** Improve memory usage and speed
- **Error handling:** Better error messages and recovery
- **Documentation:** Complete API documentation

### Medium Priority

- **New hardware APIs:** Support for new R1 features
- **UI components:** Pre-built components for common patterns
- **Plugin templates:** Boilerplate for different app types
- **Testing framework:** Automated testing for hardware features

### Low Priority

- **Internationalization:** Multi-language support
- **Themes:** UI theming system
- **Analytics:** Usage tracking and metrics
- **Offline support:** Work without internet connection

## 📞 Getting Help

- **GitHub Issues:** For bugs and feature requests
- **GitHub Discussions:** For questions and general discussion
- **Discord/Community:** Join R1 developer communities

## 📋 Code of Conduct

- **Respectful:** Be respectful to all contributors
- **Inclusive:** Welcome contributors from all backgrounds
- **Constructive:** Provide constructive feedback
- **Collaborative:** Work together to improve the project

## 📄 License

By contributing to this project, you agree that your contributions will be licensed under the same Apache-2.0 license as the project.