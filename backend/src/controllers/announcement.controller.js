import prisma from '../config/db.js';

export async function getAnnouncements(req, res) {
  try {
    const anns = await prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' }
    });

    const mapped = anns.map(a => ({
      id: a.id,
      title: a.title,
      content: a.content,
      target: a.targetAudience,
      author: a.author,
      date: a.createdAt.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
    }));

    res.json(mapped);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving announcements', error: err.message });
  }
}

export async function createAnnouncement(req, res) {
  try {
    const { title, content, target, author } = req.body;
    const ann = await prisma.announcement.create({
      data: {
        title,
        content,
        targetAudience: target || 'All Students',
        author: author || 'Administration'
      }
    });

    res.status(201).json(ann);
  } catch (err) {
    res.status(500).json({ message: 'Error creating announcement', error: err.message });
  }
}
