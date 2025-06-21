const Teacher = require("../models/Teacher");
const ErrorResponse = require("../utils/errorResponse");
const Assignment = require("../models/Assignment");
const Student = require("../models/Student");

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

//@desc   Get Teacher Profile (authenticated)
//@route  GET /teacher/profile
//@Acess  Private

exports.getTeacherProfile = asyncHandler(async (req, res, next) => {
  // Get teacher ID from JWT token (stored in req.teacher.id)
  const teacherId = req.teacher.id;
  
  const teacher = await Teacher.findById(teacherId);
  // #swagger.tags=['Teacher / Student']

  if (!teacher) {
    return next(new ErrorResponse("Teacher not found", 404));
  }

  res.status(200).json({
    success: true,
    msg: teacher,
  });
});

//@desc   Update Teacher Profile (authenticated)
//@route  PUT /teacher/profile
//@Acess  Private

exports.updateTeacherProfile = asyncHandler(async (req, res, next) => {
  const teacherId = req.teacher.id;
  const fieldsToUpdate = {};
  
  if (req.body.name) {
    fieldsToUpdate.name = req.body.name;
  }
  if (req.body.email) {
    fieldsToUpdate.email = req.body.email;
  }
  if (req.body.subject) {
    fieldsToUpdate.subject = req.body.subject;
  }
  if (req.body.bio !== undefined) {
    fieldsToUpdate.bio = req.body.bio;
  }
  if (req.body.newPassword) {
    // Handle password update logic here
    // You might want to verify current password first
  }
  // #swagger.tags=['Teacher / Student']

  const teacher = await Teacher.findByIdAndUpdate(
    teacherId,
    fieldsToUpdate,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!teacher) {
    return next(new ErrorResponse("Teacher not found", 404));
  }

  res.status(200).json({
    success: true,
    msg: teacher,
  });
});

//@desc   Get Teacher Dashboard Data
//@route  GET /teacher/dashboard
//@Acess  Private

exports.getTeacherDashboard = asyncHandler(async (req, res, next) => {
  const teacherId = req.teacher.id;
  
  const teacher = await Teacher.findById(teacherId);
  // #swagger.tags=['Teacher / Student']

  if (!teacher) {
    return next(new ErrorResponse("Teacher not found", 404));
  }

  // Get teacher's assignments
  const assignments = await Assignment.find({ teacher: teacherId })
    .sort({ createdAt: -1 })
    .limit(5);

  // Get total assignments count (all assignments, not just recent ones)
  const totalAssignments = await Assignment.countDocuments({ teacher: teacherId });

  // Get total students (all students in the system)
  const totalStudents = await Student.countDocuments({ role: 'student' });

  // Get recent submissions from teacher's assignments
  const recentSubmissions = [];
  for (const assignment of assignments) {
    if (assignment.assignmentSubmitted && assignment.assignmentSubmitted.length > 0) {
      for (const submission of assignment.assignmentSubmitted) {
        const student = await Student.findById(submission.student).select('name');
        if (student) {
          recentSubmissions.push({
            studentName: student.name,
            assignmentTitle: assignment.title,
            submittedAt: submission.submittedAt || assignment.createdAt, // Use actual submission date if available
            status: 'submitted' // Default status
          });
        }
      }
    }
  }

  // Sort submissions by date and limit to 5
  recentSubmissions.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
  recentSubmissions.splice(5);

  const dashboardData = {
    totalAssignments: totalAssignments,
    totalStudents: totalStudents,
    recentAssignments: assignments,
    recentSubmissions: recentSubmissions
  };

  res.status(200).json({
    success: true,
    msg: dashboardData,
  });
});

//@desc   Get Teacher's Assignments
//@route  GET /teacher/assignments
//@Acess  Private

exports.getAssignments = asyncHandler(async (req, res, next) => {
  const teacherId = req.teacher.id;
  
  const assignments = await Assignment.find({ teacher: teacherId }).populate('teacher', 'name');
  // #swagger.tags=['Teacher / Student']

  res.status(200).json({
    success: true,
    count: assignments.length,
    data: assignments,
  });
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
