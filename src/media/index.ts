/**
 * Media API module for R1 device
 * Provides access to camera, microphone, and speaker using standard web APIs
 * Optimized for R1 hardware limitations and mobile performance
 */

export interface MediaDeviceInfo {
  deviceId: string;
  kind: 'audioinput' | 'audiooutput' | 'videoinput';
  label: string;
  groupId: string;
}

export interface AudioConfig {
  sampleRate?: number;
  channelCount?: number;
  echoCancellation?: boolean;
  noiseSuppression?: boolean;
  autoGainControl?: boolean;
}

export interface VideoConfig {
  width?: number;
  height?: number;
  frameRate?: number;
  facingMode?: 'user' | 'environment';
}

export interface RecordingOptions {
  audio?: boolean | AudioConfig;
  video?: boolean | VideoConfig;
  mimeType?: string;
  audioBitsPerSecond?: number;
  videoBitsPerSecond?: number;
}

// Add missing RecordingState type
export type RecordingState = 'inactive' | 'recording' | 'paused';

/**
 * Camera API for R1 device
 */
export class CameraAPI {
  private stream: MediaStream | null = null;
  private videoElement: HTMLVideoElement | null = null;

  /**
   * Check if camera is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.some(device => device.kind === 'videoinput');
    } catch {
      return false;
    }
  }

  /**
   * Start camera stream
   * @param config Video configuration
   */
  async start(config: VideoConfig = {}): Promise<MediaStream> {
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          width: config.width || 240,
          height: config.height || 282,
          frameRate: config.frameRate || 30,
          facingMode: config.facingMode || 'user'
        },
        audio: false
      };

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      return this.stream;
    } catch (error) {
      throw new Error(`Failed to start camera: ${error}`);
    }
  }

  /**
   * Stop camera stream
   */
  stop(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    
    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }
  }

  /**
   * Get camera stream
   */
  getStream(): MediaStream | null {
    return this.stream;
  }

  /**
   * Create video element with stream
   * @param autoplay Whether to autoplay video
   * @param muted Whether to mute video
   */
  createVideoElement(autoplay: boolean = true, muted: boolean = true): HTMLVideoElement {
    if (!this.stream) {
      throw new Error('Camera stream not started');
    }

    this.videoElement = document.createElement('video');
    this.videoElement.srcObject = this.stream;
    this.videoElement.autoplay = autoplay;
    this.videoElement.muted = muted;
    this.videoElement.playsInline = true;

    // Optimize for R1 display
    this.videoElement.style.width = '100%';
    this.videoElement.style.height = '100%';
    this.videoElement.style.objectFit = 'cover';

    return this.videoElement;
  }

  /**
   * Capture photo from camera stream
   * @param width Image width (default: 240)
   * @param height Image height (default: 282)
   */
  capturePhoto(width: number = 240, height: number = 282): string | null {
    if (!this.videoElement || !this.stream) {
      throw new Error('Camera not started');
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    if (!context) return null;

    context.drawImage(this.videoElement, 0, 0, width, height);
    return canvas.toDataURL('image/jpeg', 0.8);
  }

  /**
   * Switch camera (front/back)
   */
  async switchCamera(): Promise<void> {
    if (!this.stream) {
      throw new Error('Camera not started');
    }

    const videoTrack = this.stream.getVideoTracks()[0];
    const currentFacingMode = videoTrack.getSettings().facingMode;
    const newFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';

    this.stop();
    await this.start({ facingMode: newFacingMode });
  }
}

/**
 * Microphone API for R1 device
 */
export class MicrophoneAPI {
  private stream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];

  /**
   * Check if microphone is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.some(device => device.kind === 'audioinput');
    } catch {
      return false;
    }
  }

  /**
   * Start microphone stream
   * @param config Audio configuration
   */
  async start(config: AudioConfig = {}): Promise<MediaStream> {
    try {
      const constraints: MediaStreamConstraints = {
        audio: {
          sampleRate: config.sampleRate || 44100,
          channelCount: config.channelCount || 1,
          echoCancellation: config.echoCancellation ?? true,
          noiseSuppression: config.noiseSuppression ?? true,
          autoGainControl: config.autoGainControl ?? true
        }
      };

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      return this.stream;
    } catch (error) {
      throw new Error(`Failed to start microphone: ${error}`);
    }
  }

  /**
   * Stop microphone stream
   */
  stop(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
  }

  /**
   * Start recording audio
   * @param options Recording options
   */
  async startRecording(options: RecordingOptions = {}): Promise<void> {
    if (!this.stream) {
      await this.start();
    }

    if (!this.stream) {
      throw new Error('Failed to start microphone stream');
    }

    this.recordedChunks = [];
    this.mediaRecorder = new MediaRecorder(this.stream, {
      mimeType: options.mimeType || 'audio/webm',
      audioBitsPerSecond: options.audioBitsPerSecond || 128000
    });

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.recordedChunks.push(event.data);
      }
    };

    this.mediaRecorder.start();
  }

  /**
   * Stop recording and get audio blob
   */
  async stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('Recording not started'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, { type: 'audio/webm' });
        resolve(blob);
      };

      this.mediaRecorder.onerror = (event) => {
        reject(new Error('Recording failed'));
      };

      this.mediaRecorder.stop();
    });
  }

  /**
   * Get current recording state
   */
  getRecordingState(): RecordingState {
    return this.mediaRecorder?.state || 'inactive';
  }

  /**
   * Get audio stream
   */
  getStream(): MediaStream | null {
    return this.stream;
  }
}

/**
 * Speaker API for R1 device
 */
export class SpeakerAPI {
  private audioContext: AudioContext | null = null;
  private currentAudio: HTMLAudioElement | null = null;

  /**
   * Initialize audio context
   */
  private async initializeAudioContext(): Promise<void> {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
    }
  }

  /**
   * Play audio from URL or blob
   * @param source Audio source (URL, blob, or base64)
   * @param volume Volume level (0-1)
   */
  async play(source: string | Blob, volume: number = 1): Promise<void> {
    await this.initializeAudioContext();

    return new Promise((resolve, reject) => {
      this.currentAudio = new Audio();
      this.currentAudio.volume = Math.max(0, Math.min(1, volume));

      this.currentAudio.onended = () => resolve();
      this.currentAudio.onerror = () => reject(new Error('Audio playback failed'));

      if (source instanceof Blob) {
        this.currentAudio.src = URL.createObjectURL(source);
      } else {
        this.currentAudio.src = source;
      }

      this.currentAudio.play().catch(reject);
    });
  }

  /**
   * Stop current audio playback
   */
  stop(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      
      if (this.currentAudio.src.startsWith('blob:')) {
        URL.revokeObjectURL(this.currentAudio.src);
      }
    }
  }

  /**
   * Set volume for current audio
   * @param volume Volume level (0-1)
   */
  setVolume(volume: number): void {
    if (this.currentAudio) {
      this.currentAudio.volume = Math.max(0, Math.min(1, volume));
    }
  }

  /**
   * Generate and play tone
   * @param frequency Frequency in Hz
   * @param duration Duration in milliseconds
   * @param volume Volume level (0-1)
   */
  async playTone(frequency: number, duration: number, volume: number = 0.5): Promise<void> {
    await this.initializeAudioContext();

    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);

    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + duration / 1000);

    return new Promise(resolve => {
      oscillator.onended = () => resolve();
    });
  }

  /**
   * Check if audio is currently playing
   */
  isPlaying(): boolean {
    return this.currentAudio ? !this.currentAudio.paused : false;
  }
}

/**
 * Media device utilities
 */
export class MediaUtils {
  /**
   * Get available media devices
   */
  static async getDevices(): Promise<MediaDeviceInfo[]> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.map(device => ({
        deviceId: device.deviceId,
        kind: device.kind as 'audioinput' | 'audiooutput' | 'videoinput',
        label: device.label,
        groupId: device.groupId
      }));
    } catch {
      return [];
    }
  }

  /**
   * Check if specific media type is supported
   * @param type Media type to check
   */
  static async isSupported(type: 'camera' | 'microphone' | 'speaker'): Promise<boolean> {
    switch (type) {
      case 'camera':
        return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
      case 'microphone':
        return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
      case 'speaker':
        return !!(window.AudioContext || (window as any).webkitAudioContext);
      default:
        return false;
    }
  }

  /**
   * Convert blob to base64 string
   * @param blob Blob to convert
   */
  static blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]); // Remove data URL prefix
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Convert base64 string to blob
   * @param base64 Base64 string
   * @param mimeType MIME type
   */
  static base64ToBlob(base64: string, mimeType: string): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  }
}

// Export singleton instances
export const camera = new CameraAPI();
export const microphone = new MicrophoneAPI();
export const speaker = new SpeakerAPI();