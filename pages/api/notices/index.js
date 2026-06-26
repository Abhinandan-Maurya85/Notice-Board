import { prisma } from '../../../lib/prisma'
import { getAuthUser } from '../../../lib/auth'

export default async function handler(req, res) {
  const user = getAuthUser(req)
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized. Please log in.' })
  }

  if (req.method === 'GET') {
    try {
      const { q, category } = req.query

      const where = {}
      if (q) {
        where.OR = [
          { title: { contains: q, mode: 'insensitive' } },
          { body: { contains: q, mode: 'insensitive' } },
        ]
      }
      if (category && category !== 'All') {
        where.category = category
      }

      const notices = await prisma.notice.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }],
      })

      const sorted = [
        ...notices.filter(n => n.isPinned),
        ...notices.filter(n => !n.isPinned && n.priority === 'Urgent'),
        ...notices.filter(n => !n.isPinned && n.priority !== 'Urgent'),
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
      const { title, body, category, priority, publishDate, imageUrl, isPinned, expiresAt } = req.body

      if (!title || !title.trim())
        return res.status(400).json({ error: 'Title is required' })
      if (!body || !body.trim())
        return res.status(400).json({ error: 'Body is required' })
      if (!publishDate || isNaN(new Date(publishDate)))
        return res.status(400).json({ error: 'A valid publish date is required' })

      // Call Gemini AI for summary
      let aiSummary = null
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: `Summarize this university notice in 2 sentences max, plain text only, no bullet points:\n\nTitle: ${title}\n\n${body}`
                }]
              }]
            })
          }
        )
        const geminiData = await geminiRes.json()
        aiSummary = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || null
      } catch (aiErr) {
        // AI failure should not block notice creation
        console.error('Gemini error:', aiErr.message)
      }

      const notice = await prisma.notice.create({
        data: {
          title: title.trim(),
          body: body.trim(),
          category: category || 'General',
          priority: priority || 'Normal',
          publishDate: new Date(publishDate),
          imageUrl: imageUrl || null,
          isPinned: isPinned || false,
          expiresAt: expiresAt ? new Date(expiresAt) : null,
          aiSummary,
        },
      })

      const students = await prisma.user.findMany({
        where: { role: 'STUDENT' },
        select: { id: true },
      })

      if (students.length > 0) {
        await prisma.notification.createMany({
          data: students.map(s => ({
            userId: s.id,
            noticeId: notice.id,
            message: `📢 New Notice: ${notice.title}`,
            isRead: false,
          })),
        })
      }

      const io = res.socket.server.io
      if (io) {
        students.forEach(s => {
          io.to(`user_${s.id}`).emit('new_notification', {
            message: `📢 New Notice: ${notice.title}`,
            noticeId: notice.id,
            priority: notice.priority,
            createdAt: new Date().toISOString(),
            isRead: false,
          })
        })
      }

      return res.status(201).json(notice)
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }

  res.setHeader('Allow', ['GET', 'POST'])
  return res.status(405).json({ error: `Method ${req.method} not allowed` })
}