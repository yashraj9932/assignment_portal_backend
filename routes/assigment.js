const express = require("express");

const router = express.Router({ mergeParams: true });

const {
  createAssignment,
  getAssignment,
  getAssignments,
  updateA,
  updateQ,
} = require("../controllers/assignment");

const { protect, authorize } = require("../middleware/authT");
const { protect1, authorize1 } = require("../middleware/authS");

router.route("/").get(getAssignments).post(protect, createAssignment);

router.route("/:id").get(getAssignment);

router.route("/updateQ/:id").put(protect, updateQ);
// .put(protect, authorize("teacher", "admin"), updateQ);

router.route("/updateA/:id").put(protect1, updateA);

module.exports = router;
