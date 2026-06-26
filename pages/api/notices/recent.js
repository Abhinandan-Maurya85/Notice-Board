import { prisma } from '../../../lib/prisma'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const notices = await prisma.notice.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, title: true, category: true, createdAt: true },
    })
    return res.status(200).json(notices)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}