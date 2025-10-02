/**
 * LLM and messaging module for R1 AI integration
 * Provides structured messaging and LLM interaction capabilities
 */

import type { PluginMessage, PluginMessageResponse, SpeechSynthesisOptions } from '../types';

export interface LLMOptions {
  wantsR1Response?: boolean;    // Whether LLM should speak through R1 speaker
  wantsJournalEntry?: boolean;  // Whether to log interaction to journal
}

export interface MessageOptions extends LLMOptions {
  useLLM?: boolean;  // Whether to use LLM for response generation
  useSerpAPI?: boolean;  // Whether to use SERP API for web search
  pluginId?: string;  // Optional plugin identifier
  imageBase64?: string;  // Optional base64-encoded image
}

/**
 * Type-safe LLM response handler
 */
export type MessageHandler<T = any> = (response: PluginMessageResponse & { parsedData?: T }) => void;

/**
 * LLM and messaging API for R1 interactions
 */
export class R1Messaging {
  private messageHandlers: Set<MessageHandler> = new Set();
  private isInitialized = false;

  constructor() {
    this.initializeMessageHandler();
  }

  /**
   * Send a simple message to the server
   * @param message Message text
   * @param options Message options
   */
  async sendMessage(message: string, options: MessageOptions = {}): Promise<void> {
    const payload: PluginMessage = {
      message,
      ...options
    };

    if (typeof PluginMessageHandler !== 'undefined') {
      PluginMessageHandler.postMessage(JSON.stringify(payload));
    } else {
      throw new Error('PluginMessageHandler not available. Make sure you are running in R1 environment.');
    }
  }

  /**
   * Send a message and get LLM response
   * @param message Message text
   * @param options LLM options
   */
  async askLLM(message: string, options: LLMOptions = {}): Promise<void> {
    await this.sendMessage(message, {
      useLLM: true,
      ...options
    });
  }

  /**
   * Send a SERP API request for web search
   * @param query Search query
   * @param options Additional options
   */
  async searchWeb(query: string, options: Omit<MessageOptions, 'useSerpAPI'> = {}): Promise<void> {
    const payload: PluginMessage = {
      message: JSON.stringify({
        query: query,
        useLocation: false,
        tag: 'search'
      }),
      useSerpAPI: true,
      ...options
    };

    if (typeof PluginMessageHandler !== 'undefined') {
      PluginMessageHandler.postMessage(JSON.stringify(payload));
    } else {
      throw new Error('PluginMessageHandler not available. Make sure you are running in R1 environment.');
    }
  }

  /**
   * Send text for text-to-speech output (without LLM processing)
   * @param text Text to speak
   * @param options Additional options
   */
  async speakText(text: string, options: Omit<MessageOptions, 'useLLM' | 'wantsR1Response'> = {}): Promise<void> {
    await this.sendMessage(text, {
      useLLM: false,
      wantsR1Response: true,
      ...options
    });
  }

  /**
   * Ask LLM to speak response through R1 speaker
   * @param message Message text
   * @param saveToJournal Whether to save interaction to journal
   */
  async askLLMSpeak(message: string, saveToJournal: boolean = false): Promise<void> {
    await this.askLLM(message, {
      wantsR1Response: true,
      wantsJournalEntry: saveToJournal
    });
  }

  /**
   * Ask LLM for JSON structured response
   * @param message Message text (should specify desired JSON format)
   * @param options LLM options
   */
  async askLLMJSON<T = any>(message: string, options: LLMOptions = {}): Promise<void> {
    const jsonMessage = message.includes('JSON') ? message : 
      `${message}. Please respond with a valid JSON object.`;
    
    await this.askLLM(jsonMessage, options);
  }

  /**
   * Add message handler for incoming responses
   * @param handler Function to handle incoming messages
   */
  onMessage<T = any>(handler: MessageHandler<T>): void {
    this.messageHandlers.add(handler);
  }

  /**
   * Remove message handler
   * @param handler Handler function to remove
   */
  offMessage(handler: MessageHandler): void {
    this.messageHandlers.delete(handler);
  }

  /**
   * Remove all message handlers
   */
  removeAllHandlers(): void {
    this.messageHandlers.clear();
  }

  /**
   * Close the current plugin/webview
   */
  closePlugin(): void {
    if (typeof closeWebView !== 'undefined') {
      closeWebView.postMessage('');
    }
  }

  private initializeMessageHandler(): void {
    if (this.isInitialized || typeof window === 'undefined') return;

    // Set up global message handler
    window.onPluginMessage = (data: PluginMessageResponse) => {
      try {
        // Try to parse data.data as JSON if it exists
        let parsedData = undefined;
        if (data.data) {
          try {
            parsedData = JSON.parse(data.data);
          } catch (e) {
            // data.data is not valid JSON, keep as string
            parsedData = data.data;
          }
        }

        // Call all registered handlers
        const enhancedData = { ...data, parsedData };
        this.messageHandlers.forEach(handler => {
          try {
            handler(enhancedData);
          } catch (error) {
            console.error('Error in message handler:', error);
          }
        });
      } catch (error) {
        console.error('Error processing plugin message:', error);
      }
    };

    this.isInitialized = true;
  }

  /**
   * Generate audio file from text-to-speech (browser only)
   * Uses Web Speech API to synthesize speech and capture as audio blob
   * @param text Text to convert to audio
   * @param options Speech synthesis options
   * @returns Promise resolving to audio blob or null if not supported
   */
  async textToSpeechAudio(text: string, options: SpeechSynthesisOptions = {}): Promise<Blob | null> {
    // Only works in browser environment
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      throw new Error('Text-to-speech audio generation only available in browser with Web Speech API support');
    }

    return new Promise((resolve, reject) => {
      try {
        // Create speech utterance
        const utterance = new SpeechSynthesisUtterance(text);

        // Apply options
        if (options.voice) utterance.voice = options.voice;
        if (options.rate !== undefined) utterance.rate = options.rate;
        if (options.pitch !== undefined) utterance.pitch = options.pitch;
        if (options.volume !== undefined) utterance.volume = options.volume;

        // Listen for speech end
        utterance.onend = () => {
          // Currently, we can't capture the audio output from speech synthesis
          // This would require advanced techniques like AudioWorklet or WebRTC
          // For now, we just speak and return null
          resolve(null);
        };

        utterance.onerror = (error) => {
          reject(new Error(`Speech synthesis failed: ${error.error}`));
        };

        // Speak the text
        window.speechSynthesis.speak(utterance);

      } catch (error) {
        reject(error);
      }
    });
  }
}

/**
 * Convenient helper functions for common LLM interactions
 */
export class LLMHelpers {
  constructor(private messaging: R1Messaging) {}

  /**
   * Ask LLM about user memories/context
   */
  async getUserMemories(): Promise<void> {
    await this.messaging.askLLMJSON(
      "Tell me what you know about me. Return only a JSON message formatted as {'facts': ['fact1', 'fact2', ...]}"
    );
  }

  /**
   * Ask LLM to analyze an image or data
   * @param prompt Analysis prompt
   * @param data Optional data to analyze
   */
  async analyzeData(prompt: string, data?: any): Promise<void> {
    let message = prompt;
    if (data) {
      message += ` Data: ${JSON.stringify(data)}`;
    }
    message += ' Please respond with a JSON analysis.';
    
    await this.messaging.askLLMJSON(message);
  }

  /**
   * Ask LLM to perform a task and speak the result
   * @param task Task description
   * @param saveToJournal Whether to save to journal
   */
  async performTask(task: string, saveToJournal: boolean = true): Promise<void> {
    await this.messaging.askLLMSpeak(task, saveToJournal);
  }

  /**
   * Convert text to speech using R1 speaker (no LLM processing)
   * @param text Text to speak
   * @param saveToJournal Whether to save to journal
   */
  async textToSpeech(text: string, saveToJournal: boolean = false): Promise<void> {
    await this.messaging.speakText(text, { wantsJournalEntry: saveToJournal });
  }

  /**
   * Get LLM suggestions for user interface
   * @param context Current UI context
   */
  async getUISuggestions(context: string): Promise<void> {
    await this.messaging.askLLMJSON(
      `Given this UI context: "${context}", provide suggestions for user actions. ` +
      `Respond with JSON format: {"suggestions": [{"action": "action_name", "description": "description"}]}`
    );
  }

  /**
   * Generate audio file from text-to-speech (browser only)
   * @param text Text to convert to audio
   * @param options Speech synthesis options
   */
  async textToSpeechAudio(text: string, options: SpeechSynthesisOptions = {}): Promise<Blob | null> {
    return this.messaging.textToSpeechAudio(text, options);
  }
}

// Export singleton instances
export const messaging = new R1Messaging();
export const llmHelpers = new LLMHelpers(messaging);