import { prisma } from '../../lib/prisma'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const [notices, students, faculty] = await Promise.all([
      prisma.notice.count(),
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.user.count({ where: { role: 'FACULTY' } }),
    ])

    return res.status(200).json({ notices, students, faculty })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}