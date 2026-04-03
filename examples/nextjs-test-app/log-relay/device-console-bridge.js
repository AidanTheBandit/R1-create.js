/*
  Device Console Bridge (Socket.IO)
  Usage on device creation page:

  <script src="https://cdn.socket.io/4.8.1/socket.io.min.js"></script>
  <script src="device-console-bridge.js"></script>

  Set relay URL before loading this file if needed:
  window.__R1_RELAY_URL__ = 'http://YOUR_HOST:3031';
*/
(function () {
  if (typeof window === 'undefined') return;
  if (typeof io === 'undefined') {
    console.warn('[relay] socket.io client not found (missing CDN script).');
    return;
  }

  const relayUrl = window.__R1_RELAY_URL__ || 'http://localhost:3031';
  const deviceId = window.__R1_DEVICE_ID__ || 'r1-device';
  const socket = io(relayUrl, {
    transports: ['websocket', 'polling']
  });

  function stringify(value) {
    if (typeof value === 'string') return value;
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }

  function emit(level, args, extras) {
    try {
      socket.emit('console_log', {
        level,
        args: Array.prototype.map.call(args, stringify),
        url: location.href,
        stack: extras && extras.stack ? String(extras.stack) : null
      });
    } catch {
      // no-op
    }
  }

  socket.on('connect', function () {
    socket.emit('register', { role: 'device', deviceId: deviceId });
    emit('info', ['[relay] connected', relayUrl], null);
  });

  socket.on('connect_error', function (err) {
    // keep local so dev sees failure even without relay
    console.warn('[relay] connect_error', err && err.message ? err.message : err);
  });

  var original = {
    log: console.log.bind(console),
    info: console.info.bind(console),
    warn: console.warn.bind(console),
    error: console.error.bind(console)
  };

  console.log = function () {
    original.log.apply(console, arguments);
    emit('log', arguments, null);
  };

  console.info = function () {
    original.info.apply(console, arguments);
    emit('info', arguments, null);
  };

  console.warn = function () {
    original.warn.apply(console, arguments);
    emit('warn', arguments, null);
  };

  console.error = function () {
    original.error.apply(console, arguments);
    emit('error', arguments, null);
  };

  window.addEventListener('error', function (event) {
    emit('error', [event.message || 'window.error'], { stack: event.error && event.error.stack });
  });

  window.addEventListener('unhandledrejection', function (event) {
    var reason = event.reason && event.reason.message ? event.reason.message : stringify(event.reason);
    emit('error', ['unhandledrejection', reason], { stack: event.reason && event.reason.stack });
  });
})();
