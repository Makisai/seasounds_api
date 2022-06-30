const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const port = 6000
const { Server } = require("socket.io");
const io = new Server(server);
const {WebSocketServer} = require("ws");

/*io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('play_sound',(soundName) => {
    console.log(soundName)
  })
})

server.listen(port, () => {
  console.log(`Mockserver listening on port ${port}`);
});*/

const wss = new WebSocketServer({ port: 6000});

wss.on('connection', (ws) => {
  ws.on('message', (soundName) =>{
    console.log(soundName)
  })
  ws.on('open',() =>{
    console.log("user is connected to WS");
  })
})
