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

export type SerpSearchTag = 'search' | 'image' | 'finance' | 'jobs' | 'weather' | 'hotels';

export interface SearchWebOptions extends Omit<MessageOptions, 'useSerpAPI'> {
  useLocation?: boolean;
  tag?: SerpSearchTag;
}

export interface WaitForMessageOptions {
  timeoutMs?: number;
  predicate?: (response: PluginMessageResponse & { parsedData?: any }) => boolean;
}

export interface EmailOptions extends Omit<MessageOptions, 'useLLM'> {
  instructionPrefix?: string;
}

export interface ImageMessageOptions extends Omit<MessageOptions, 'imageBase64' | 'useLLM'> {}

/**
 * Type-safe LLM response handler
 */
export type MessageHandler<T = any> = (response: PluginMessageResponse & { parsedData?: T }) => void;

export interface PushToTalkOptions {
  startEvent?: string;
  endEvent?: string;
  processMessage?: string;
  autoForwardTranscript?: boolean;
  onTranscript?: (transcript: string, response: PluginMessageResponse & { parsedData?: any }) => void;
}

/**
 * LLM and messaging API for R1 interactions
 */
export class R1Messaging {
  private messageHandlers: Set<MessageHandler> = new Set();
  private isInitialized = false;
  private pushToTalkCleanup: (() => void) | null = null;
  private sttListening = false;

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
  async searchWeb(query: string, options: SearchWebOptions = {}): Promise<void> {
    const {
      useLocation = false,
      tag = 'search',
      ...messageOptions
    } = options;

    const payload: PluginMessage = {
      message: JSON.stringify({
        query: query,
        useLocation,
        tag
      }),
      useSerpAPI: true,
      ...messageOptions
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
   * Wait for the next incoming plugin message.
   * Useful for request/response flows with timeout handling.
   */
  waitForNextMessage(options: WaitForMessageOptions = {}): Promise<PluginMessageResponse & { parsedData?: any }> {
    const { timeoutMs = 30000, predicate } = options;

    return new Promise((resolve, reject) => {
      let timeoutId: ReturnType<typeof setTimeout> | null = null;

      const handler: MessageHandler = (response) => {
        if (predicate && !predicate(response)) return;

        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        this.offMessage(handler);
        resolve(response);
      };

      this.onMessage(handler);

      timeoutId = setTimeout(() => {
        this.offMessage(handler);
        reject(new Error(`Timed out waiting for plugin message after ${timeoutMs}ms`));
      }, timeoutMs);
    });
  }

  /**
   * Send a message to LLM and await the next matching response.
   */
  async askLLMWithTimeout(
    message: string,
    options: LLMOptions = {},
    waitOptions: WaitForMessageOptions = {}
  ): Promise<PluginMessageResponse & { parsedData?: any }> {
    const responsePromise = this.waitForNextMessage(waitOptions);
    await this.askLLM(message, options);
    return responsePromise;
  }

  /**
   * Ask the LLM to email content to the user.
   */
  async emailUser(content: string, options: EmailOptions = {}): Promise<void> {
    const {
      instructionPrefix = 'Please email this to the user:',
      ...messageOptions
    } = options;

    await this.sendMessage(`${instructionPrefix} ${content}`, {
      useLLM: true,
      wantsJournalEntry: false,
      ...messageOptions
    });
  }

  /**
   * Send an image to AI with an optional prompt.
   *
   * Common patterns:
   * - Ask about image: provide a question prompt.
   * - Transform image: use a prompt like "take a photo and make it ...".
   * - No-prompt processing: pass empty prompt.
   */
  async sendImageToAI(
    imageBase64: string,
    prompt: string = '',
    options: ImageMessageOptions = {}
  ): Promise<void> {
    const message = prompt.trim();
    const normalizedImage = this.normalizeImagePayload(imageBase64);

    await this.sendMessage(message, {
      useLLM: true,
      imageBase64: normalizedImage,
      ...options
    });
  }

  /**
   * Ask AI about an image by sending image + prompt.
   */
  async askAboutImage(
    imageBase64: string,
    prompt: string,
    options: ImageMessageOptions = {}
  ): Promise<void> {
    await this.sendImageToAI(imageBase64, prompt, options);
  }

  /**
   * Transform an image using the common R1 phrasing.
   * Sends: "take a photo and make it <prompt>" + image.
   */
  async transformImage(
    imageBase64: string,
    transformPrompt: string,
    options: ImageMessageOptions = {}
  ): Promise<void> {
    const prompt = transformPrompt.trim().length > 0
      ? `take a photo and make it ${transformPrompt}`
      : 'take a photo and make it better';

    await this.sendImageToAI(imageBase64, prompt, options);
  }

  /**
   * Runtime availability checks for messaging-related R1 bridges.
   */
  getRuntimeCapabilities(): {
    pluginMessageHandler: boolean;
    creationVoiceHandler: boolean;
    closeWebView: boolean;
  } {
    return {
      pluginMessageHandler: typeof PluginMessageHandler !== 'undefined',
      creationVoiceHandler: typeof CreationVoiceHandler !== 'undefined',
      closeWebView: typeof closeWebView !== 'undefined'
    };
  }

  /**
   * Start STT listening programmatically.
   * Equivalent to: `CreationVoiceHandler.postMessage('start')`
   */
  startSTTListening(): void {
    if (typeof CreationVoiceHandler === 'undefined') {
      throw new Error('CreationVoiceHandler not available. Make sure you are running in R1 environment.');
    }

    CreationVoiceHandler.postMessage('start');
    this.sttListening = true;
  }

  /**
   * Stop STT listening programmatically.
   * Equivalent to: `CreationVoiceHandler.postMessage('stop')`
   */
  stopSTTListening(): void {
    if (typeof CreationVoiceHandler === 'undefined') {
      throw new Error('CreationVoiceHandler not available. Make sure you are running in R1 environment.');
    }

    CreationVoiceHandler.postMessage('stop');
    this.sttListening = false;
  }

  /**
   * Returns whether STT is currently listening based on SDK-triggered state.
   */
  isSTTListening(): boolean {
    return this.sttListening;
  }

  /**
   * Enable push-to-talk using hardware long press events and STT messages.
   *
   * Default behavior:
   * - `longPressStart` => `CreationVoiceHandler.postMessage('start')`
   * - `longPressEnd` => `CreationVoiceHandler.postMessage('stop')`
   * - On `sttEnded` with transcript, forwards:
   *   `{ message: 'process_voice_input', transcript }` via PluginMessageHandler
   */
  enablePushToTalk(options: PushToTalkOptions = {}): () => void {
    if (typeof window === 'undefined') {
      throw new Error('Push-to-talk is only available in browser environments.');
    }

    if (typeof CreationVoiceHandler === 'undefined') {
      throw new Error('CreationVoiceHandler not available. Make sure you are running in R1 environment.');
    }

    this.disablePushToTalk();

    const {
      startEvent = 'longPressStart',
      endEvent = 'longPressEnd',
      processMessage = 'process_voice_input',
      autoForwardTranscript = true,
      onTranscript
    } = options;

    const handleStart = () => {
      this.startSTTListening();
    };

    const handleEnd = () => {
      this.stopSTTListening();
    };

    const transcriptHandler: MessageHandler = (data) => {
      const type = data.type;
      const transcript = data.transcript;

      if (type !== 'sttEnded' || !transcript) return;

      onTranscript?.(transcript, data);

      if (autoForwardTranscript && typeof PluginMessageHandler !== 'undefined') {
        PluginMessageHandler.postMessage(
          JSON.stringify({
            message: processMessage,
            transcript
          })
        );
      }
    };

    window.addEventListener(startEvent, handleStart);
    window.addEventListener(endEvent, handleEnd);
    this.onMessage(transcriptHandler);

    this.pushToTalkCleanup = () => {
      window.removeEventListener(startEvent, handleStart);
      window.removeEventListener(endEvent, handleEnd);
      this.offMessage(transcriptHandler);
      this.pushToTalkCleanup = null;
    };

    return () => this.disablePushToTalk();
  }

  /**
   * Disable push-to-talk listeners previously configured via enablePushToTalk.
   */
  disablePushToTalk(): void {
    this.pushToTalkCleanup?.();
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

    const previousOnPluginMessage = window.onPluginMessage;

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

        const objectData = parsedData && typeof parsedData === 'object' ? parsedData as Record<string, unknown> : null;
        const typeFromParsed = typeof objectData?.type === 'string' ? objectData.type : undefined;
        const transcriptFromParsed = typeof objectData?.transcript === 'string' ? objectData.transcript : undefined;

        // Call all registered handlers
        const enhancedData = {
          ...data,
          type: data.type ?? typeFromParsed,
          transcript: data.transcript ?? transcriptFromParsed,
          parsedData
        };
        this.messageHandlers.forEach(handler => {
          try {
            handler(enhancedData);
          } catch (error) {
            console.error('Error in message handler:', error);
          }
        });

        if (previousOnPluginMessage) {
          try {
            previousOnPluginMessage(data);
          } catch (error) {
            console.error('Error in pre-existing onPluginMessage handler:', error);
          }
        }
      } catch (error) {
        console.error('Error processing plugin message:', error);
      }
    };

    this.isInitialized = true;
  }

  /**
   * Normalize image payload for R1 bridge compatibility.
   * Accepts either full data URL or raw base64 and returns a data URL string.
   */
  private normalizeImagePayload(image: string): string {
    const value = image.trim();
    if (value.startsWith('data:image/')) {
      return value;
    }

    // Default to jpeg wrapper when only raw base64 is provided.
    return `data:image/jpeg;base64,${value}`;
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
   * Analyze a base64-encoded image with the LLM.
   * @param prompt Analysis prompt
   * @param imageBase64 Base64 image string (without data URL prefix)
   * @param options Additional message options
   */
  async analyzeImageBase64(
    prompt: string,
    imageBase64: string,
    options: Omit<MessageOptions, 'imageBase64' | 'useLLM'> = {}
  ): Promise<void> {
    await this.messaging.sendMessage(prompt, {
      useLLM: true,
      imageBase64,
      ...options
    });
  }

  /**
   * Send an image to AI with optional prompt.
   * Empty prompt triggers no-prompt image processing.
   */
  async imageToAI(
    imageBase64: string,
    prompt: string = '',
    options: ImageMessageOptions = {}
  ): Promise<void> {
    await this.messaging.sendImageToAI(imageBase64, prompt, options);
  }

  /**
   * Ask AI about an image (image + prompt).
   */
  async askImage(
    imageBase64: string,
    prompt: string,
    options: ImageMessageOptions = {}
  ): Promise<void> {
    await this.messaging.askAboutImage(imageBase64, prompt, options);
  }

  /**
   * Transform an image with phrasing:
   * "take a photo and make it <prompt>".
   */
  async transformPhoto(
    imageBase64: string,
    prompt: string,
    options: ImageMessageOptions = {}
  ): Promise<void> {
    await this.messaging.transformImage(imageBase64, prompt, options);
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