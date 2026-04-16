const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

console.log("WebSocket server is running on ws://localhost:8080");

// Store connected clients
const clients = new Set();

wss.on('connection', (ws) => {
  console.log("New client connected");
  clients.add(ws);

  ws.on('message', (message) => {
    const msgString = message.toString();
    console.log("Received message:", msgString);
    
    // Broadcast message to all OTHER clients
    for (let client of clients) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(msgString);
      }
    }
  });

  ws.on('close', () => {
    console.log("Client disconnected");
    clients.delete(ws);
  });
});
