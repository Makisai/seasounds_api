const express = require("express");
var cors = require("cors");
const app = express();
app.use(express.json());
const port = 4000;
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000"
  }
});;


var corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
app.use(cors(corsOptions))

let queue = [];
let current_socket = null;
let sockets = {};

const digest = () => {
  item = queue.shift();
  setTimeout(digest, 15000);
  if (item) {
    console.log(`digest: ${item.soundName} from ${item.id}`);
  }
};
digest();

io.on('connection', (socket) => {
  console.log('a user connected');
  
  current_socket = socket;

  socket.on("new_user", (id) => {
    sockets[id] = current_socket
  })

  socket.on("add_to_queue", (id, soundName) => {
    queue.push({ id: id, soundName: soundName });
    console.log(id,soundName);
    sockets[id].emit("position", queue.length);
  })
});

/*app.get("/api/queue/check", (req, res) => {
  if (req.query && req.query.id) {
    position = queue.findIndex((item) => item.id == req.query.id);
    if (position < 0) {
      res.status(404).json({
        success: true,
        status: 404,
        position: -1,
        message: "user has no item in queue",
      });
    } else {
      res.json({
        success: true,
        status: 200,
        position: position + 1
      });
    }
  } else {
    res.status(400).json({
      success: false,
      status: 400,
      message: "id is missing",
    });
  }
});

app.post("/api/add-to-queue", (req, res) => {
  if (req.body && req.body.id && req.body.soundName) {
    position = queue.findIndex((item) => item.id == req.body.id);
    if (position < 0) {
      queue.push({ id: req.body.id, soundName: req.body.soundName });
      res.status(201).json({
        success: true,
        status: 201,
        position: queue.length,
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
server.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
