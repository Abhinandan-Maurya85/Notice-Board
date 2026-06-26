import { prisma } from '../../../lib/prisma'
import { getAuthUser } from '../../../lib/auth'

export default async function handler(req, res) {
  const user = getAuthUser(req)
  if (!user) return res.status(401).json({ error: 'Unauthorized' })

  // GET — fetch all bookmarks for this user
  if (req.method === 'GET') {
    try {
      const bookmarks = await prisma.bookmark.findMany({
        where: { userId: user.id },
        include: { notice: true },
        orderBy: { createdAt: 'desc' },
      })
      return res.status(200).json(bookmarks)
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }

  // POST — add bookmark
  if (req.method === 'POST') {
    try {
      const { noticeId } = req.body
      const bookmark = await prisma.bookmark.upsert({
        where: { userId_noticeId: { userId: user.id, noticeId: parseInt(noticeId) } },
        update: {},
        create: { userId: user.id, noticeId: parseInt(noticeId) },
      })
      return res.status(201).json(bookmark)
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }

  // DELETE — remove bookmark
  if (req.method === 'DELETE') {
    try {
      const { noticeId } = req.body
      await prisma.bookmark.delete({
        where: { userId_noticeId: { userId: user.id, noticeId: parseInt(noticeId) } },
      })
      return res.status(200).json({ success: true })
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }

  res.setHeader('Allow', ['GET', 'POST', 'DELETE'])
  return res.status(405).json({ error: `Method ${req.method} not allowed` })
}