import prisma from '../config/db.js';

export async function getAssignments(req, res) {
  try {
    const assignments = await prisma.assignment.findMany({
      include: {
        course: true,
        teacher: true,
        submissions: true
      },
      orderBy: { dueDate: 'asc' }
    });

    const mapped = assignments.map(a => ({
      id: a.id,
      title: a.title,
      instructions: a.instructions,
      courseName: a.course?.title || 'Academic Program',
      teacherName: a.teacher?.fullName || 'Senior Instructor',
      dueDate: a.dueDate.toISOString().split('T')[0],
      maxMarks: a.maxMarks,
      status: a.submissions.length > 0 ? 'Submitted' : 'Pending Submission',
      mySubmission: a.submissions[0] ? {
        submittedAt: a.submissions[0].submittedAt.toLocaleString(),
        fileName: a.submissions[0].fileName || 'submission.pdf',
        grade: a.submissions[0].marksObtained ? `${a.submissions[0].marksObtained} / ${a.maxMarks}` : 'Under Review',
        remarks: a.submissions[0].feedback || 'Submitted on time.'
      } : null
    }));

    res.json(mapped);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving assignments', error: err.message });
  }
}

export async function createAssignment(req, res) {
  try {
    const data = req.body;
    let courseId = data.courseId;
    if (!courseId) {
      const firstCourse = await prisma.course.findFirst();
      courseId = firstCourse ? firstCourse.id : null;
    }

    const assignment = await prisma.assignment.create({
      data: {
        title: data.title,
        instructions: data.instructions,
        courseId,
        dueDate: data.dueDate ? new Date(data.dueDate) : new Date(Date.now() + 7 * 86400000),
        maxMarks: parseInt(data.maxMarks, 10) || 25
      }
    });

    res.status(201).json(assignment);
  } catch (err) {
    res.status(500).json({ message: 'Error creating assignment', error: err.message });
  }
}

export async function submitAssignment(req, res) {
  try {
    const { id } = req.params;
    const { fileName, notes } = req.body;

    // Find student profile
    const student = await prisma.studentProfile.findFirst();
    if (!student) {
      return res.status(400).json({ message: 'No student profile associated.' });
    }

    const submission = await prisma.assignmentSubmission.upsert({
      where: {
        assignmentId_studentId: {
          assignmentId: id,
          studentId: student.id
        }
      },
      update: {
        fileName: fileName || 'student_solution.pdf',
        notes: notes || '',
        submittedAt: new Date()
      },
      create: {
        assignmentId: id,
        studentId: student.id,
        fileName: fileName || 'student_solution.pdf',
        notes: notes || '',
        status: 'SUBMITTED'
      }
    });

    res.status(201).json({ message: 'Submission recorded', submission });
  } catch (err) {
    res.status(500).json({ message: 'Error submitting assignment', error: err.message });
  }
}
