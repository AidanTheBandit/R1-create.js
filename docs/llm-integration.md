# LLM Integration

Guide to integrating Large Language Models and messaging in R1 plugins.

## 📋 Table of Contents

- [Overview](#overview)
- [Basic Messaging](#basic-messaging)
- [Text-to-Speech](#text-to-speech)
- [LLM Conversations](#llm-conversations)
- [Web Search Integration](#web-search-integration)
- [Structured Responses](#structured-responses)
- [Message Handling](#message-handling)
- [Advanced Features](#advanced-features)

## Overview

The R1 Create SDK provides comprehensive integration with R1's AI capabilities through a messaging system that communicates with Large Language Models (LLMs).

### Key Concepts

- **Messaging:** Bidirectional communication with R1's AI
- **LLM Integration:** Direct access to language models
- **Text-to-Speech:** Convert text responses to speech
- **Web Search:** SERP API integration for real-time information
- **Plugin Context:** Maintain conversation context

### Architecture

```
Your Plugin ↔ Messaging API ↔ R1 OS ↔ LLM ↔ Response
```

## Basic Messaging

### Sending Messages

```typescript
import { r1 } from 'r1-create';

// Send a simple message
await r1.messaging.sendMessage('Hello, how are you?');
```

### Message Options

```typescript
interface MessageOptions {
  useLLM?: boolean;           // Whether to use LLM processing
  useSerpAPI?: boolean;       // Whether to enable web search
  wantsR1Response?: boolean;  // Whether to speak response
  wantsJournalEntry?: boolean; // Whether to save to journal
  pluginId?: string;          // Plugin identifier
  imageBase64?: string;       // Base64 encoded image
}
```

### Basic Example

```typescript
// Initialize SDK
await r1.initialize();

// Setup message handler
r1.messaging.onMessage((response) => {
  console.log('Received:', response.message);
  console.log('Parsed data:', response.parsedData);
});

// Send message
await r1.messaging.sendMessage('What is the weather like?', {
  useLLM: true,
  wantsR1Response: false  // Don't speak response
});
```

## Text-to-Speech

### Direct Text-to-Speech

Convert text to speech without LLM processing.

```typescript
// Simple TTS
await r1.messaging.speakText('Hello world!');

// With options
await r1.messaging.speakText('Welcome to R1', {
  wantsJournalEntry: true
});

// Convenience method
await r1.llm.textToSpeech('This is spoken directly');
```

### LLM-Generated Speech

Ask LLM to generate and speak a response.

```typescript
// LLM generates and speaks response
await r1.llm.askLLMSpeak('Tell me a joke');

// With journal entry
await r1.llm.askLLMSpeak('What time is it?', true);
```

### Speech Options

```typescript
// Journal entry option
await r1.messaging.speakText('Important message', {
  wantsJournalEntry: true  // Save to R1's journal
});
```

## LLM Conversations

### Basic LLM Queries

```typescript
// Ask LLM a question
await r1.messaging.askLLM('What is the capital of France?');

// With custom options
await r1.messaging.askLLM('Explain quantum physics', {
  wantsR1Response: true,   // Speak the response
  wantsJournalEntry: true  // Save to journal
});
```

### Conversation Context

```typescript
// Maintain context across messages
await r1.messaging.askLLM('My name is John');
await r1.messaging.askLLM('What is my name?'); // Knows context
```

### Plugin-Specific Context

```typescript
// Include plugin ID for context isolation
await r1.messaging.sendMessage('Remember my favorite color is blue', {
  useLLM: true,
  pluginId: 'color-preferences'
});

// Later in same plugin
await r1.messaging.sendMessage('What is my favorite color?', {
  useLLM: true,
  pluginId: 'color-preferences'  // Maintains context
});
```

## Web Search Integration

### SERP API Usage

```typescript
// Search the web
await r1.messaging.searchWeb('current weather in Tokyo');

// Combine with LLM
await r1.messaging.sendMessage('Find restaurants near me', {
  useLLM: true,
  useSerpAPI: true
});
```

### Search Results Handling

```typescript
r1.messaging.onMessage((response) => {
  if (response.parsedData && response.parsedData.results) {
    const results = response.parsedData.results;
    results.forEach(result => {
      console.log(`${result.title}: ${result.url}`);
      console.log(result.snippet);
    });
  }
});

await r1.messaging.searchWeb('latest news');
```

## Structured Responses

### JSON Responses

Request structured data from LLM.

```typescript
// Request JSON format
await r1.llm.askLLMJSON('List 3 programming languages in JSON format');

// Custom JSON prompt
await r1.llm.askLLMJSON(`
  Create a recipe for chocolate chip cookies.
  Return in this exact JSON format:
  {
    "title": "Recipe Title",
    "ingredients": ["ingredient 1", "ingredient 2"],
    "instructions": ["step 1", "step 2"]
  }
`);
```

### Response Parsing

```typescript
r1.messaging.onMessage((response) => {
  if (response.parsedData) {
    // Automatically parsed JSON
    console.log('Structured data:', response.parsedData);

    if (response.parsedData.ingredients) {
      // Handle recipe data
      displayRecipe(response.parsedData);
    }
  } else {
    // Raw text response
    console.log('Text response:', response.message);
  }
});
```

## Message Handling

### Response Handler Setup

```typescript
// Single handler
r1.messaging.onMessage((response) => {
  console.log('New message:', response);
});

// Multiple handlers
const handler1 = (response) => console.log('Handler 1:', response.message);
const handler2 = (response) => console.log('Handler 2:', response.message);

r1.messaging.onMessage(handler1);
r1.messaging.onMessage(handler2);
```

### Response Object Structure

```typescript
interface PluginMessageResponse {
  message: string;           // Raw message text
  parsedData?: any;          // Auto-parsed JSON if applicable
  timestamp?: number;        // Message timestamp
  pluginId?: string;         // Source plugin ID
  type?: string;             // Message type
}
```

### Handler Management

```typescript
// Remove specific handler
r1.messaging.offMessage(handler1);

// Remove all handlers
r1.messaging.removeAllHandlers();
```

### Error Handling

```typescript
r1.messaging.onMessage((response) => {
  try {
    if (response.parsedData) {
      processData(response.parsedData);
    } else {
      displayText(response.message);
    }
  } catch (error) {
    console.error('Error processing message:', error);
    // Fallback to raw message
    displayText(response.message);
  }
});
```

## Advanced Features

### Image Analysis

Send images with text prompts for analysis.

```typescript
// Convert image to base64
const imageBase64 = await convertImageToBase64(imageFile);

// Send with image
await r1.messaging.sendMessage('Describe this image', {
  useLLM: true,
  imageBase64: imageBase64,
  pluginId: 'image-analyzer'
});
```

### Multi-turn Conversations

```typescript
class ConversationManager {
  constructor(private pluginId: string) {}

  async sendMessage(message: string) {
    return await r1.messaging.sendMessage(message, {
      useLLM: true,
      pluginId: this.pluginId
    });
  }

  async continueConversation(followUp: string) {
    return await this.sendMessage(followUp);
  }
}

// Usage
const convo = new ConversationManager('my-chat');
await convo.sendMessage('Hello');
await convo.continueConversation('How are you?');
```

### Context Management

```typescript
class ContextManager {
  private contexts: Map<string, any> = new Map();

  async queryWithContext(query: string, contextId: string) {
    // Include stored context
    const context = this.contexts.get(contextId);
    const fullQuery = context ?
      `Context: ${JSON.stringify(context)}\n\nQuery: ${query}` :
      query;

    const response = await r1.messaging.askLLM(fullQuery);

    // Store response for future context
    this.contexts.set(contextId, {
      lastQuery: query,
      lastResponse: response,
      timestamp: Date.now()
    });

    return response;
  }

  clearContext(contextId: string) {
    this.contexts.delete(contextId);
  }
}
```

### Rate Limiting

```typescript
class RateLimiter {
  private lastRequest = 0;
  private readonly minInterval = 1000; // 1 second

  async throttledRequest(message: string) {
    const now = Date.now();
    const timeSinceLast = now - this.lastRequest;

    if (timeSinceLast < this.minInterval) {
      await new Promise(resolve =>
        setTimeout(resolve, this.minInterval - timeSinceLast)
      );
    }

    this.lastRequest = Date.now();
    return await r1.messaging.askLLM(message);
  }
}
```

### Response Streaming

```typescript
// Handle streaming responses (if supported)
r1.messaging.onMessage((response) => {
  if (response.type === 'stream') {
    // Handle partial response
    updateUIWithPartialText(response.message);
  } else if (response.type === 'complete') {
    // Handle final response
    finalizeResponse(response.message);
  }
});
```

## Best Practices

### Message Design

1. **Clear prompts:** Be specific about what you want
2. **Context provision:** Include relevant context
3. **Format specification:** Specify desired output format
4. **Error handling:** Handle malformed responses

```typescript
// ✅ Good prompt
await r1.llm.askLLMJSON(`
  Analyze the sentiment of this text: "${userInput}"
  Return only valid JSON in this format:
  {"sentiment": "positive|negative|neutral", "confidence": 0.0-1.0}
`);

// ❌ Bad prompt
await r1.messaging.askLLM('What do you think about this? ' + userInput);
```

### Performance Optimization

1. **Debounce requests:** Prevent rapid-fire messages
2. **Cache responses:** Avoid duplicate queries
3. **Context limits:** Don't overload context
4. **Cleanup handlers:** Remove unused listeners

```typescript
// Debounced LLM requests
const debouncedLLM = debounce(async (query) => {
  await r1.messaging.askLLM(query);
}, 500);

// Context size management
class ContextManager {
  private maxContextLength = 4000;

  addToContext(newMessage: string) {
    const newContext = this.context + '\n' + newMessage;
    if (newContext.length > this.maxContextLength) {
      // Truncate older messages
      this.context = newContext.slice(-this.maxContextLength);
    } else {
      this.context = newContext;
    }
  }
}
```

### Error Recovery

1. **Retry failed requests**
2. **Fallback to simpler queries**
3. **Graceful degradation**
4. **User feedback**

```typescript
async function robustLLMQuery(query: string, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await r1.messaging.askLLM(query);
    } catch (error) {
      console.warn(`LLM query failed (attempt ${i + 1}):`, error);
      if (i === retries - 1) {
        // Last attempt failed
        return await fallbackResponse(query);
      }
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

### Security Considerations

1. **Input validation:** Sanitize user inputs
2. **Context isolation:** Use plugin IDs for separation
3. **Sensitive data:** Avoid sending sensitive information
4. **Rate limiting:** Implement reasonable limits

```typescript
// Input sanitization
function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML
    .slice(0, 1000);      // Limit length
}

// Plugin isolation
await r1.messaging.sendMessage(sanitizedInput, {
  useLLM: true,
  pluginId: 'my-secure-plugin'
});
```

## Troubleshooting

### Common Issues

**Messages not received:**
```typescript
// Check if messaging is available
const features = await r1.getAvailableFeatures();
if (!features.messaging) {
  console.error('Messaging not available - not in R1 environment');
}
```

**LLM responses not parsed:**
```typescript
// Ensure JSON responses are properly formatted
await r1.llm.askLLMJSON('Return valid JSON only: {"key": "value"}');
```

**Context lost:**
```typescript
// Use consistent plugin IDs
const PLUGIN_ID = 'my-plugin-v1';
await r1.messaging.sendMessage('Hello', { pluginId: PLUGIN_ID });
await r1.messaging.sendMessage('Remember that', { pluginId: PLUGIN_ID });
```

### Debug Logging

```typescript
// Enable detailed logging
r1.messaging.onMessage((response) => {
  console.log('Full response:', {
    message: response.message,
    parsedData: response.parsedData,
    timestamp: response.timestamp,
    pluginId: response.pluginId,
    type: response.type
  });
});
```

## Examples

### Chat Interface

```typescript
class ChatInterface {
  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners() {
    r1.messaging.onMessage((response) => {
      this.displayMessage(response.message, 'ai');
    });
  }

  async sendMessage(text: string) {
    this.displayMessage(text, 'user');
    await r1.messaging.askLLM(text);
  }

  private displayMessage(text: string, sender: 'user' | 'ai') {
    const messageEl = document.createElement('div');
    messageEl.className = `message ${sender}`;
    messageEl.textContent = text;
    chatContainer.appendChild(messageEl);
  }
}
```

### Voice Assistant

```typescript
class VoiceAssistant {
  private isListening = false;

  async startListening() {
    if (this.isListening) return;

    this.isListening = true;
    await r1.microphone.startRecording();

    // Visual feedback
    this.showListeningIndicator();
  }

  async stopListening() {
    if (!this.isListening) return;

    this.isListening = false;
    const audioBlob = await r1.microphone.stopRecording();

    // Process audio (would need speech-to-text service)
    const text = await this.transcribeAudio(audioBlob);

    // Send to LLM
    await r1.llm.askLLMSpeak(`User said: ${text}`);

    this.hideListeningIndicator();
  }

  private showListeningIndicator() {
    // Show visual feedback
  }

  private async transcribeAudio(audioBlob: Blob): Promise<string> {
    // Implement speech-to-text
    return 'transcribed text';
  }
}

// Hardware controls
r1.hardware.on('sideClick', () => {
  if (voiceAssistant.isListening) {
    voiceAssistant.stopListening();
  } else {
    voiceAssistant.startListening();
  }
});
```

### Smart Home Controller

```typescript
class SmartHomeController {
  async processCommand(command: string) {
    const prompt = `
      Parse this smart home command and return JSON:
      "${command}"

      Format: {"action": "turn_on|turn_off|adjust", "device": "lights|thermostat|tv", "value": "number or null"}
    `;

    await r1.llm.askLLMJSON(prompt);
  }

  private executeCommand(parsedCommand: any) {
    switch (parsedCommand.action) {
      case 'turn_on':
        this.turnOnDevice(parsedCommand.device);
        break;
      case 'turn_off':
        this.turnOffDevice(parsedCommand.device);
        break;
      case 'adjust':
        this.adjustDevice(parsedCommand.device, parsedCommand.value);
        break;
    }
  }
}

r1.messaging.onMessage((response) => {
  if (response.parsedData && response.parsedData.action) {
    smartHome.executeCommand(response.parsedData);
  }
});
```