const express = require("express");

const router = express.Router();

const {
  getStudents,
  addStudent,
  getStudent,
  updateStudent,
  deleteStudent,
  studentLogin,
} = require("../controllers/student");

router.route("/").get(getStudents).post(addStudent);

router.route("/:id").get(getStudent).put(updateStudent).delete(deleteStudent);

router.route("/login").post(studentLogin);

module.exports = router;
