const express = require("express");

const router = express.Router({ mergeParams: true });

const {
  createAssignment,
  getAssignment,
  getAssignments,
  getStudentAssignments,
  updateA,
  updateQ,
  getAssignmentSubmissions,
  deleteAssignment,
} = require("../controllers/assignment");

const { protect, authorize } = require("../middleware/authT");
const { protect1, authorize1 } = require("../middleware/authS");

// Routes that can be accessed by both teachers and students
// We'll use a simple approach - let the controller handle the logic
router.route("/").get(getAssignments).post(protect, createAssignment);

// Student assignments with submission status
router.route("/student/dashboard").get(protect1, getStudentAssignments);

router.route("/:id/submissions").get(getAssignmentSubmissions);

router.route("/:id").get(getAssignment).delete(protect, deleteAssignment);

router.route("/updateQ/:id").put(protect, updateQ);

router.route("/updateA/:id").put(protect1, updateA);

module.exports = router;
