import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import * as authCtrl from '../controllers/auth.controller.js';
import * as appCtrl from '../controllers/application.controller.js';
import * as courseCtrl from '../controllers/course.controller.js';
import * as schedCtrl from '../controllers/schedule.controller.js';
import * as matCtrl from '../controllers/material.controller.js';
import * as assignCtrl from '../controllers/assignment.controller.js';
import * as annCtrl from '../controllers/announcement.controller.js';
import * as adminCtrl from '../controllers/admin.controller.js';
import prisma from '../config/db.js';

const router = Router();

// --- HEALTH & STATUS ---
router.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// --- AUTHENTICATION ---
router.post('/auth/login', authCtrl.login);
router.post('/auth/register', authCtrl.register);
router.get('/auth/me', authenticateToken, authCtrl.getMe);

// --- ADMISSIONS & APPLICATIONS ---
router.post('/applications', appCtrl.submitApplication);
router.get('/applications/track', appCtrl.trackApplication);
router.get('/applications', appCtrl.getAllApplications);
router.patch('/applications/:id/status', appCtrl.updateApplicationStatus);

// --- COURSES ---
router.get('/courses', courseCtrl.getCourses);
router.get('/courses/:id', courseCtrl.getCourseById);
router.post('/courses', courseCtrl.createCourse);

// --- SCHEDULES & ONLINE CLASSES ---
router.get('/schedules', schedCtrl.getSchedules);
router.post('/schedules', schedCtrl.createSchedule);

// --- STUDY MATERIALS ---
router.get('/materials', matCtrl.getMaterials);
router.post('/materials', matCtrl.uploadMaterial);

// --- ASSIGNMENTS ---
router.get('/assignments', assignCtrl.getAssignments);
router.post('/assignments', assignCtrl.createAssignment);
router.post('/assignments/:id/submissions', assignCtrl.submitAssignment);

// --- ANNOUNCEMENTS ---
router.get('/announcements', annCtrl.getAnnouncements);
router.post('/announcements', annCtrl.createAnnouncement);

// --- ADMIN STATS ---
router.get('/admin/dashboard', adminCtrl.getDashboardStats);

// --- TEACHERS ---
router.get('/teachers', async (req, res) => {
  try {
    const teachers = await prisma.teacherProfile.findMany({
      include: { user: true }
    });
    res.json(teachers.map(t => ({
      id: t.id,
      fullName: t.fullName,
      email: t.user?.email,
      phone: t.phone,
      qualification: t.qualifications,
      subjects: t.subjectsTaught,
      bio: t.bio,
      assignedCourses: ['Class 10 CBSE Board Mastery', 'Physics Excellence']
    })));
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving teachers', error: err.message });
  }
});

export default router;
