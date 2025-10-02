# R1 Create SDK Documentation

Welcome to the official documentation for the R1 Create SDK - an unofficial community JavaScript/TypeScript SDK for building R1/RabbitOS plugins.

## 📚 Documentation Overview

- **[Getting Started](./getting-started.md)** - Quick setup and basic usage
- **[API Reference](./api-reference.md)** - Complete API documentation
- **[Examples](./examples.md)** - Code examples and use cases
- **[Hardware Guide](./hardware.md)** - Hardware access and controls
- **[LLM Integration](./llm-integration.md)** - AI and messaging features
- **[UI Design](./ui-design.md)** - Responsive design system
- **[Storage](./storage.md)** - Data persistence APIs
- **[Media](./media.md)** - Camera, microphone, and speaker
- **[Troubleshooting](./troubleshooting.md)** - Common issues and solutions
- **[Contributing](./contributing.md)** - Development guidelines

## 🚀 Quick Links

- [GitHub Repository](https://github.com/AidanTheBandit/R1-create.js)
- [npm Package](https://www.npmjs.com/package/r1-create)
- [Issues & Bug Reports](https://github.com/AidanTheBandit/R1-create.js/issues)

## 📦 Installation

```bash
npm install r1-create
```

## 🎯 Key Features

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

## 🏗️ Architecture

The SDK provides a unified interface to R1's capabilities through several key modules:

- **Hardware APIs**: Direct access to device sensors and controls
- **Messaging System**: Bidirectional communication with R1's AI
- **Storage APIs**: Persistent data storage with encryption options
- **Media APIs**: Camera, microphone, and audio playback
- **UI Utilities**: Performance-optimized components for small screens

## 📋 Requirements

- **Node.js**: >= 16.0.0
- **Browser**: Modern browser with ES6+ support
- **R1 Device**: For full hardware access (optional for development)

## 📄 License

This project is licensed under the Apache-2.0 License - see the [LICENSE](../LICENSE) file for details.