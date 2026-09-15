import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting EduSphere database seed...');

  // 1. Clean existing records (in reverse dependency order)
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.assignmentSubmission.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.studyMaterial.deleteMany();
  await prisma.onlineClass.deleteMany();
  await prisma.classSchedule.deleteMany();
  await prisma.applicationStatusHistory.deleteMany();
  await prisma.application.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.batch.deleteMany();
  await prisma.course.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.teacherProfile.deleteMany();
  await prisma.guardian.deleteMany();
  await prisma.user.deleteMany();

  const salt = await bcrypt.genSalt(10);
  const adminPass = await bcrypt.hash('Admin@123', salt);
  const teacherPass = await bcrypt.hash('Teacher@123', salt);
  const studentPass = await bcrypt.hash('Student@123', salt);

  // 2. Create Admin User
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@edusphere.edu',
      passwordHash: adminPass,
      role: 'ADMIN'
    }
  });

  // 3. Create Teachers
  const teacher1User = await prisma.user.create({
    data: {
      email: 'sharma@edusphere.edu',
      passwordHash: teacherPass,
      role: 'TEACHER',
      teacherProfile: {
        create: {
          employeeId: 'EMP-FAC-001',
          fullName: 'Dr. Ramesh Sharma',
          phone: '+91 98765 11001',
          qualifications: 'Ph.D. in Physics, 14 Years Teaching Experience',
          bio: 'Former national coaching faculty specializing in CBSE Class 10 & 12 Physics problem solving.',
          experienceYears: 14,
          subjectsTaught: ['Physics', 'Science']
        }
      }
    },
    include: { teacherProfile: true }
  });

  const teacher2User = await prisma.user.create({
    data: {
      email: 'priya@edusphere.edu',
      passwordHash: teacherPass,
      role: 'TEACHER',
      teacherProfile: {
        create: {
          employeeId: 'EMP-FAC-002',
          fullName: 'Prof. Priya Verma',
          phone: '+91 98765 11002',
          qualifications: 'M.Sc. Chemistry (Gold Medalist), 12 Years Teaching',
          bio: 'Renowned faculty for organic mechanisms, physical chemistry heuristics, and JEE prep.',
          experienceYears: 12,
          subjectsTaught: ['Chemistry']
        }
      }
    },
    include: { teacherProfile: true }
  });

  // 4. Create Student
  const studentUser = await prisma.user.create({
    data: {
      email: 'rahul@edusphere.edu',
      passwordHash: studentPass,
      role: 'STUDENT',
      studentProfile: {
        create: {
          studentId: 'STU-2026-042',
          fullName: 'Rahul Deshmukh',
          phone: '+91 98765 43219',
          currentClass: 'Class 10',
          board: 'CBSE',
          schoolName: 'Delhi Public School'
        }
      }
    },
    include: { studentProfile: true }
  });

  // 5. Create Courses
  const course1 = await prisma.course.create({
    data: {
      title: 'Class 10 CBSE Comprehensive Board Mastery',
      slug: 'cbse-class-10-mastery',
      classGrade: 'Class 10',
      subject: 'Science & Mathematics',
      description: 'Complete syllabus coverage with intensive practice, NCERT exemplar problem solving, weekly tests, and CBSE board exam question bank mastery.',
      duration: '10 Months',
      mode: 'HYBRID',
      fee: 3500,
      timings: 'Mon, Wed, Fri (5:00 PM - 7:00 PM)',
      seatsAvailable: 8,
      maxSeats: 25,
      syllabus: [
        { unit: 'Physics', topics: 'Light, Electricity, Magnetic Effects' },
        { unit: 'Chemistry', topics: 'Chemical Reactions, Acids & Bases, Metals & Non-metals' },
        { unit: 'Mathematics', topics: 'Real Numbers, Polynomials, Quadratic Equations, Trigonometry' }
      ]
    }
  });

  const course2 = await prisma.course.create({
    data: {
      title: 'Class 12 Physics & Chemistry Excellence (JEE / NEET Prep)',
      slug: 'class-12-physics-chem-excellence',
      classGrade: 'Class 12',
      subject: 'Physics & Chemistry',
      description: 'Rigorous conceptual foundation and numerical solving techniques tailored for both CBSE board exams and competitive entrance examinations.',
      duration: '1 Year',
      mode: 'ONLINE',
      fee: 4500,
      timings: 'Tue, Thu, Sat (6:00 PM - 8:00 PM)',
      seatsAvailable: 5,
      maxSeats: 20,
      syllabus: [
        { unit: 'Physics (Part 1)', topics: 'Electrostatics, Current Electricity, Magnetism' },
        { unit: 'Physical Chemistry', topics: 'Solutions, Electrochemistry, Chemical Kinetics' }
      ]
    }
  });

  // 6. Create Batches
  const batch1 = await prisma.batch.create({
    data: {
      name: 'Batch 10-A (Morning/Eve)',
      courseId: course1.id,
      teacherId: teacher1User.teacherProfile.id,
      classGrade: 'Class 10',
      daysOfWeek: ['Monday', 'Wednesday', 'Friday'],
      startTime: '05:00 PM',
      endTime: '07:00 PM',
      mode: 'HYBRID',
      maxStudents: 25
    }
  });

  // 7. Enroll Student in Batch 1
  await prisma.enrollment.create({
    data: {
      studentId: studentUser.studentProfile.id,
      batchId: batch1.id,
      courseId: course1.id,
      status: 'ACTIVE'
    }
  });

  // 8. Create Sample Application
  await prisma.application.create({
    data: {
      applicationNumber: 'EDU-2026-8491',
      fullName: 'Aarav Mehta',
      email: 'aarav.mehta@example.com',
      phone: '9876543211',
      dob: new Date('2010-04-15'),
      gender: 'Male',
      address: '42 Lotus Colony, MG Road',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560001',
      currentClass: 'Class 10',
      schoolName: 'Delhi Public School',
      board: 'CBSE',
      courseId: course1.id,
      preferredMode: 'HYBRID',
      preferredBatch: 'Evening (5:00 PM - 7:00 PM)',
      guardianName: 'Sanjay Mehta',
      guardianRelationship: 'Father',
      guardianPhone: '9876543210',
      status: 'APPROVED',
      adminNotes: 'Application verified. High academic performance. Assigned to Batch A.',
      verificationPin: '1234'
    }
  });

  // 9. Create Schedules & Online Classes
  const schedule1 = await prisma.classSchedule.create({
    data: {
      batchId: batch1.id,
      teacherId: teacher1User.teacherProfile.id,
      subject: 'Physics',
      topic: 'Light: Reflection & Refraction Deep Dive',
      date: 'Today',
      startTime: '05:00 PM',
      endTime: '06:30 PM',
      mode: 'ONLINE',
      platform: 'Google Meet',
      meetingUrl: 'https://meet.google.com/edu-sph-live',
      status: 'UPCOMING'
    }
  });

  await prisma.onlineClass.create({
    data: {
      scheduleId: schedule1.id,
      topic: 'Light: Reflection & Refraction Deep Dive',
      platform: 'Google Meet',
      meetingUrl: 'https://meet.google.com/edu-sph-live'
    }
  });

  // 10. Create Study Materials
  await prisma.studyMaterial.create({
    data: {
      title: 'Class 10 Physics: Complete Formula Sheet & Ray Diagrams',
      subject: 'Physics',
      courseId: course1.id,
      batchId: batch1.id,
      fileType: 'PDF',
      size: '2.4 MB',
      uploadedBy: 'Dr. Ramesh Sharma',
      fileUrl: '#'
    }
  });

  // 11. Create Assignment
  await prisma.assignment.create({
    data: {
      title: 'Physics Worksheet: Numerical Problems on Lens Formula',
      instructions: 'Solve questions 1 through 15 on ruled sheets. Show step-by-step ray construction diagrams.',
      courseId: course1.id,
      batchId: batch1.id,
      teacherId: teacher1User.teacherProfile.id,
      dueDate: new Date(Date.now() + 7 * 86400000),
      maxMarks: 25
    }
  });

  // 12. Create Announcements
  await prisma.announcement.create({
    data: {
      title: 'Term 1 Mock Board Examination Schedule Announced',
      content: 'The first series of full-syllabus mock tests will commence from Oct 05, 2026. Hall tickets and batch seating plans will be released on the student portal next Monday.',
      targetAudience: 'All Students',
      author: 'Academic Administration'
    }
  });

  console.log('✅ Seed completed successfully!');
  console.log('Demo Credentials:');
  console.log(' - Admin:   admin@edusphere.edu  / Admin@123');
  console.log(' - Teacher: sharma@edusphere.edu / Teacher@123');
  console.log(' - Student: rahul@edusphere.edu  / Student@123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
