import { prisma } from '../../../lib/prisma'
import { getAuthUser } from '../../../lib/auth'

export default async function handler(req, res) {
  const user = getAuthUser(req)
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized. Please log in.' })
  }

  const { id } = req.query
  const noticeId = parseInt(id)

  if (isNaN(noticeId)) {
    return res.status(400).json({ error: 'Invalid ID' })
  }

  // Restrict modification operations to Faculty only
  if (req.method === 'PUT' || req.method === 'DELETE') {
    if (user.role !== 'FACULTY') {
      return res.status(403).json({ error: 'Access denied. Only faculty can modify notices.' })
    }
  }


  if (req.method === 'GET') {
    const notice = await prisma.notice.findUnique({ where: { id: noticeId } })
    if (!notice) return res.status(404).json({ error: 'Notice not found' })
    return res.status(200).json(notice)
  }

  if (req.method === 'PUT') {
    const { title, body, category, priority, publishDate, imageUrl } = req.body

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' })
    }
    if (!body || !body.trim()) {
      return res.status(400).json({ error: 'Body is required' })
    }
    if (!publishDate || isNaN(new Date(publishDate))) {
      return res.status(400).json({ error: 'A valid publish date is required' })
    }

    const notice = await prisma.notice.update({
      where: { id: noticeId },
      data: {
        title: title.trim(),
        body: body.trim(),
        category: category || 'General',
        priority: priority || 'Normal',
        publishDate: new Date(publishDate),
        imageUrl: imageUrl || null,
      },
    })
    return res.status(200).json(notice)
  }

  if (req.method === 'DELETE') {
    await prisma.notice.delete({ where: { id: noticeId } })
    return res.status(200).json({ message: 'Deleted successfully' })
  }

  res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
  return res.status(405).json({ error: `Method ${req.method} not allowed` })
}