const asyncHandler = require("../middleware/async");
const Assignment = require("../models/Assignment");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const ErrorResponse = require("../utils/errorResponse");
const path = require("path");

exports.getAssignments = asyncHandler(async (req, res, next) => {
  let assignments;
  if (!req.params.teacherid) {
    assignments = await Assignment.find();
  } else {
    assignments = await Assignment.find({ teacher: req.params.teacherid });
  }

  res
    .status(200)
    .json({ success: true, count: assignments.length, data: assignments });
});

exports.getAssignment = asyncHandler(async (req, res, next) => {
  const assignment = await Assignment.findById(req.params.id);
  res.status(200).json({ success: true, data: assignment });
});

exports.createAssignment = asyncHandler(async (req, res, next) => {
  console.log(req.teacher);
  let teacher = await Teacher.findById(req.teacher.id);

  const alist = teacher.assignments;

  req.body.teacher = req.teacher.id;
  const assignment = await Assignment.create(req.body);

  //   console.log(teacher);
  const fieldsToUpdate = {};
  alist.push(assignment._id);
  fieldsToUpdate.assignments = alist;

  teacher = await Teacher.findByIdAndUpdate(req.teacher.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  res.status(201).json({ success: true, msg: assignment, teacher });
});

exports.updateQ = asyncHandler(async (req, res, next) => {
  let assignment = await Assignment.findById(req.params.id);
  if (!assignment) {
    return next(new ErrorResponse("Assignment does not exist", 404));
  }
  const fieldsToUpdate = {
    title: req.body.title,
    details: req.body.details,
  };
  assignment = await Assignment.findByIdAndUpdate(
    req.params.id,
    fieldsToUpdate,
    {
      new: true,
      runValidators: true,
    }
  );
  res.status(201).json({ success: true, msg: assignment });
});

exports.updateA = asyncHandler(async (req, res, next) => {
  let assignment = await Assignment.findById(req.params.id);
  if (!assignment) {
    return next(new ErrorResponse("Assignment does not exist", 404));
  }

  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file`, 400));
  }

  const file = req.files.file;
  // Create custom filename
  file.name = `pdf_${req.student.id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse(`Problem with file upload`, 500));
    }
    let val = assignment.answerpdf;
    val.push(file.name);
    const fieldsToUpdate = {
      answerpdf: val,
    };
    let val1 = assignment.student;
    val1.push(req.student.id);
    const fieldsTo = {
      student: val1,
    };
    assignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      fieldsToUpdate,
      {
        new: true,
        runValidators: true,
      }
    );
    assignment = await Assignment.findByIdAndUpdate(req.params.id, fieldsTo, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      success: true,
      data: file.name,
      assignment,
    });
  });

  // res.status(201).json({ success: true, msg: assignment });
});
