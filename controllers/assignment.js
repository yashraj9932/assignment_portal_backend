const asyncHandler = require("../middleware/async");
const Assignment = require("../models/Assignment");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const ErrorResponse = require("../utils/errorResponse");
const path = require("path");
const fs = require("fs");

exports.getAssignments = asyncHandler(async (req, res, next) => {
  // #swagger.tags=['Assignment']
  let assignments;
  
  // Check if we have a teacher ID from the route params or from authenticated teacher
  const teacherId = req.params.teacherid || (req.teacher ? req.teacher.id : null);
  
  if (teacherId) {
    console.log(
      "Assignment Controller: Getting assignments for teacher:",
      teacherId
    );
    assignments = await Assignment.find({
      teacher: teacherId,
    }).populate("teacher", "name");
  } else {
    // If no specific teacher, get all assignments (for students or general view)
    console.log("Assignment Controller: Getting all assignments");
    assignments = await Assignment.find().populate("teacher", "name");
  }

  console.log("Assignment Controller: Found assignments:", assignments.length);
  res
    .status(200)
    .json({ success: true, count: assignments.length, data: assignments });
});

exports.getAssignment = asyncHandler(async (req, res, next) => {
  // #swagger.tags=['Assignment']

  const assignment = await Assignment.findById(req.params.id).populate({
    path: "assignmentSubmitted.student",
  });
  res.status(200).json({ success: true, data: assignment });
});

exports.createAssignment = asyncHandler(async (req, res, next) => {
  // #swagger.tags=['Assignment']
  console.log("Creating assignment with data:", req.body);

  let teacher = await Teacher.findById(req.teacher.id);
  if (!teacher) {
    return next(new ErrorResponse("Teacher not found", 404));
  }

  const alist = teacher.assignments;

  req.body.teacher = req.teacher.id;

  // Validate required fields
  if (!req.body.title) {
    return next(new ErrorResponse("Title is required", 400));
  }
  if (!req.body.description) {
    return next(new ErrorResponse("Description is required", 400));
  }

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

  res.status(201).json({ success: true, data: assignment, teacher });
});

exports.updateQ = asyncHandler(async (req, res, next) => {
  // #swagger.tags=['Assignment']

  let assignment = await Assignment.findById(req.params.id);
  if (!assignment) {
    return next(new ErrorResponse("Assignment does not exist", 404));
  }
  const fieldsToUpdate = {
    title: req.body.title,
    description: req.body.description,
  };
  assignment = await Assignment.findByIdAndUpdate(
    req.params.id,
    fieldsToUpdate,
    {
      new: true,
      runValidators: true,
    }
  );
  res.status(201).json({ success: true, data: assignment });
});

exports.updateA = asyncHandler(async (req, res, next) => {
  // #swagger.tags=['Assignment']

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
      submittedAt: new Date(),
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

// Get all submissions for a specific assignment
exports.getAssignmentSubmissions = asyncHandler(async (req, res, next) => {
  const assignment = await Assignment.findById(req.params.id).populate(
    "assignmentSubmitted.student",
    "name email"
  );

  if (!assignment) {
    return next(new ErrorResponse("Assignment not found", 404));
  }

  res.status(200).json({
    success: true,
    data: assignment.assignmentSubmitted,
  });
});

// Delete an assignment
exports.deleteAssignment = asyncHandler(async (req, res, next) => {
  const assignment = await Assignment.findById(req.params.id);

  if (!assignment) {
    return next(new ErrorResponse("Assignment not found", 404));
  }

  // Check if the teacher owns this assignment
  if (assignment.teacher.toString() !== req.teacher.id) {
    return next(
      new ErrorResponse("Not authorized to delete this assignment", 403)
    );
  }

  // Clean up cross-references before deleting the assignment
  try {
    // Remove assignment from all students' assignmentsLeft array
    await Student.updateMany(
      { assignmentsLeft: req.params.id },
      { $pull: { assignmentsLeft: req.params.id } }
    );

    // Remove assignment from the teacher's assignments array
    await Teacher.findByIdAndUpdate(assignment.teacher, {
      $pull: { assignments: req.params.id },
    });

    // Clean up uploaded files if they exist
    if (
      assignment.assignmentSubmitted &&
      assignment.assignmentSubmitted.length > 0
    ) {
      const uploadPath = process.env.FILE_UPLOAD_PATH || "./public/uploads";

      for (const submission of assignment.assignmentSubmitted) {
        if (submission.answerpdf) {
          const filePath = `${uploadPath}/${submission.answerpdf}`;
          try {
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
              console.log(`Deleted file: ${filePath}`);
            }
          } catch (fileError) {
            console.error(`Error deleting file ${filePath}:`, fileError);
            // Continue with deletion even if file cleanup fails
          }
        }
      }
    }

    // Delete the assignment
    await Assignment.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {},
      message: "Assignment and all references deleted successfully",
    });
  } catch (error) {
    console.error("Error during assignment deletion cleanup:", error);
    return next(
      new ErrorResponse(
        "Error deleting assignment and cleaning up references",
        500
      )
    );
  }
});

// Get assignments with submission status for student dashboard
exports.getStudentAssignments = asyncHandler(async (req, res, next) => {
  // #swagger.tags=['Assignment']
  const studentId = req.student.id;

  // Get all assignments
  const assignments = await Assignment.find().populate("teacher", "name");

  // Get student's assignmentsLeft to determine submission status
  const student = await Student.findById(studentId);
  if (!student) {
    return next(new ErrorResponse("Student not found", 404));
  }

  // Add submission status to each assignment
  const assignmentsWithStatus = assignments.map((assignment) => {
    const assignmentObj = assignment.toObject();

    // Check if student has submitted this assignment
    const isSubmitted = assignment.assignmentSubmitted.some(
      (submission) => submission.student.toString() === studentId
    );

    // Check if assignment is in student's assignmentsLeft (not submitted)
    const isInAssignmentsLeft = student.assignmentsLeft.some(
      (assignmentId) => assignmentId.toString() === assignment._id.toString()
    );

    // Determine completion status
    let completionStatus = "pending";
    if (isSubmitted) {
      completionStatus = "completed";
    } else if (new Date(assignment.dueDate) < new Date()) {
      completionStatus = "overdue";
    }

    return {
      ...assignmentObj,
      isSubmitted,
      isInAssignmentsLeft,
      completionStatus,
      submittedAt: isSubmitted
        ? assignment.assignmentSubmitted.find(
            (submission) => submission.student.toString() === studentId
          )?.submittedAt || null
        : null,
    };
  });

  res.status(200).json({
    success: true,
    count: assignmentsWithStatus.length,
    data: assignmentsWithStatus,
  });
});
