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

  createdAt: {
    type: Date,
    default: Date.now,
  },
  teacher: {
    type: mongoose.Schema.ObjectId,
    ref: "Teacher",
    required: true,
  },
  assignmentSubmitted: [
    {
      student: {
        type: mongoose.Schema.ObjectId,
        ref: "Student",
        required: true,
      },
      answerpdf: {
        type: String,
      },
    },
  ],
});

module.exports = mongoose.model("Assignment", AssignmentSchema);
