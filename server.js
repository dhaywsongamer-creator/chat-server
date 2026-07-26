const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: process.env.PORT || 8080 });

const rooms = {};

wss.on('connection', (ws) => {
  let roomCode = null;

  ws.on('message', (message) => {
    const data = JSON.parse(message);
    if (data.type === 'join') {
      roomCode = data.code;
      if (!rooms[roomCode]) rooms[roomCode] = [];
      rooms[roomCode].push(ws);
      console.log(`Usuario unido a sala ${roomCode}`);
    } else if (data.type === 'msg' && roomCode) {
      rooms[roomCode].forEach(client => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(data.text);
        }
      });
    }
  });

  ws.on('close', () => {
    if (roomCode && rooms[roomCode]) {
      rooms[roomCode] = rooms[roomCode].filter(c => c !== ws);
    }
  });
});
