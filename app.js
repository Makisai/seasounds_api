const express = require("express");
const cors = require("cors");
const InMemorySessionStore = require("./session_store.js");
const http = require('http');
const { Server } = require("socket.io");
const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());

/*
     FRONTEND
*/

let sessionStore = new InMemorySessionStore();
const server = http.createServer(app);
const frontendIO = new Server(server, {
  cors: {
    origin: "http://localhost:3000"
  }
});

var corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200
}
app.use(cors(corsOptions))

frontendIO.use((socket, next) => {
  const sessionID = socket.handshake.auth.sessionID;
  if(sessionID) {
    //find existing session
    const session = sessionStore.findSession(sessionID);
    console.log("Session found:", session)
    if(session) {
      socket.sessionID = sessionID;
      socket.userID = session.userID;
      console.log(session.userID)
      return next();
    }
  }
  //create new session
  socket.sessionID = uuidv4();
  socket.userID = uuidv4();
  console.log(socket.userID);
  next();
});

//send session details to user
frontendIO.on('connection', (socket) => {
  console.log('a user connected');
  sessionStore.saveSession(socket.sessionID, {
    userID: socket.userID,
    connected: true,
  });

  socket.emit("session", {
    sessionID: socket.sessionID,
    userID: socket.userID,
  });

  socket.on("add_to_queue", (id, soundName) => {
    position = queue.findIndex((item) => item.id == id);
    if (position < 0){
    queue.push({ id: id, soundName: soundName });
    console.log(id,soundName);
    socket.emit("position", queue.length);
    }
  })
});

/*
     TOUCH DESIGNER
*/

const touchDesignerServer = new WebSocket.Server({port:5050});

let socket = null;

touchDesignerServer.on('connection', (ws) => {
  var initMessage = {message:"connection"};
  ws.send(JSON.stringify(initMessage));
  console.log('new client');
  socket = ws;
})

/*
     DIGEST
*/

let queue = [
];

const digest = () => {
  item = queue.shift();
  setTimeout(() => digest(), 13000);
  if (item && socket && frontendIO) {
    console.log(`digest: ${item.soundName} from ${item.id}`);
    socket.send(item.soundName);
    frontendIO.emit("positionUpdate");
  }
};
digest();


/*
app.delete("/api/queue/clear", (req, res) => {
  queue = [];
  res.status(204).send();
});

app.post("/api/queue/add-priority", (req, res) => {
  if (req.body && req.body.id && req.body.soundName) {
    position = queue.findIndex((item) => item.id == req.body.id);
    if (position < 0) {
      queue.unshift({ id: req.body.id, soundName: req.body.soundName });
      res.status(201).json({
        success: true,
        status: 201,
        position: 1,
        message: "item enqueued",
      });
    } else {
      res.json({
        success: false,
        status: 200,
        position: position,
        message: "user already has something in da queue",
      });
    }
  } else {
    res.status(400).json({
      success: false,
      status: 400,
      message: "id or soundName is missing",
    });
  }
});
*/

const port = 4000;

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
