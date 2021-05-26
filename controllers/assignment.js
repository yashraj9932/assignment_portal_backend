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
  const assignment = await Assignment.findById(req.params.id).populate({
    path: "assignmentSubmitted.student",
  });
  res.status(200).json({ success: true, data: assignment });
});

exports.createAssignment = asyncHandler(async (req, res, next) => {
  // console.log(req.teacher);
  let teacher = await Teacher.findById(req.teacher.id);

  const alist = teacher.assignments;

  req.body.teacher = req.teacher.id;
  const assignment = await Assignment.create(req.body);

  const leftt = assignment._id;

  const ress = await Student.updateMany(
    { role: "student" },
    { $push: { assignmentsLeft: leftt } }
  );

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

  // Make sure the image is a pdf or docx
  if (!file.mimetype.startsWith("application")) {
    return next(new ErrorResponse(`Please upload file in correct format`, 400));
  }

  const student = await Student.findById(req.student.id);
  const assleft = student.assignmentsLeft;
  if (assleft.indexOf(req.params.id) === -1) {
    return next(
      new ErrorResponse("Assignment has already been submitted", 400)
    );
  } else {
    const leftt = req.params.id;

    const ress = await Student.updateMany(
      { role: "student" },
      { $pull: { assignmentsLeft: leftt } }
    );
  }

  // Create custom filename
  file.name = `pdf_${req.student.id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse(`Problem with file upload`, 500));
    }
    let val = assignment.assignmentSubmitted;

    const valls = {
      student: req.student.id,
      answerpdf: file.name,
    };
    val.push(valls);

    const fieldsToUpdate = {
      assignmentSubmitted: val,
    };
    assignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      fieldsToUpdate,
      {
        new: true,
        runValidators: true,
      }
    );
    res.status(200).json({
      success: true,
      data: file.name,
      assignment,
    });
  });
});
