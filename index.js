const http = require("http");
const { Server } = require("socket.io");

const express = require("express");
const app = express();
var cors = require("cors");
var morgan = require("morgan");
const connectDB = require("./api/db/conn");
const cookieParser = require("cookie-parser");
const routes = require("./api/routes/index");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan("dev"));
app.use(cors());
app.use(cookieParser());
require("dotenv").config();
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.send("Hello");
});

app.use("/api/v1", routes);
const start = async () => {
  await connectDB("mongodb://localhost:27017/chat");
  app.listen(8000, (req, res) => {
    console.log("Listening to port 8000");
  });
  //   global.io = socketio.listen(server);
  //   global.io.on("connection", WebSocket.connection);

  //   const server = http.createServer(app);
  //   const io = new Server(server);

  //   io.on("connection", WebSocket.connection);

  //   server.listen(8000, () => {
  //     console.log("Listening to port 8000");
  //   });
};
start();
