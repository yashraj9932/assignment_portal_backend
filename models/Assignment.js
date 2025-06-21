const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const AssignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please add a title"],
  },
  description: {
    type: String,
    required: [true, "Please add the assignment description"],
  },
  dueDate: {
    type: Date,
  },
  subject: {
    type: String,
  },
  questions: [{
    text: {
      type: String,
      required: true
    },
    type: {
      type: String,
      default: 'text'
    },
    points: {
      type: Number,
      default: 10
    }
  }],
  answers: [{
    type: String,
  }],
  status: {
    type: String,
    enum: ['draft', 'active', 'pending', 'completed', 'overdue'],
    default: 'draft',
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
      submittedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

module.exports = mongoose.model("Assignment", AssignmentSchema);
