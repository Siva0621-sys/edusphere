import prisma from '../config/db.js';
import bcrypt from 'bcryptjs';

export async function submitApplication(req, res) {
  try {
    const data = req.body;
    if (!data.fullName || !data.email || !data.phone || !data.currentClass) {
      return res.status(400).json({ message: 'Missing mandatory applicant details.' });
    }

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const applicationNumber = `EDU-${new Date().getFullYear()}-${randomNum}`;
    const verificationPin = data.verificationPin || Math.floor(1000 + Math.random() * 9000).toString();

    let modeEnum = 'HYBRID';
    if (data.preferredMode === 'Online') modeEnum = 'ONLINE';
    else if (data.preferredMode === 'Offline') modeEnum = 'OFFLINE';

    const application = await prisma.application.create({
      data: {
        applicationNumber,
        fullName: data.fullName,
        email: data.email.toLowerCase(),
        phone: data.phone,
        whatsapp: data.whatsapp || data.phone,
        dob: data.dob ? new Date(data.dob) : null,
        gender: data.gender || 'Not Specified',
        address: data.address || '',
        city: data.city || '',
        state: data.state || '',
        pincode: data.pincode || '',
        currentClass: data.currentClass,
        schoolName: data.schoolName || '',
        board: data.board || 'CBSE',
        previousMarks: data.previousMarks || '',
        courseId: data.courseId || null,
        preferredMode: modeEnum,
        preferredBatch: data.preferredBatch || 'Evening',
        guardianName: data.guardianName || '',
        guardianRelationship: data.guardianRelationship || 'Parent',
        guardianPhone: data.guardianPhone || '',
        guardianEmail: data.guardianEmail || '',
        verificationPin,
        status: 'PENDING',
        adminNotes: 'Application submitted online. Staff review in progress.'
      }
    });

    res.status(201).json({
      message: 'Application submitted successfully',
      applicationNumber: application.applicationNumber,
      verificationPin: application.verificationPin,
      id: application.id
    });
  } catch (err) {
    console.error('Submit application error:', err);
    res.status(500).json({ message: 'Failed to submit application', error: err.message });
  }
}

export async function trackApplication(req, res) {
  try {
    const { number, identifier } = req.query;

    if (!number || !identifier) {
      return res.status(400).json({ message: 'Both Application Reference ID and Verification Phone/PIN are required.' });
    }

    const cleanNum = number.trim().toUpperCase();
    const cleanId = identifier.trim();

    const application = await prisma.application.findFirst({
      where: {
        applicationNumber: cleanNum
      },
      include: {
        course: true
      }
    });

    if (!application) {
      return res.status(404).json({ message: 'No application record found matching this ID.' });
    }

    // Secure verification check (anti ID-guessing requirement)
    const matchesPhone = application.phone && application.phone.includes(cleanId);
    const matchesPin = application.verificationPin === cleanId;
    const matchesDob = application.dob && application.dob.toISOString().split('T')[0] === cleanId;

    if (!matchesPhone && !matchesPin && !matchesDob) {
      return res.status(403).json({ message: 'Verification details do not match the application record.' });
    }

    let statusDisplay = 'Pending';
    if (application.status === 'APPROVED') statusDisplay = 'Approved';
    else if (application.status === 'UNDER_REVIEW') statusDisplay = 'Under Review';
    else if (application.status === 'REJECTED') statusDisplay = 'Rejected';
    else if (application.status === 'WAITLISTED') statusDisplay = 'Waitlisted';

    res.json({
      id: application.id,
      applicationNumber: application.applicationNumber,
      fullName: application.fullName,
      email: application.email,
      phone: application.phone,
      currentClass: application.currentClass,
      board: application.board,
      courseName: application.course?.title || 'Tuition Program',
      status: statusDisplay,
      adminNotes: application.adminNotes,
      createdAt: application.createdAt
    });
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving application tracking', error: err.message });
  }
}

export async function getAllApplications(req, res) {
  try {
    const applications = await prisma.application.findMany({
      orderBy: { createdAt: 'desc' },
      include: { course: true }
    });

    const mapped = applications.map(a => {
      let statusDisplay = 'Pending';
      if (a.status === 'APPROVED') statusDisplay = 'Approved';
      else if (a.status === 'UNDER_REVIEW') statusDisplay = 'Under Review';
      else if (a.status === 'REJECTED') statusDisplay = 'Rejected';
      else if (a.status === 'WAITLISTED') statusDisplay = 'Waitlisted';

      return {
        id: a.id,
        applicationNumber: a.applicationNumber,
        fullName: a.fullName,
        email: a.email,
        phone: a.phone,
        currentClass: a.currentClass,
        board: a.board,
        courseName: a.course?.title || 'Selected Course',
        status: statusDisplay,
        adminNotes: a.adminNotes,
        createdAt: a.createdAt
      };
    });

    res.json(mapped);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch applications', error: err.message });
  }
}

export async function updateApplicationStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    let dbStatus = 'PENDING';
    if (status === 'Approved') dbStatus = 'APPROVED';
    else if (status === 'Under Review') dbStatus = 'UNDER_REVIEW';
    else if (status === 'Rejected') dbStatus = 'REJECTED';
    else if (status === 'Waitlisted') dbStatus = 'WAITLISTED';

    const updated = await prisma.application.update({
      where: { id },
      data: {
        status: dbStatus,
        adminNotes: notes || undefined
      }
    });

    // If approved, ensure student account exists
    if (dbStatus === 'APPROVED') {
      const existingUser = await prisma.user.findUnique({ where: { email: updated.email } });
      if (!existingUser) {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash('Student@123', salt);
        const studentId = 'STU-' + Math.floor(1000 + Math.random() * 9000);

        await prisma.user.create({
          data: {
            email: updated.email,
            passwordHash,
            role: 'STUDENT',
            studentProfile: {
              create: {
                studentId,
                fullName: updated.fullName,
                phone: updated.phone,
                currentClass: updated.currentClass,
                board: updated.board
              }
            }
          }
        });
      }
    }

    res.json({ message: 'Status updated', application: updated });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update application status', error: err.message });
  }
}
