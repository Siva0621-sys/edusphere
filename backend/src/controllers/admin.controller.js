import prisma from '../config/db.js';

export async function getDashboardStats(req, res) {
  try {
    const [totalApps, pendingApps, approvedApps, totalCourses, totalBatches, totalSchedules] = await Promise.all([
      prisma.application.count(),
      prisma.application.count({ where: { status: 'PENDING' } }),
      prisma.application.count({ where: { status: 'APPROVED' } }),
      prisma.course.count({ where: { isActive: true } }),
      prisma.batch.count(),
      prisma.classSchedule.count()
    ]);

    const totalTeachers = await prisma.user.count({ where: { role: 'TEACHER' } });

    res.json({
      totalApplications: totalApps,
      pendingApplications: pendingApps,
      approvedStudents: approvedApps,
      totalTeachers,
      totalCourses,
      totalBatches,
      todayClasses: totalSchedules
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching admin metrics', error: err.message });
  }
}
