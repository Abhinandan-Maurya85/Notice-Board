import { prisma } from '../../../lib/prisma'
import { getAuthUser } from '../../../lib/auth'

export default async function handler(req, res) {
  const user = getAuthUser(req)
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized. Please log in.' })
  }

  if (req.method === 'GET') {
    try {
      const notices = await prisma.notice.findMany({

        orderBy: [{ createdAt: 'desc' }],
      })
      const sorted = [
        ...notices.filter(n => n.priority === 'Urgent'),
        ...notices.filter(n => n.priority === 'Normal'),
      ]
      return res.status(200).json(sorted)
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }

  if (req.method === 'POST') {
    if (user.role !== 'FACULTY') {
      return res.status(403).json({ error: 'Access denied. Only faculty can post notices.' })
    }
    try {
      const { title, body, category, priority, publishDate, imageUrl } = req.body


      if (!title || !title.trim())
        return res.status(400).json({ error: 'Title is required' })
      if (!body || !body.trim())
        return res.status(400).json({ error: 'Body is required' })
      if (!publishDate || isNaN(new Date(publishDate)))
        return res.status(400).json({ error: 'A valid publish date is required' })

        const notice = await prisma.notice.create({
          data: {
            title: title.trim(),
            body: body.trim(),
            category: category || 'General',
            priority: priority || 'Normal',
            publishDate: new Date(publishDate),
            imageUrl: imageUrl || null,
          },
        })
        
        // Create Notification
        await prisma.notification.create({
          data: {
            message: `📢 New Notice Added: ${notice.title}`,
          },
        })
      return res.status(201).json(notice)
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }

  res.setHeader('Allow', ['GET', 'POST'])
  return res.status(405).json({ error: `Method ${req.method} not allowed` })
}