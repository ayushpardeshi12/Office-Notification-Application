const express = require("express");
const cors = require("cors");
const User = require("./models/User");
const Notification = require("./models/Notification");
const dotenv = require("dotenv");

dotenv.config({});
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const dbConnect = require("./db/db");

const PORT = process.env.PORT;

// database connection
dbConnect;

// middlewares

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// views

app.set("views", "./views");
app.set("view engine", "ejs");

//routes

app.get("/", (req, res) => {
  return res.send("Server Working");
});

// Below is the route to create user

app.post("/api/users", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    return res.status(201).send(user);
  } catch (error) {
    return res.status(400).send(error);
  }
});

// Below Route is to create Notification

app.post("/api/notifications", async (req, res) => {
  try {
    const notification = new Notification(req.body);
    await notification.save();
    io.emit("new-notification", notification);
    res.status(201).send(notification);
  } catch (error) {
    console.error("Error creating notification:", error); // Log error details
    res.status(400).send(error);
  }
});

// Below is the Route to get all Notifications fro database

app.get("/api/notifications", async (req, res) => {
  try {
    const notifications = await Notification.find().populate("staff");
    res.status(200).send(notifications);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Socket.io for real-time notifications

io.on("connection", (socket) => {
  console.log("A User connected");
  socket.on("disconnect", () => {
    console.log("A User disconnected");
  });
});

http.listen(PORT, () => {
  console.log(`Server Running on http://localhost:${PORT}`);
});
