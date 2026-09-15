import prisma from '../config/db.js';

export async function getCourses(req, res) {
  try {
    const courses = await prisma.course.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
      include: {
        batches: {
          include: { teacher: true }
        }
      }
    });

    const mapped = courses.map(c => {
      let modeDisplay = 'Hybrid';
      if (c.mode === 'ONLINE') modeDisplay = 'Online';
      else if (c.mode === 'OFFLINE') modeDisplay = 'Offline';

      const teacherName = c.batches[0]?.teacher?.fullName || 'Senior Faculty';

      return {
        id: c.id,
        title: c.title,
        slug: c.slug,
        classGrade: c.classGrade,
        subject: c.subject,
        description: c.description,
        duration: c.duration,
        mode: modeDisplay,
        teacher: teacherName,
        timings: c.timings || 'Mon, Wed, Fri (5:00 PM - 7:00 PM)',
        fee: c.fee,
        feeType: 'per month',
        seatsAvailable: c.seatsAvailable,
        maxSeats: c.maxSeats,
        syllabus: c.syllabus || []
      };
    });

    res.json(mapped);
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve courses', error: err.message });
  }
}

export async function getCourseById(req, res) {
  try {
    const { id } = req.params;
    const course = await prisma.course.findFirst({
      where: {
        OR: [{ id }, { slug: id }]
      },
      include: {
        batches: {
          include: { teacher: true }
        }
      }
    });

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    let modeDisplay = 'Hybrid';
    if (course.mode === 'ONLINE') modeDisplay = 'Online';
    else if (course.mode === 'OFFLINE') modeDisplay = 'Offline';

    res.json({
      id: course.id,
      title: course.title,
      slug: course.slug,
      classGrade: course.classGrade,
      subject: course.subject,
      description: course.description,
      duration: course.duration,
      mode: modeDisplay,
      teacher: course.batches[0]?.teacher?.fullName || 'Expert Faculty',
      timings: course.timings || 'Mon, Wed, Fri (5:00 PM - 7:00 PM)',
      fee: course.fee,
      feeType: 'per month',
      seatsAvailable: course.seatsAvailable,
      maxSeats: course.maxSeats,
      syllabus: course.syllabus || []
    });
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving course', error: err.message });
  }
}

export async function createCourse(req, res) {
  try {
    const data = req.body;
    const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    let modeEnum = 'HYBRID';
    if (data.mode === 'Online') modeEnum = 'ONLINE';
    else if (data.mode === 'Offline') modeEnum = 'OFFLINE';

    const course = await prisma.course.create({
      data: {
        title: data.title,
        slug: slug + '-' + Date.now().toString().slice(-4),
        description: data.description || '',
        classGrade: data.classGrade,
        subject: data.subject,
        mode: modeEnum,
        fee: parseInt(data.fee, 10) || 3000,
        duration: data.duration || '10 Months',
        timings: data.timings || 'Mon, Wed, Fri (5:00 PM - 7:00 PM)',
        maxSeats: parseInt(data.maxSeats, 10) || 25,
        seatsAvailable: parseInt(data.maxSeats, 10) || 25
      }
    });

    res.status(201).json(course);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create course', error: err.message });
  }
}
