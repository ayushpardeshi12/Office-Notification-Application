const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
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

const authenticate = (req, res, next) => {
  const token = req.header("Authorization").replace("Bearer ", "");
  try {
    const decoded = jwt.verify(token, "secret_key");
    req.user = decoded;
    if (req.user.role !== "admin") throw new Error("Not authorized");
    next();
  } catch (error) {
    res.status(401).send({ message: "Please Authenticate" });
  }
};

// Protected Routes Api

app.get("/api/admin/users", authenticate, async (req, res) => {
  const users = await User.find();
  res.send(users);
});

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
    return res.status(201).send(notification);
  } catch (error) {
    console.error("Error creating notification:", error); // Log error details
    return res.status(400).send(error);
  }
});

// Below is the Route to get all Notifications fro database

app.get("/api/notifications", async (req, res) => {
  try {
    const notifications = await Notification.find().populate("staff");
    return res.status(200).send(notifications);
  } catch (error) {
    return res.status(500).send(error);
  }
});

// Register a new user ( for admin use )

app.post("/api/register", async (req, res) => {
  try {
    const { name, role, cabin, password } = req.body;
    const user = new User({ name, role, cabin, password });
    await user.save();
    return res.status(201).send(user);
  } catch (error) {
    return res.status(400).send(error);
  }
});

// Login route

app.post("/api/login", async (req, res) => {
  try {
    const { name, password } = req.body;
    console.log("Request Body", req.body);
    const user = await User.findOne({ name });
    console.log("Found User:", user);
    if (!user) return res.status(404).send({ message: "User not found" });
    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(400).send({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: user.role }, "secret_key", {
      expiresIn: "1h",
    });
    res.send({ token });
  } catch (error) {
    res.status(400).send(error);
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
