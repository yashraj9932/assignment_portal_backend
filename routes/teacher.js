const express = require("express");

const router = express.Router();

const {
  getTeachers,
  addTeacher,
  getTeacher,
  updateTeacher,
  deleteTeacher,
  teacherLogin,
  getTeacherProfile,
  updateTeacherProfile,
  getTeacherDashboard,
  getAssignments,
} = require("../controllers/teacher");

const { protect } = require("../middleware/authT");
const assignmentRouter = require("./assigment");

router.use("/:teacherid/assignment", assignmentRouter);

router.route("/").get(getTeachers).post(addTeacher);

router.route("/login").post(teacherLogin);

// Add routes for profile and dashboard (must come before /:id route)
router.route("/profile").get(protect, getTeacherProfile).put(protect, updateTeacherProfile);
router.route("/dashboard").get(protect, getTeacherDashboard);

router.route("/assignments").get(protect, getAssignments);

router.route("/:id").get(getTeacher).put(updateTeacher).delete(deleteTeacher);

module.exports = router;
