import prisma from '../config/db.js';

export async function getMaterials(req, res) {
  try {
    const materials = await prisma.studyMaterial.findMany({
      include: { course: true },
      orderBy: { createdAt: 'desc' }
    });

    const mapped = materials.map(m => ({
      id: m.id,
      title: m.title,
      subject: m.subject,
      courseName: m.course?.title || 'General Curriculum',
      fileType: m.fileType,
      size: m.size || '2.4 MB',
      uploadedBy: m.uploadedBy,
      uploadedDate: m.createdAt.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      downloadUrl: m.fileUrl || '#'
    }));

    res.json(mapped);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving materials', error: err.message });
  }
}

export async function uploadMaterial(req, res) {
  try {
    const data = req.body;
    const material = await prisma.studyMaterial.create({
      data: {
        title: data.title,
        subject: data.subject || 'General',
        fileType: data.fileType || 'PDF',
        size: data.size || '2.5 MB',
        uploadedBy: data.uploadedBy || 'Faculty',
        fileUrl: data.fileUrl || '#'
      }
    });

    res.status(201).json(material);
  } catch (err) {
    res.status(500).json({ message: 'Failed to upload study material', error: err.message });
  }
}
