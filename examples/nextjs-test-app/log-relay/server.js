const http = require('http');
const { Server } = require('socket.io');

const PORT = process.env.RELAY_PORT ? Number(process.env.RELAY_PORT) : 3031;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('R1 log relay is running\n');
});

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log(`[relay] client connected ${socket.id}`);

  socket.on('register', (payload) => {
    const role = payload?.role || 'unknown';
    const deviceId = payload?.deviceId || 'unknown';
    socket.data.role = role;
    socket.data.deviceId = deviceId;
    console.log(`[relay] register role=${role} device=${deviceId} id=${socket.id}`);
    socket.emit('relay_info', { ok: true, id: socket.id, role, deviceId });
  });

  socket.on('console_log', (payload) => {
    const event = {
      time: new Date().toISOString(),
      socketId: socket.id,
      role: socket.data.role || 'unknown',
      deviceId: socket.data.deviceId || 'unknown',
      level: payload?.level || 'log',
      args: Array.isArray(payload?.args) ? payload.args : [String(payload?.args ?? '')],
      url: payload?.url || null,
      stack: payload?.stack || null
    };

    const line = `[relay][${event.level}] (${event.role}:${event.deviceId}) ${event.args.join(' ')}`;
    console.log(line);

    io.emit('relay_log', event);
  });

  socket.on('disconnect', (reason) => {
    console.log(`[relay] client disconnected ${socket.id} reason=${reason}`);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[relay] listening on 0.0.0.0:${PORT}`);
});
