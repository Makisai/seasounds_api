const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const port = 6000
const { Server } = require("socket.io");
const io = new Server(server);

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('play_sound',(soundName) => {
    console.log(soundName)
  })
})

server.listen(port, () => {
  console.log(`Mockserver listening on port ${port}`);
});