# Changelog

All notable changes to the R1 Create SDK will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0] - 2025-10-02

### Added
- **Audio File Generation**: Enhanced `textToSpeechAudio()` method with advanced audio capture techniques
- **TTS Audio Research**: Comprehensive analysis of R1 TTS system capabilities and limitations
- **Documentation Suite**: Complete documentation package with API reference, examples, and guides

### Enhanced
- **TTS Functionality**: Improved text-to-speech methods with better error handling
- **Audio APIs**: Enhanced audio blob generation capabilities
- **Developer Experience**: Better documentation and code examples

### Technical
- **Audio Capture Research**: Detailed investigation of TTS audio file generation possibilities
- **Web Speech API**: Advanced techniques for browser-based audio synthesis
- **R1 System Analysis**: Deep dive into R1 TTS architecture and limitations

## [1.2.0] - 2025-10-02

## [1.2.0] - 2025-10-02

### Added
- **Text-to-Speech API**: Added `messaging.speakText()` method for direct text-to-speech without LLM processing
- **LLM Helpers**: Added `llm.textToSpeech()` convenience method
- **Audio Generation**: Added `llm.textToSpeechAudio()` method for browser-based audio blob generation (Web Speech API)
- **Device Controls**: Added comprehensive device controls wrapper with keyboard fallbacks
- **UI Design System**: Complete responsive design system with utilities for R1's 240x282px display
- **Hardware Events**: Enhanced hardware event handling with proper TypeScript types
- **Comprehensive Documentation**: Full documentation suite including API reference, examples, and guides

### Enhanced
- **LLM Integration**: Improved messaging system with better error handling and response parsing
- **Storage APIs**: Enhanced with automatic Base64 encoding/decoding
- **Media APIs**: Improved camera and microphone handling with better error states
- **Performance**: Hardware-accelerated CSS utilities and DOM batching operations
- **TypeScript Support**: Complete type definitions for all APIs

### Fixed
- **Build Process**: Fixed TypeScript compilation issues
- **Error Handling**: Better error messages and graceful degradation
- **Browser Compatibility**: Improved support across different browsers

### Changed
- **API Structure**: Reorganized some internal APIs for better consistency
- **Documentation**: Moved to dedicated docs folder with comprehensive guides

## [1.1.0] - 2025-09-XX

### Added
- **SERP API Integration**: Web search functionality through messaging system
- **Enhanced LLM Features**: JSON response parsing and structured data handling
- **Hardware Event Simulation**: Keyboard fallbacks for development
- **Plugin Architecture**: Improved plugin lifecycle management

### Enhanced
- **Messaging System**: Better response handling and message parsing
- **Error Recovery**: Improved error handling throughout the SDK
- **Development Experience**: Better debugging and logging

## [1.0.0] - 2025-09-XX

### Added
- **Core SDK Architecture**: Unified interface for all R1 capabilities
- **Hardware Access**: Accelerometer, touch simulation, PTT button, scroll wheel
- **Storage APIs**: Secure and plain storage with Base64 encoding
- **LLM Integration**: Basic messaging and AI interaction
- **Media APIs**: Camera, microphone, and speaker control
- **UI Utilities**: Basic responsive utilities for small screens
- **TypeScript Support**: Full type definitions and IntelliSense
- **Plugin System**: Simple plugin creation and management

### Technical Details
- **Platform**: Browser-based SDK for R1/RabbitOS plugins
- **Language**: TypeScript with ES6+ features
- **Dependencies**: Zero runtime dependencies
- **Bundle Size**: ~50KB minified
- **Compatibility**: Modern browsers with ES6 support