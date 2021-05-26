const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const AssignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please add a title"],
  },
  details: {
    type: String,
    required: [true, "Please add the assignment details"],
  },
  answerpdf: {
    type: [String],
    default: "nop.pdf",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  student: {
    type: [mongoose.Schema.ObjectId],
    ref: "Student",
    required: true,
  },
});

module.exports = mongoose.model("Assignment", AssignmentSchema);
