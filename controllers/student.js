const Student = require("../models/Student");
const ErrorResponse = require("../utils/errorResponse");

const asyncHandler = require("../middleware/async");

//@desc    Get All Students
//@route   GET /student
//@Acess   Private/Admin

exports.getStudents = asyncHandler(async (req, res, next) => {
  const students = await Student.find();
  // #swagger.tags=['Student']

  res.status(200).json({
    success: true,
    count: students.length,
    msg: students,
  });
});

//@desc    Add new Student
//@route   POST /student
//@Acess   Private/Admin

exports.addStudent = asyncHandler(async (req, res, next) => {
  const student = await Student.create(req.body);

  // #swagger.tags=['Student']

  res.status(201).json({
    success: true,
    msg: student,
  });
});

//@desc    Get a Single Student
//@route   GET /student/:id
//@Acess   Private/Admin

exports.getStudent = asyncHandler(async (req, res, next) => {
  const student = await Student.findById(req.params.id).populate({
    path: "assignmentsLeft",
  });
  // #swagger.tags=['Student']

  if (!student) {
    return next(
      newErrorResponse(`Student not found with the id of ${req.params.id}`, 405)
    );
  }

  res.status(200).json({
    success: true,
    msg: student,
  });
});

//@desc    Add new Student
//@route   PUT /student
//@Acess   Private/Admin

exports.updateStudent = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {};
  if (req.body.name) {
    fieldsToUpdate.name = req.body.name;
  }
  if (req.body.email) {
    fieldsToUpdate.email = req.body.email;
  }
  // #swagger.tags=['Student']

  const student = await Student.findByIdAndUpdate(
    req.params.id,
    fieldsToUpdate,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(201).json({
    success: true,
    msg: student,
  });
});

// @desc      Delete Student
// @route     DELETE /Student/:id
// @access    Private/Admin
exports.deleteStudent = asyncHandler(async (req, res, next) => {
  await Student.findByIdAndDelete(req.params.id);
  // #swagger.tags=['Student']

  res.status(200).json({
    success: true,
    data: {},
  });
});

//@desc   Login User
//@route  POST /student/login
//@Acess Public

exports.studentLogin = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  // #swagger.tags=['Student']

  if (!email || !password) {
    return next(new ErrorResponse("Please provide an email and password", 404));
  }

  //Check for user
  const student = await Student.findOne({ email }).select("+password");

  if (!student) {
    return next(new ErrorResponse("Invalid Credentials", 401));
  }

  //Check is password matches
  const isMatch = await student.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse("Invalid Credentials", 401));
  }
  sendTokenResponse(student, 200, res);
});

const sendTokenResponse = (student, statusCode, res) => {
  //Create token
  const token = student.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }
  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({ success: true, token });
};
