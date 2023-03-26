const Teacher = require("../models/Teacher");
const ErrorResponse = require("../utils/errorResponse");

const asyncHandler = require("../middleware/async");

//@desc    Get All Teachers
//@route   GET /teacher
//@Acess   Private/Admin

exports.getTeachers = asyncHandler(async (req, res, next) => {
  const teachers = await Teacher.find();
  // #swagger.tags=['Teacher / Student']

  res.status(200).json({
    success: true,
    count: teachers.length,
    msg: teachers,
  });
});

//@desc    Add new teacher
//@route   POST /teacher
//@Acess   Private/Admin

exports.addTeacher = asyncHandler(async (req, res, next) => {
  const teacher = await Teacher.create(req.body);
  // #swagger.tags=['Teacher / Student']

  res.status(201).json({
    success: true,
    msg: teacher,
  });
});

//@desc    Get a Single Teacher
//@route   GET /teacher/:id
//@Acess   Private/Admin

exports.getTeacher = asyncHandler(async (req, res, next) => {
  const teacher = await Teacher.findById(req.params.id);
  // #swagger.tags=['Teacher / Student']

  if (!teacher) {
    return next(
      new ErrorResponse(
        `Teacher not found with the id of ${req.params.id}`,
        405
      )
    );
  }

  res.status(200).json({
    success: true,
    msg: teacher,
  });
});

//@desc    Add new teacher
//@route   PUT /teacher
//@Acess   Private/Admin

exports.updateTeacher = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {};
  // #swagger.tags=['Teacher / Student']

  if (req.body.name) {
    fieldsToUpdate.name = req.body.name;
  }
  if (req.body.email) {
    fieldsToUpdate.email = req.body.email;
  }

  const teacher = await Teacher.findByIdAndUpdate(
    req.params.id,
    fieldsToUpdate,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(201).json({
    success: true,
    msg: teacher,
  });
});

// @desc      Delete Teacher
// @route     DELETE /teacher/:id
// @access    Private/Admin
exports.deleteTeacher = asyncHandler(async (req, res, next) => {
  await Teacher.findByIdAndDelete(req.params.id);
  // #swagger.tags=['Teacher / Student']

  res.status(200).json({
    success: true,
    data: {},
  });
});

//@desc   Login User
//@route  POST /student/login
//@Acess Public

exports.teacherLogin = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  // #swagger.tags=['Teacher / Student']

  if (!email || !password) {
    return next(new ErrorResponse("Please provide an email and password", 404));
  }

  //Check for user
  const teacher = await Teacher.findOne({ email }).select("+password");

  if (!teacher) {
    return next(new ErrorResponse("Invalid Credentials", 401));
  }

  //Check is password matches
  const isMatch = await teacher.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse("Invalid Credentials", 401));
  }
  sendTokenResponse(teacher, 200, res);
});

const sendTokenResponse = (teacher, statusCode, res) => {
  //Create token
  const token = teacher.getSignedJwtToken();

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
