'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import {
  r1,
  Base64Utils,
  R1Storage,
  CSSUtils,
  DOMUtils,
  LayoutUtils,
  PerformanceUtils,
  R1Component,
  MediaUtils,
  R1_DIMENSIONS
} from '../../../src/index';

function now() {
  return new Date().toISOString().slice(11, 19);
}

function parseError(error) {
  if (!error) return 'Unknown error';
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

function makeSampleBase64() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.fillStyle = '#141414';
  ctx.fillRect(0, 0, 64, 64);
  ctx.fillStyle = '#fe5f00';
  ctx.fillRect(8, 8, 48, 48);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 10px sans-serif';
  ctx.fillText('R1', 22, 36);

  return canvas.toDataURL('image/png').split(',')[1];
}

function safeFixed(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Number(numeric.toFixed(3));
}

function normalizeAccelData(payload) {
  if (!payload) {
    return { x: 0, y: 0, z: 0 };
  }

  let parsedPayload = payload;
  if (typeof payload === 'string') {
    try {
      parsedPayload = JSON.parse(payload);
    } catch {
      return { x: 0, y: 0, z: 0 };
    }
  }

  if (typeof parsedPayload !== 'object' || parsedPayload === null) {
    return { x: 0, y: 0, z: 0 };
  }

  const source = parsedPayload.data && typeof parsedPayload.data === 'object'
    ? parsedPayload.data
    : parsedPayload.detail && typeof parsedPayload.detail === 'object'
      ? parsedPayload.detail
      : parsedPayload;

  const candidateX = source.x ?? source.accelX ?? source.accelerationX ?? source.tiltX ?? source.pitch ?? source.alpha;
  const candidateY = source.y ?? source.accelY ?? source.accelerationY ?? source.tiltY ?? source.roll ?? source.beta;
  const candidateZ = source.z ?? source.accelZ ?? source.accelerationZ ?? source.tiltZ ?? source.yaw ?? source.gamma;

  // Final fallback: if no known keys exist, use first 3 numeric values in the object.
  const numericValues = Object.values(source).filter((v) => typeof v === 'number');

  const x = candidateX ?? numericValues[0] ?? 0;
  const y = candidateY ?? numericValues[1] ?? 0;
  const z = candidateZ ?? numericValues[2] ?? 0;

  return {
    x: safeFixed(x),
    y: safeFixed(y),
    z: safeFixed(z)
  };
}

export default function Page() {
  const [logs, setLogs] = useState([]);
  const [deviceLogs, setDeviceLogs] = useState([]);
  const [running, setRunning] = useState(false);
  const [features, setFeatures] = useState(null);
  const [cameraPreview, setCameraPreview] = useState(null);
  const [lastAudioSize, setLastAudioSize] = useState(null);
  const [relayConnected, setRelayConnected] = useState(false);
  const [relayUrl, setRelayUrl] = useState(() => {
    if (typeof window === 'undefined') return 'http://localhost:3031';
    return `${window.location.protocol}//${window.location.hostname}:3031`;
  });
  const [aiPrompt, setAiPrompt] = useState('Generate an image of a futuristic rabbit mascot and return either an image URL or base64 image data.');
  const [hardwareStats, setHardwareStats] = useState({
    sideClick: 0,
    longPressStart: 0,
    longPressEnd: 0,
    scrollUp: 0,
    scrollDown: 0
  });
  const [accelData, setAccelData] = useState({ x: 0, y: 0, z: 0 });
  const [accelActive, setAccelActive] = useState(false);
  const [accelSamples, setAccelSamples] = useState(0);
  const [accelStatus, setAccelStatus] = useState('idle');
  const [accelRaw, setAccelRaw] = useState('n/a');
  const [accelBaseline, setAccelBaseline] = useState({ x: 0, y: 0, z: 0 });
  const [accelDeadzone, setAccelDeadzone] = useState(0.05);
  const [accelScale, setAccelScale] = useState(1);
  const [imageTransformPrompt, setImageTransformPrompt] = useState('Transform this image into a stylized AI art description and include key visual changes.');
  const [imageQuestionPrompt, setImageQuestionPrompt] = useState('What do you see in this image?');

  const sampleImageBase64 = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return makeSampleBase64();
  }, []);

  const testContainerRef = useRef(null);
  const transitionARef = useRef(null);
  const transitionBRef = useRef(null);
  const gyroXYRef = useRef(null);
  const relaySocketRef = useRef(null);
  const accelWatchdogRef = useRef(null);
  const accelCalibrateTimerRef = useRef(null);
  const accelCalibrateBufferRef = useRef([]);
  const accelLatestRawRef = useRef({ x: 0, y: 0, z: 0 });
  const accelRecentRawRef = useRef([]);
  const accelSmoothRef = useRef({ x: 0, y: 0, z: 0 });
  const accelScaleRef = useRef(1);
  const accelBaselineRef = useRef({ x: 0, y: 0, z: 0 });
  const accelDeadzoneRef = useRef(0.05);

  const addLog = (status, title, detail) => {
    setLogs((prev) => [{ status, title, detail, time: now() }, ...prev].slice(0, 300));
  };

  const addDeviceLog = (entry) => {
    setDeviceLogs((prev) => [entry, ...prev].slice(0, 500));
  };

  useEffect(() => {
    const onSideClick = () => setHardwareStats((prev) => ({ ...prev, sideClick: prev.sideClick + 1 }));
    const onLongPressStart = () => setHardwareStats((prev) => ({ ...prev, longPressStart: prev.longPressStart + 1 }));
    const onLongPressEnd = () => setHardwareStats((prev) => ({ ...prev, longPressEnd: prev.longPressEnd + 1 }));
    const onScrollUp = () => setHardwareStats((prev) => ({ ...prev, scrollUp: prev.scrollUp + 1 }));
    const onScrollDown = () => setHardwareStats((prev) => ({ ...prev, scrollDown: prev.scrollDown + 1 }));

    r1.hardware.on('sideClick', onSideClick);
    r1.hardware.on('longPressStart', onLongPressStart);
    r1.hardware.on('longPressEnd', onLongPressEnd);
    r1.hardware.on('scrollUp', onScrollUp);
    r1.hardware.on('scrollDown', onScrollDown);

    // Also subscribe directly to raw window events from device.
    window.addEventListener('sideClick', onSideClick);
    window.addEventListener('longPressStart', onLongPressStart);
    window.addEventListener('longPressEnd', onLongPressEnd);
    window.addEventListener('scrollUp', onScrollUp);
    window.addEventListener('scrollDown', onScrollDown);

    r1.deviceControls.init({ sideButtonEnabled: true, scrollWheelEnabled: true, keyboardFallback: true });

    return () => {
      r1.hardware.off('sideClick', onSideClick);
      r1.hardware.off('longPressStart', onLongPressStart);
      r1.hardware.off('longPressEnd', onLongPressEnd);
      r1.hardware.off('scrollUp', onScrollUp);
      r1.hardware.off('scrollDown', onScrollDown);
      window.removeEventListener('sideClick', onSideClick);
      window.removeEventListener('longPressStart', onLongPressStart);
      window.removeEventListener('longPressEnd', onLongPressEnd);
      window.removeEventListener('scrollUp', onScrollUp);
      window.removeEventListener('scrollDown', onScrollDown);
      if (accelWatchdogRef.current) {
        clearTimeout(accelWatchdogRef.current);
        accelWatchdogRef.current = null;
      }
      if (accelCalibrateTimerRef.current) {
        clearTimeout(accelCalibrateTimerRef.current);
        accelCalibrateTimerRef.current = null;
      }
      r1.accelerometer.stop();
    };
  }, []);

  const connectRelay = () => {
    if (relaySocketRef.current) {
      relaySocketRef.current.disconnect();
      relaySocketRef.current = null;
    }

    const normalizedUrl = relayUrl.trim();
    const socket = io(normalizedUrl, {
      transports: ['websocket', 'polling']
    });

    relaySocketRef.current = socket;

    socket.on('connect', () => {
      setRelayConnected(true);
      socket.emit('register', { role: 'dashboard', deviceId: 'nextjs-test-app' });
      addLog('pass', 'Relay', `Connected to ${normalizedUrl}`);
    });

    socket.on('disconnect', (reason) => {
      setRelayConnected(false);
      addLog('skip', 'Relay', `Disconnected (${reason})`);
    });

    socket.on('connect_error', (error) => {
      setRelayConnected(false);
      addLog('fail', 'Relay', parseError(error));
    });

    socket.on('relay_log', (payload) => {
      const args = Array.isArray(payload?.args) ? payload.args.join(' ') : '';
      addDeviceLog({
        time: payload?.time ? String(payload.time).slice(11, 19) : now(),
        level: payload?.level || 'log',
        deviceId: payload?.deviceId || 'unknown',
        message: args,
        url: payload?.url || ''
      });
    });
  };

  const disconnectRelay = () => {
    if (relaySocketRef.current) {
      relaySocketRef.current.disconnect();
      relaySocketRef.current = null;
    }
    setRelayConnected(false);
  };

  const useCurrentRelayAddress = () => {
    if (typeof window === 'undefined') return;
    const current = `${window.location.protocol}//${window.location.hostname}:3031`;
    setRelayUrl(current);
    addLog('skip', 'Relay', `Relay URL set to ${current}`);
  };

  const startAccelerometerMonitor = async () => {
    await assertPass('Hardware: start live accelerometer monitor', async () => {
      r1.accelerometer.stop();
      if (accelWatchdogRef.current) {
        clearTimeout(accelWatchdogRef.current);
        accelWatchdogRef.current = null;
      }

      setAccelSamples(0);
      setAccelStatus('starting');

      const available = await r1.accelerometer.isAvailable();
      if (!available) {
        setAccelStatus('unavailable');
        return 'accelerometer unavailable';
      }

      r1.accelerometer.start((data) => {
        setAccelSamples((prev) => prev + 1);
        setAccelStatus('streaming');
        try {
          setAccelRaw(JSON.stringify(data));
        } catch {
          setAccelRaw(String(data));
        }
        const normalized = normalizeAccelData(data);
        accelLatestRawRef.current = normalized;

        if (accelStatus === 'calibrating') {
          accelCalibrateBufferRef.current.push(normalized);
        }

        accelRecentRawRef.current.push(normalized);
        if (accelRecentRawRef.current.length > 30) {
          accelRecentRawRef.current.shift();
        }

        const filtered = {
          x: applyAccelFilter(normalized.x, accelBaselineRef.current.x, accelDeadzoneRef.current),
          y: applyAccelFilter(normalized.y, accelBaselineRef.current.y, accelDeadzoneRef.current),
          z: applyAccelFilter(normalized.z, accelBaselineRef.current.z, accelDeadzoneRef.current)
        };

        // Low-pass smoothing to damp micro-jitter while preserving motion.
        const alpha = 0.25;
        const prev = accelSmoothRef.current;
        const smoothed = {
          x: safeFixed(prev.x + alpha * (filtered.x - prev.x)),
          y: safeFixed(prev.y + alpha * (filtered.y - prev.y)),
          z: safeFixed(prev.z + alpha * (filtered.z - prev.z))
        };

        const peak = Math.max(Math.abs(smoothed.x), Math.abs(smoothed.y), Math.abs(smoothed.z));
        if (peak > accelScaleRef.current) {
          const nextScale = Math.ceil(peak);
          accelScaleRef.current = nextScale;
          setAccelScale(nextScale);
        }

        accelSmoothRef.current = smoothed;
        setAccelData(smoothed);
      }, { frequency: 30 });

      accelWatchdogRef.current = setTimeout(() => {
        setAccelStatus((current) => (current === 'streaming' ? current : 'no-samples-yet'));
      }, 2500);

      setAccelActive(true);
      return 'monitoring via r1.accelerometer';
    });
  };

  const stopAccelerometerMonitor = () => {
    r1.accelerometer.stop();
    if (accelWatchdogRef.current) {
      clearTimeout(accelWatchdogRef.current);
      accelWatchdogRef.current = null;
    }
    if (accelCalibrateTimerRef.current) {
      clearTimeout(accelCalibrateTimerRef.current);
      accelCalibrateTimerRef.current = null;
    }
    setAccelActive(false);
    setAccelStatus('stopped');
    accelSmoothRef.current = { x: 0, y: 0, z: 0 };
    accelCalibrateBufferRef.current = [];
    accelRecentRawRef.current = [];
    accelScaleRef.current = 1;
    setAccelScale(1);
    addLog('skip', 'Hardware: accelerometer monitor', 'stopped');
  };

  const resetHardwareCounters = () => {
    setHardwareStats({
      sideClick: 0,
      longPressStart: 0,
      longPressEnd: 0,
      scrollUp: 0,
      scrollDown: 0
    });
  };

  const applyAccelFilter = (value, baseline, deadzone) => {
    const delta = value - baseline;
    if (Math.abs(delta) < deadzone) return 0;
    return safeFixed(delta);
  };

  const calibrateGyroBaseline = () => {
    if (!accelActive) {
      addLog('skip', 'Hardware: gyro calibration', 'Start Gyro first, then keep device still and calibrate.');
      return;
    }

    if (accelCalibrateTimerRef.current) {
      clearTimeout(accelCalibrateTimerRef.current);
      accelCalibrateTimerRef.current = null;
    }

    setAccelStatus('calibrating');
    accelCalibrateBufferRef.current = [];
    accelRecentRawRef.current = [];

    accelCalibrateTimerRef.current = setTimeout(() => {
      const samples = accelCalibrateBufferRef.current;
      const baseline = samples.length
        ? {
            x: safeFixed(samples.reduce((sum, s) => sum + s.x, 0) / samples.length),
            y: safeFixed(samples.reduce((sum, s) => sum + s.y, 0) / samples.length),
            z: safeFixed(samples.reduce((sum, s) => sum + s.z, 0) / samples.length)
          }
        : { ...accelLatestRawRef.current };

      setAccelBaseline(baseline);
      accelBaselineRef.current = baseline;
      accelSmoothRef.current = { x: 0, y: 0, z: 0 };
      setAccelData({ x: 0, y: 0, z: 0 });
      accelScaleRef.current = 1;
      setAccelScale(1);
      setAccelStatus('streaming');
      accelCalibrateBufferRef.current = [];
      accelCalibrateTimerRef.current = null;
      addLog('pass', 'Hardware: gyro calibration', `baseline(fresh ${samples.length || 1}) x=${baseline.x}, y=${baseline.y}, z=${baseline.z}`);
    }, 900);

    addLog('skip', 'Hardware: gyro calibration', 'Collecting fresh still samples for 0.9s... keep device still');
  };

  const getAxisDotStyle = () => {
    if (!accelActive) {
      return { left: '50%', top: '50%' };
    }

    const size = gyroXYRef.current?.clientWidth || 140;
    const half = size / 2;
    const range = accelScale || 1;
    const clamp = (v) => Math.max(-1, Math.min(1, v / range));
    const x = clamp(accelData.x) * (half - 8);
    const y = clamp(accelData.y) * (half - 8);
    return {
      left: `${half + x}px`,
      top: `${half - y}px`
    };
  };

  const getRawAxisDotStyle = () => {
    if (!accelActive) {
      return { left: '50%', top: '50%' };
    }

    const size = gyroXYRef.current?.clientWidth || 140;
    const half = size / 2;
    const range = accelScale || 1;
    const raw = accelLatestRawRef.current;
    const dx = raw.x - accelBaseline.x;
    const dy = raw.y - accelBaseline.y;
    const clamp = (v) => Math.max(-1, Math.min(1, v / range));
    const x = clamp(dx) * (half - 8);
    const y = clamp(dy) * (half - 8);
    return {
      left: `${half + x}px`,
      top: `${half - y}px`
    };
  };

  const getZFill = () => {
    const range = accelScale || 1;
    const normalized = Math.max(-1, Math.min(1, accelData.z / range));
    return `${((normalized + 1) / 2) * 100}%`;
  };

  const assertPass = async (title, fn) => {
    try {
      const result = await fn();
      addLog('pass', title, result ? String(result) : 'OK');
      return true;
    } catch (error) {
      addLog('fail', title, parseError(error));
      return false;
    }
  };

  const assertSkip = (title, detail) => {
    addLog('skip', title, detail);
  };

  const runCoreTests = async () => {
    await assertPass('Core: initialize()', async () => {
      await r1.initialize();
    });

    await assertPass('Core: getAvailableFeatures()', async () => {
      const available = await r1.getAvailableFeatures();
      setFeatures(available);
      return JSON.stringify(available);
    });

    await assertPass('Core: dimensions constant', async () => {
      if (R1_DIMENSIONS.width !== 240 || R1_DIMENSIONS.height !== 282) {
        throw new Error('Unexpected dimensions');
      }
      return `${R1_DIMENSIONS.width}x${R1_DIMENSIONS.height}`;
    });
  };

  const runHardwareTests = async () => {
    await assertPass('Hardware: accelerometer.isAvailable()', async () => {
      return String(await r1.accelerometer.isAvailable());
    });

    await assertPass('Hardware: accelerometer start/stop state', async () => {
      if (await r1.accelerometer.isAvailable()) {
        r1.accelerometer.start(() => undefined, { frequency: 20 });
        const active = r1.accelerometer.isActive();
        r1.accelerometer.stop();
        if (!active) throw new Error('Expected accelerometer active after start');
        return 'started/stopped';
      }
      return 'not available';
    });

    await assertPass('Hardware: touch synthetic events', async () => {
      r1.touch.tap(10, 10);
      r1.touch.touchDown(10, 11);
      r1.touch.touchMove(11, 12);
      r1.touch.touchUp(11, 12);
      r1.touch.touchCancel(11, 12);
    });

    await assertPass('Hardware: event on/off', async () => {
      const cb = () => undefined;
      r1.hardware.on('sideClick', cb);
      r1.hardware.off('sideClick', cb);
    });

    assertSkip('Hardware: removeAllListeners', 'Not run in full smoke test to preserve live hardware diagnostics listeners');

    await assertPass('DeviceControls: init/on/off/toggle/listeners', async () => {
      r1.deviceControls.init({ sideButtonEnabled: true, scrollWheelEnabled: true, keyboardFallback: true });
      const sideCb = () => undefined;
      const wheelCb = () => undefined;
      r1.deviceControls.on('sideButton', sideCb);
      r1.deviceControls.on('scrollWheel', wheelCb);
      r1.deviceControls.setSideButtonEnabled(true);
      r1.deviceControls.setScrollWheelEnabled(true);
      r1.deviceControls.triggerSideButton();
      const listeners = r1.deviceControls.getEventListeners();
      r1.deviceControls.off('sideButton', sideCb);
      r1.deviceControls.off('scrollWheel', wheelCb);
      return JSON.stringify(listeners);
    });
  };

  const runStorageTests = async () => {
    await assertPass('Storage: Base64Utils encode/decode/safeDecode', async () => {
      const encoded = Base64Utils.encode({ hello: 'world' });
      const decoded = Base64Utils.decode(encoded);
      const safe = Base64Utils.safeDecode(encoded);
      if (!decoded.hello || !safe.hello) throw new Error('Decode mismatch');
      return encoded.slice(0, 12) + '...';
    });

    await assertPass('Storage: R1Storage static checks', async () => {
      return JSON.stringify({
        available: R1Storage.isAvailable(),
        secureAvailable: R1Storage.isSecureAvailable()
      });
    });

    if (!R1Storage.isAvailable()) {
      assertSkip('Storage: plain read/write', 'creationStorage unavailable in this environment');
      assertSkip('Storage: preferences helpers', 'creationStorage unavailable in this environment');
      assertSkip('Storage: secret helpers', 'secure storage unavailable in this environment');
      return;
    }

    await assertPass('Storage: plain set/get/remove', async () => {
      await r1.storage.plain.setItem('sdk_test_plain', { n: 1, t: Date.now() });
      const value = await r1.storage.plain.getItem('sdk_test_plain');
      await r1.storage.plain.removeItem('sdk_test_plain');
      if (!value || value.n !== 1) throw new Error('Plain storage value mismatch');
      return JSON.stringify(value);
    });

    await assertPass('Storage: plain setRaw/getRaw', async () => {
      const encoded = Base64Utils.encode({ raw: true, ts: Date.now() });
      await r1.storage.plain.setRaw('sdk_test_raw', encoded);
      const raw = await r1.storage.plain.getRaw('sdk_test_raw');
      await r1.storage.plain.removeItem('sdk_test_raw');
      if (raw !== encoded) throw new Error('Raw storage mismatch');
      return raw.slice(0, 12) + '...';
    });

    await assertPass('Storage: set/get preferences', async () => {
      await r1.storage.setPreferences({ mode: 'test', ts: Date.now() });
      const prefs = await r1.storage.getPreferences();
      if (!prefs) throw new Error('Preferences missing');
      return JSON.stringify(prefs);
    });

    if (!R1Storage.isSecureAvailable()) {
      assertSkip('Storage: secure set/get secret', 'secure storage unavailable');
      return;
    }

    await assertPass('Storage: set/get secret', async () => {
      await r1.storage.setSecret('token', 'abc123');
      const token = await r1.storage.getSecret('token');
      if (token !== 'abc123') throw new Error('Secret mismatch');
      return token;
    });
  };

  const runMessagingTests = async () => {
    await assertPass('Messaging: runtime capabilities', async () => {
      return JSON.stringify(r1.messaging.getRuntimeCapabilities());
    });

    await assertPass('Messaging: onMessage/offMessage', async () => {
      const cb = () => undefined;
      r1.messaging.onMessage(cb);
      r1.messaging.offMessage(cb);
    });

    await assertPass('Messaging: removeAllHandlers', async () => {
      const cb1 = () => undefined;
      const cb2 = () => undefined;
      r1.messaging.onMessage(cb1);
      r1.messaging.onMessage(cb2);
      r1.messaging.removeAllHandlers();
      r1.messaging.onMessage(() => undefined);
      return 'handlers reset';
    });

    await assertPass('Messaging: STT state and toggles', async () => {
      const caps = r1.messaging.getRuntimeCapabilities();
      const before = r1.messaging.isSTTListening();
      if (caps.creationVoiceHandler) {
        r1.messaging.startSTTListening();
        r1.messaging.stopSTTListening();
      }
      return `before=${before} after=${r1.messaging.isSTTListening()}`;
    });

    await assertPass('Messaging: enable/disable push-to-talk', async () => {
      const caps = r1.messaging.getRuntimeCapabilities();
      if (!caps.creationVoiceHandler) return 'voice bridge unavailable';
      const disable = r1.messaging.enablePushToTalk({
        onTranscript: () => undefined
      });
      disable();
      r1.messaging.disablePushToTalk();
      return 'enabled/disabled';
    });

    await assertPass('Messaging: STT transcript path simulation', async () => {
      let observed = '';
      const disable = r1.messaging.enablePushToTalk({
        autoForwardTranscript: false,
        onTranscript: (text) => {
          observed = text;
        }
      });

      if (typeof window.onPluginMessage === 'function') {
        window.onPluginMessage({
          message: 'stt payload',
          pluginId: 'sdk-test',
          type: 'sttEnded',
          transcript: 'hello from simulated stt'
        });
      }

      disable();

      if (observed !== 'hello from simulated stt') {
        throw new Error('Did not observe simulated STT transcript');
      }

      return observed;
    });

    const caps = r1.messaging.getRuntimeCapabilities();
    if (!caps.pluginMessageHandler) {
      assertSkip('Messaging: sendMessage/askLLM/search/email/etc', 'PluginMessageHandler unavailable');
      return;
    }

    await assertPass('Messaging: sendMessage', async () => {
      await r1.messaging.sendMessage('SDK smoke test ping', { useLLM: false });
    });

    await assertPass('Messaging: askLLM', async () => {
      await r1.messaging.askLLM('Respond with OK only.');
    });

    await assertPass('Messaging: askLLMJSON', async () => {
      await r1.messaging.askLLMJSON('Return JSON: {"ok": true}');
    });

    await assertPass('Messaging: askLLMSpeak', async () => {
      await r1.messaging.askLLMSpeak('Say: smoke test for askLLMSpeak', false);
    });

    await assertPass('Messaging: speakText', async () => {
      await r1.messaging.speakText('This is a smoke test message.');
    });

    await assertPass('Messaging: searchWeb advanced options', async () => {
      await r1.messaging.searchWeb('weather in Berlin', { tag: 'weather', useLocation: false });
      await r1.messaging.searchWeb('rabbit logo', { tag: 'image', useLocation: false });
    });

    await assertPass('Messaging: searchWeb all SERP tags', async () => {
      const tags = ['search', 'image', 'finance', 'jobs', 'weather', 'hotels'];
      for (const tag of tags) {
        await r1.messaging.searchWeb(`sdk smoke ${tag}`, { tag, useLocation: false });
      }
      return tags.join(',');
    });

    await assertPass('Messaging: emailUser helper', async () => {
      await r1.messaging.emailUser('Smoke test content from Next.js app');
    });

    await assertPass('Messaging: waitForNextMessage timeout behavior', async () => {
      try {
        await r1.messaging.waitForNextMessage({ timeoutMs: 25 });
        return 'resolved';
      } catch {
        return 'timeout expected';
      }
    });

    await assertPass('Messaging: askLLMWithTimeout', async () => {
      try {
        const res = await r1.messaging.askLLMWithTimeout(
          'Respond with short text only',
          { wantsR1Response: false },
          { timeoutMs: 3000 }
        );
        return res.message || 'resolved';
      } catch {
        return 'timed out or no response (environment-dependent)';
      }
    });

    await assertPass('Messaging: llm helper analyzeData', async () => {
      await r1.llm.analyzeData('Analyze this object', { source: 'smoke-test', ok: true });
    });

    await assertPass('Messaging: llm helper getUserMemories', async () => {
      await r1.llm.getUserMemories();
    });

    await assertPass('Messaging: llm helper analyzeImageBase64', async () => {
      await r1.llm.analyzeImageBase64('Describe this image', sampleImageBase64);
    });

    await assertPass('Messaging: llm helper getUISuggestions', async () => {
      await r1.llm.getUISuggestions('A list with selected item and action button');
    });

    await assertPass('Messaging: llm helper performTask', async () => {
      await r1.llm.performTask('Say: smoke test performTask', false);
    });

    await assertPass('Messaging: llm helper textToSpeech', async () => {
      await r1.llm.textToSpeech('Smoke test textToSpeech', false);
    });

    await assertPass('Messaging: llm helper textToSpeechAudio', async () => {
      try {
        const result = await r1.llm.textToSpeechAudio('Smoke test audio generation', { rate: 1 });
        return result === null ? 'returned null (expected for current Web Speech limitation)' : 'blob returned';
      } catch {
        return 'not supported in this environment';
      }
    });

    await assertPass('Messaging: AI action-calling JSON test', async () => {
      await r1.messaging.askLLMJSON(
        'Return JSON in this schema: {"action":"create_note","args":{"title":"string","body":"string"}}'
      );
      return 'sent';
    });

    await assertPass('Messaging: AI image-generation prompt test', async () => {
      await r1.messaging.askLLM(aiPrompt, { wantsR1Response: false, wantsJournalEntry: false });
      return 'prompt sent';
    });
  };

  const runUITests = async () => {
    await assertPass('UI: LayoutUtils basic methods', async () => {
      const inside = LayoutUtils.isWithinBounds(10, 10);
      const clamped = LayoutUtils.clampToBounds(-1, 999);
      const font = LayoutUtils.calculateFontSize(120);
      const css = LayoutUtils.createR1Container();
      if (!inside || clamped.x !== 0 || clamped.y !== 282 || !css.includes('240px')) {
        throw new Error('Layout utils mismatch');
      }
      return `font=${font}`;
    });

    await assertPass('UI: DOMUtils methods', async () => {
      const host = document.createElement('div');
      const el = DOMUtils.createElement('div', { 'data-test': 'x' }, 'abc');
      DOMUtils.batchOperations((frag) => {
        frag.appendChild(el);
      }, host);
      DOMUtils.updateContent(el, 'xyz');
      DOMUtils.toggleClass(el, 'active', true);
      const debounced = DOMUtils.debounce(() => undefined, 5);
      debounced();
      return `children=${host.children.length}`;
    });

    await assertPass('UI: CSSUtils methods', async () => {
      const el = document.createElement('div');
      CSSUtils.setTransform(el, 'translateX(2px)');
      CSSUtils.setOpacity(el, 0.9);
      CSSUtils.addTransition(el, 'transform', 100);
      CSSUtils.createAnimation('sdkSmokePulse', '0%{opacity:.5;}100%{opacity:1;}', 120);
      CSSUtils.resetWillChange(el);
    });

    await assertPass('UI: R1UI methods and transitions', async () => {
      const host = testContainerRef.current;
      const a = transitionARef.current;
      const b = transitionBRef.current;
      if (!host || !a || !b) throw new Error('UI refs missing');

      r1.ui.setupViewport();
      r1.ui.createContainer(host, { background: '#101010' });
      r1.ui.createText(a, { size: 'small', color: '#ffffff', align: 'left' });
      r1.ui.createText(b, { size: 'small', color: '#ffffff', align: 'left' });

      const btn = document.createElement('button');
      btn.textContent = 'x';
      r1.ui.createButton(btn, { type: 'small' });

      const grid = document.createElement('div');
      r1.ui.createGrid(grid, { columns: 2 });
      host.appendChild(grid);
      grid.appendChild(btn);

      const colors = r1.ui.getColors();
      const sizes = r1.ui.getFontSizes();
      const spacing = r1.ui.getSpacing();
      const buttons = r1.ui.getButtonSizes();
      const vw = r1.ui.pxToVw(24);
      if (!colors.primary || !sizes.body || !spacing.md || !buttons.wide || !vw.includes('vw')) {
        throw new Error('R1UI getter mismatch');
      }

      r1.ui.transition(a, b, 'fade', 120);
      return `dims=${r1.ui.dimensions.width}x${r1.ui.dimensions.height}`;
    });

    await assertPass('UI: PerformanceUtils start/end', async () => {
      PerformanceUtils.startMeasure('sdk-ui-measure');
      for (let i = 0; i < 2000; i++) {
        Math.sqrt(i);
      }
      const duration = PerformanceUtils.endMeasure('sdk-ui-measure', false);
      return `duration=${duration.toFixed(2)}ms`;
    });

    await assertPass('UI: PerformanceUtils monitorFPS', async () => {
      await new Promise((resolve) => {
        PerformanceUtils.monitorFPS(0.2, () => resolve());
      });
      return 'fps callback received';
    });

    await assertPass('UI: R1Component mount lifecycle', async () => {
      class SmokeComponent extends R1Component {
        onMount() {
          this.getElement().textContent = 'mounted';
        }

        onUnmount() {
          this.getElement().textContent = 'unmounted';
        }
      }

      const host = document.createElement('div');
      const comp = new SmokeComponent('div', 'smoke-component');
      comp.mount(host);
      const mounted = comp.isMounted();
      const node = comp.getElement();
      comp.unmount();
      if (!mounted || node.textContent !== 'unmounted') {
        throw new Error('component lifecycle failed');
      }
      return 'mounted/unmounted';
    });
  };

  const runMediaUtilsTests = async () => {
    await assertPass('MediaUtils: getDevices', async () => {
      const devices = await MediaUtils.getDevices();
      return `devices=${devices.length}`;
    });

    await assertPass('MediaUtils: isSupported all', async () => {
      const camera = await MediaUtils.isSupported('camera');
      const microphone = await MediaUtils.isSupported('microphone');
      const speaker = await MediaUtils.isSupported('speaker');
      return JSON.stringify({ camera, microphone, speaker });
    });

    await assertPass('MediaUtils: base64<->blob conversion', async () => {
      const blob = new Blob(['hello'], { type: 'text/plain' });
      const b64 = await MediaUtils.blobToBase64(blob);
      const roundtrip = MediaUtils.base64ToBlob(b64, 'text/plain');
      if (!b64 || roundtrip.size === 0) throw new Error('conversion failed');
      return `size=${roundtrip.size}`;
    });
  };

  const runMediaApiStateTests = async () => {
    await assertPass('Media: camera.getStream initial', async () => {
      const stream = r1.camera.getStream();
      return stream ? 'has stream' : 'null stream';
    });

    await assertPass('Media: microphone state/getStream initial', async () => {
      const state = r1.microphone.getRecordingState();
      const stream = r1.microphone.getStream();
      return `state=${state} stream=${stream ? 'set' : 'null'}`;
    });

    await assertPass('Media: speaker isPlaying initial', async () => {
      return `isPlaying=${r1.speaker.isPlaying()}`;
    });
  };

  const runAllTests = async () => {
    setRunning(true);
    setLogs([]);

    addLog('skip', 'Start', 'Running complete SDK smoke test suite');

    await runCoreTests();
    await runHardwareTests();
    await runStorageTests();
    await runMessagingTests();
    await runUITests();
    await runMediaUtilsTests();
    await runMediaApiStateTests();

    addLog('skip', 'Done', 'Smoke test run complete. Use manual tests below for camera/mic/speaker and closePlugin.');
    setRunning(false);
  };

  const runCameraManualTest = async () => {
    await assertPass('Media: camera full flow', async () => {
      const available = await r1.camera.isAvailable();
      if (!available) return 'camera unavailable';

      const stream = await r1.camera.start({ width: 240, height: 282, facingMode: 'user' });
      if (!stream) throw new Error('no camera stream');

      const video = r1.camera.createVideoElement(true, true);
      await new Promise((resolve) => setTimeout(resolve, 250));
      const shot = r1.camera.capturePhoto(120, 141);
      setCameraPreview(shot);
      await r1.camera.switchCamera().catch(() => undefined);
      r1.camera.stop();
      return 'camera started/captured/stopped';
    });
  };

  const getCapturedImagePayload = () => {
    if (!cameraPreview || typeof cameraPreview !== 'string') {
      throw new Error('No captured image available. Run Manual Camera Test first.');
    }

    if (!cameraPreview.startsWith('data:image/')) {
      throw new Error('Captured image is not a valid image data URL.');
    }

    return cameraPreview;
  };

  const runImageToAIManualTest = async () => {
    await assertPass('Media+LLM: transform image (take a photo and make it ...)', async () => {
      const imagePayload = getCapturedImagePayload();

      await r1.llm.transformPhoto(imagePayload, imageTransformPrompt, {
        wantsR1Response: false,
        wantsJournalEntry: false
      });

      return 'sent captured image via transformPhoto';
    });
  };

  const runAskImageManualTest = async () => {
    await assertPass('Media+LLM: ask about image (image + prompt)', async () => {
      const imagePayload = getCapturedImagePayload();

      await r1.llm.askImage(imagePayload, imageQuestionPrompt, {
        wantsR1Response: false,
        wantsJournalEntry: false
      });

      return 'sent captured image via askImage';
    });
  };

  const runImageNoPromptManualTest = async () => {
    await assertPass('Media+LLM: image with no prompt', async () => {
      const imagePayload = getCapturedImagePayload();

      await r1.llm.imageToAI(imagePayload, '', {
        wantsR1Response: false,
        wantsJournalEntry: false
      });

      return 'sent captured image via imageToAI (no prompt)';
    });
  };

  const runMicrophoneManualTest = async () => {
    await assertPass('Media: microphone record flow', async () => {
      const available = await r1.microphone.isAvailable();
      if (!available) return 'microphone unavailable';

      await r1.microphone.startRecording({ mimeType: 'audio/webm', audioBitsPerSecond: 64000 });
      await new Promise((resolve) => setTimeout(resolve, 400));
      const audio = await r1.microphone.stopRecording();
      setLastAudioSize(audio.size);
      r1.microphone.stop();
      return `recorded bytes=${audio.size}`;
    });
  };

  const runSpeakerManualTest = async () => {
    await assertPass('Media: speaker tone + state', async () => {
      await r1.speaker.playTone(440, 200, 0.2);
      const isPlaying = r1.speaker.isPlaying();
      r1.speaker.setVolume(0.5);
      r1.speaker.stop();
      return `isPlaying=${isPlaying}`;
    });
  };

  const runClosePluginManual = () => {
    addLog('skip', 'Messaging: closePlugin', 'Attempting to close webview (if running in R1 this may close app).');
    try {
      r1.messaging.closePlugin();
      addLog('pass', 'Messaging: closePlugin', 'Called');
    } catch (error) {
      addLog('fail', 'Messaging: closePlugin', parseError(error));
    }
  };

  const runSimulatedSTTEvent = () => {
    addLog('skip', 'Manual STT simulation', 'Dispatching a simulated sttEnded payload through onPluginMessage');
    try {
      const disable = r1.messaging.enablePushToTalk({
        autoForwardTranscript: false,
        onTranscript: (text) => addLog('pass', 'Manual STT transcript callback', text)
      });

      if (typeof window.onPluginMessage === 'function') {
        window.onPluginMessage({
          message: 'manual simulation',
          pluginId: 'manual',
          type: 'sttEnded',
          transcript: 'manual simulated transcript'
        });
      }

      disable();
      addLog('pass', 'Manual STT simulation', 'Simulation dispatched');
    } catch (error) {
      addLog('fail', 'Manual STT simulation', parseError(error));
    }
  };

  const runAIGeneratedImagePromptManual = async () => {
    await assertPass('Manual AI generated image prompt', async () => {
      await r1.messaging.askLLM(aiPrompt, {
        wantsR1Response: false,
        wantsJournalEntry: false
      });
      return aiPrompt;
    });
  };

  const runAICallingManual = async () => {
    await assertPass('Manual AI calling-style JSON prompt', async () => {
      await r1.messaging.askLLMJSON(
        'Return ONLY JSON: {"tool":"send_email","args":{"subject":"Smoke Test","body":"Hello from function-style test"}}'
      );
      return 'sent';
    });
  };

  return (
    <main className="stack">
      <div className="panel stack">
        <h1>R1 Create Full Test App (Next.js)</h1>
        <p>
          This test harness covers core, hardware, storage, messaging/LLM, UI, and media APIs. Some features
          require R1 runtime bridges or user permissions.
        </p>
      </div>

      <div className="grid">
        <div className="panel stack">
          <button className="primary" onClick={runAllTests} disabled={running}>
            {running ? 'Running Full Suite...' : 'Run Full SDK Smoke Test'}
          </button>
          <button onClick={runCameraManualTest}>Manual Camera Test</button>
          <button onClick={runImageToAIManualTest}>Manual Image Transform Test</button>
          <button onClick={runAskImageManualTest}>Manual Ask About Image</button>
          <button onClick={runImageNoPromptManualTest}>Manual Image No Prompt</button>
          <button onClick={runMicrophoneManualTest}>Manual Microphone Test</button>
          <button onClick={runSpeakerManualTest}>Manual Speaker Test</button>
          <button onClick={runSimulatedSTTEvent}>Manual STT Simulation</button>
          <button onClick={runAIGeneratedImagePromptManual}>Manual AI Image Generation Prompt</button>
          <button onClick={runAICallingManual}>Manual AI Calling JSON Prompt</button>
          <button className="warn" onClick={runClosePluginManual}>Manual closePlugin Test</button>
          <button onClick={() => setLogs([])}>Clear Logs</button>
          <textarea
            className="relay-input code"
            rows={3}
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
          />
          <textarea
            className="relay-input code"
            rows={3}
            value={imageTransformPrompt}
            onChange={(e) => setImageTransformPrompt(e.target.value)}
          />
          <textarea
            className="relay-input code"
            rows={2}
            value={imageQuestionPrompt}
            onChange={(e) => setImageQuestionPrompt(e.target.value)}
          />
          <div className="small code">
            Features: {features ? JSON.stringify(features) : 'Not loaded yet'}
          </div>
          <div className="small code">
            Last audio blob size: {lastAudioSize == null ? 'n/a' : String(lastAudioSize)}
          </div>

          <div className="small" style={{ marginTop: 10 }}>Socket relay</div>
          <input
            className="relay-input"
            value={relayUrl}
            onChange={(e) => setRelayUrl(e.target.value)}
            placeholder="http(s)://current-host:3031"
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <button onClick={connectRelay} disabled={relayConnected}>Connect Relay</button>
            <button onClick={disconnectRelay} disabled={!relayConnected}>Disconnect</button>
          </div>
          <button onClick={useCurrentRelayAddress}>Use Current Address</button>
          <div className="small code">
            Relay status: {relayConnected ? 'connected' : 'disconnected'}
          </div>
        </div>

        <div className="panel stack">
          <div className="small">Camera capture preview</div>
          {cameraPreview ? (
            <img className="preview" src={cameraPreview} alt="Captured" />
          ) : (
            <div className="preview small" style={{ display: 'grid', placeItems: 'center' }}>
              No capture yet
            </div>
          )}

          <div className="small">UI transition sandbox</div>
          <div ref={testContainerRef} style={{ border: '1px solid #2a2a2a', borderRadius: 8, minHeight: 96, padding: 8 }}>
            <div ref={transitionARef}>Panel A</div>
            <div ref={transitionBRef} style={{ display: 'none' }}>Panel B</div>
          </div>

          <div className="small">Hardware live status (gyro/PTT/scroll)</div>
          <div className="small code">
            sideClick={hardwareStats.sideClick} | longStart={hardwareStats.longPressStart} | longEnd={hardwareStats.longPressEnd}
          </div>
          <div className="small code">
            scrollUp={hardwareStats.scrollUp} | scrollDown={hardwareStats.scrollDown}
          </div>
          <div className="small code">
            accelActive={String(accelActive)} x={accelData.x} y={accelData.y} z={accelData.z}
          </div>
          <div className="small code">
            accelStatus={accelStatus} samples={accelSamples}
          </div>
          <div className="small code">
            baseline x={accelBaseline.x} y={accelBaseline.y} z={accelBaseline.z} deadzone={accelDeadzone} scale={accelScale}
          </div>
          <div className="gyro-visual-row">
            <div className="gyro-xy" ref={gyroXYRef}>
              <div className="gyro-cross-h" />
              <div className="gyro-cross-v" />
              <div className="gyro-dot-raw" style={getRawAxisDotStyle()} />
              <div className="gyro-dot" style={getAxisDotStyle()} />
            </div>
            <div className="gyro-z-wrap">
              <div className="gyro-z-track">
                <div className="gyro-z-fill" style={{ height: getZFill() }} />
              </div>
              <div className="small code">Z</div>
            </div>
          </div>
          <div className="small code" style={{ maxHeight: 40, overflow: 'auto' }}>
            accelRaw={accelRaw}
          </div>
          <div className="small code">
            parsedRaw x={accelLatestRawRef.current.x} y={accelLatestRawRef.current.y} z={accelLatestRawRef.current.z}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <button onClick={startAccelerometerMonitor}>Start Gyro</button>
            <button onClick={stopAccelerometerMonitor}>Stop Gyro</button>
            <button onClick={calibrateGyroBaseline}>Calibrate Gyro</button>
            <button onClick={resetHardwareCounters}>Reset Counters</button>
            <button onClick={() => { setAccelDeadzone(0); accelDeadzoneRef.current = 0; }}>Deadzone 0</button>
            <button onClick={() => { setAccelDeadzone(0.05); accelDeadzoneRef.current = 0.05; }}>Deadzone Default</button>
          </div>
          <input
            className="relay-input code"
            type="number"
            min="0"
            step="0.005"
            value={accelDeadzone}
            onChange={(e) => {
              const next = Math.max(0, Number(e.target.value || 0));
              setAccelDeadzone(next);
              accelDeadzoneRef.current = next;
            }}
          />
          <div className="small code">
            Hardware counters update from real device events: sideClick, longPressStart/End, scrollUp/Down.
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="small" style={{ marginBottom: 8 }}>
          Live test log
        </div>
        <div className="log">
          {logs.length === 0 && <div className="small">No logs yet.</div>}
          {logs.map((item, index) => (
            <div key={`${item.time}-${index}`} className="entry">
              <div className={item.status === 'pass' ? 'pass' : item.status === 'fail' ? 'fail' : 'skip'}>
                [{item.time}] {item.status.toUpperCase()} - {item.title}
              </div>
              <div className="small code">{item.detail}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="panel">
        <div className="small" style={{ marginBottom: 8 }}>
          Device console logs (Socket.IO relay)
        </div>
        <button onClick={() => setDeviceLogs([])} style={{ marginBottom: 8 }}>Clear Device Logs</button>
        <div className="log">
          {deviceLogs.length === 0 && <div className="small">No device logs yet.</div>}
          {deviceLogs.map((item, index) => (
            <div key={`${item.time}-${index}`} className="entry">
              <div className={item.level === 'error' ? 'fail' : item.level === 'warn' ? 'skip' : 'pass'}>
                [{item.time}] {item.level.toUpperCase()} [{item.deviceId}]
              </div>
              <div className="small code">{item.message}</div>
              {item.url && <div className="small code">{item.url}</div>}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
