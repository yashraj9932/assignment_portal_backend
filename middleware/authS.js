const jwt = require("jsonwebtoken");
const asyncHandler = require("./async");
const ErrorResponse = require("../utils/errorResponse");
const Student = require("../models/Student");

// Protect routes
exports.protect1 = asyncHandler(async (req, res, next) => {
  let token;

  console.log('AuthS Middleware: Checking authorization headers:', req.headers.authorization);

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(" ")[1];
    console.log('AuthS Middleware: Token extracted:', token ? 'Token exists' : 'No token');
  }

  //   // Set token from cookie
  //   else if (req.cookies.token) {
  //     token = req.cookies.token;
  //   }

  // Make sure token exists
  if (!token) {
    console.log('AuthS Middleware: No token found, returning 401');
    return next(new ErrorResponse("Not authorized to access this route", 401));
  }

  try {
    console.log('AuthS Middleware: Verifying token with secret:', process.env.JWT_SECRET ? 'Secret exists' : 'No secret');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('AuthS Middleware: Token decoded successfully, student ID:', decoded.id);
    req.student = await Student.findById(decoded.id);
    
    if (!req.student) {
      console.log('AuthS Middleware: Student not found in database');
      return next(new ErrorResponse("Student not found", 404));
    }
    
    console.log('AuthS Middleware: Student found:', req.student.name);
    next();
  } catch (err) {
    console.log('AuthS Middleware: Token verification failed:', err.message);
    return next(new ErrorResponse("Not authorized to access this route", 401));
  }
});

exports.authorize1 = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.student.role)) {
      return next(
        new ErrorResponse(`User Role ${req.student.role} not authorised`),
        403
      );
    }
    next();
  };
};
