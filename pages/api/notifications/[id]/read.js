import { prisma } from '../../../../lib/prisma'
import { getAuthUser } from '../../../../lib/auth'

export default async function handler(req, res) {
  const user = getAuthUser(req)
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized. Please log in.' })
  }

  if (req.method !== 'PATCH') {
    res.setHeader('Allow', ['PATCH'])
    return res.status(405).json({ error: `Method ${req.method} not allowed` })
  }

  const { id } = req.query
  if (!id) {
    return res.status(400).json({ error: 'Invalid ID' })
  }

  try {
    const notification = await prisma.notification.update({
      where: { id }, // string id (cuid) — no parseInt
      data: { isRead: true },
    })
    return res.status(200).json(notification)
  } catch (err) {
    console.error('Mark notification read error:', err)
    return res.status(500).json({ error: 'Something went wrong.' })
  }
}