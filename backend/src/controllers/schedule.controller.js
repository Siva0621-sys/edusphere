import prisma from '../config/db.js';

export async function getSchedules(req, res) {
  try {
    const schedules = await prisma.classSchedule.findMany({
      include: {
        batch: { include: { course: true } },
        teacher: true
      },
      orderBy: { date: 'asc' }
    });

    const mapped = schedules.map(s => {
      let modeDisplay = 'Online';
      if (s.mode === 'OFFLINE') modeDisplay = 'Offline';
      else if (s.mode === 'HYBRID') modeDisplay = 'Hybrid';

      return {
        id: s.id,
        courseName: s.batch?.course?.title || 'Tuition Program',
        batchName: s.batch?.name || 'Assigned Batch',
        teacherName: s.teacher?.fullName || 'Senior Faculty',
        subject: s.subject,
        topic: s.topic,
        date: s.date,
        time: `${s.startTime} - ${s.endTime}`,
        mode: modeDisplay,
        platform: s.platform || 'Google Meet',
        meetingUrl: s.meetingUrl || 'https://meet.google.com/edu-sph-live',
        status: s.status
      };
    });

    res.json(mapped);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving schedules', error: err.message });
  }
}

export async function createSchedule(req, res) {
  try {
    const data = req.body;

    let modeEnum = 'ONLINE';
    if (data.mode === 'Offline') modeEnum = 'OFFLINE';
    else if (data.mode === 'Hybrid') modeEnum = 'HYBRID';

    // Find default or first batch if not provided
    let batchId = data.batchId;
    if (!batchId) {
      const firstBatch = await prisma.batch.findFirst();
      batchId = firstBatch ? firstBatch.id : null;
    }

    if (!batchId) {
      return res.status(400).json({ message: 'Batch ID is required to schedule a class.' });
    }

    const times = (data.time || '05:00 PM - 06:30 PM').split('-').map(t => t.trim());
    const startTime = times[0] || '05:00 PM';
    const endTime = times[1] || '06:30 PM';

    const schedule = await prisma.classSchedule.create({
      data: {
        batchId,
        subject: data.subject || 'General Science',
        topic: data.topic,
        date: data.date || 'Today',
        startTime,
        endTime,
        mode: modeEnum,
        platform: data.platform || 'Google Meet',
        meetingUrl: data.meetingUrl || 'https://meet.google.com/edu-sph-live'
      }
    });

    res.status(201).json(schedule);
  } catch (err) {
    res.status(500).json({ message: 'Error creating schedule', error: err.message });
  }
}
