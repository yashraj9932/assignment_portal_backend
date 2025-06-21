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

// Temporarily remove authentication for testing
router.route("/").get(protect1, getAssignments).post(protect, createAssignment);

// Student assignments with submission status
router.route("/student/dashboard").get(protect1, getStudentAssignments);

router.route("/:id/submissions").get(getAssignmentSubmissions);

router.route("/:id").get(getAssignment).delete(protect, deleteAssignment);

router.route("/updateQ/:id").put(protect, updateQ);
// .put(protect, authorize("teacher", "admin"), updateQ);

router.route("/updateA/:id").put(protect1, updateA);

module.exports = router;
