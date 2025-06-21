const express = require("express");

const router = express.Router();

const {
  getStudents,
  addStudent,
  getStudent,
  updateStudent,
  deleteStudent,
  studentLogin,
  getStudentProfile,
  updateStudentProfile,
  getStudentDashboard,
} = require("../controllers/student");

const { protect1 } = require("../middleware/authS");

router.route("/").get(getStudents).post(addStudent);

router.route("/login").post(studentLogin);

// Add routes for profile and dashboard (must come before /:id route)
router.route("/profile").get(protect1, getStudentProfile).put(protect1, updateStudentProfile);
router.route("/dashboard").get(protect1, getStudentDashboard);

router.route("/:id").get(getStudent).put(updateStudent).delete(deleteStudent);

module.exports = router;
