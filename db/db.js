const mongoose = require("mongoose");

const dbConnect = mongoose
  .connect("mongodb://localhost:27017/officeAssist", {})
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.log(`Error connecting to MongoDB:${error}`);
  });

module.exports = dbConnect;
