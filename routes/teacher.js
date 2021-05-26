const express = require("express");

const router = express.Router();

const {
  getTeachers,
  addTeacher,
  getTeacher,
  updateTeacher,
  deleteTeacher,
  teacherLogin,
} = require("../controllers/teacher");

const assignmentRouter = require("./assigment");

router.use("/:teacherid/assignment", assignmentRouter);

router.route("/").get(getTeachers).post(addTeacher);

router.route("/:id").get(getTeacher).put(updateTeacher).delete(deleteTeacher);

router.route("/login").post(teacherLogin);

module.exports = router;
