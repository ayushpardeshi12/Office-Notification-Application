const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    cabin: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ["pending", "resolved"], default: "pending" },
    staff: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Reference to the helping staff who attended the notification
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", NotificationSchema);
