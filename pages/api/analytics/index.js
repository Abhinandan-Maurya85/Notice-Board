import { prisma } from "../../../lib/prisma"
import { getAuthUser } from "../../../lib/auth"

export default async function handler(req, res) {
  // Ensure GET method
  if (req.method !== 'GET') {
    return res.status(455).json({ error: 'Method not allowed' })
  }

  // Ensure authorized faculty user
  const user = getAuthUser(req)
  if (!user || user.role !== 'FACULTY') {
    return res.status(403).json({ error: 'Forbidden' })
  }

  try {
    const totalNotices = await prisma.notice.count()
    const totalStudents = await prisma.user.count({
      where: { role: 'STUDENT' }
    })

    const urgentNotices = await prisma.notice.count({
      where: { priority: 'Urgent' }
    })

    const categoryExam = await prisma.notice.count({
      where: { category: 'Exam' }
    })
    const categoryEvent = await prisma.notice.count({
      where: { category: 'Event' }
    })
    const categoryGeneral = await prisma.notice.count({
      where: { category: 'General' }
    })

    // Get notices posted in the last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
    sevenDaysAgo.setHours(0, 0, 0, 0)

    const recentNotices = await prisma.notice.findMany({
      where: {
        createdAt: {
          gte: sevenDaysAgo
        }
      },
      select: {
        createdAt: true
      }
    })

    // Map counts to the last 7 days of the week
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const dailyCounts = {}
    
    for (let i = 0; i < 7; i++) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dayLabel = dayNames[d.getDay()]
      dailyCounts[dayLabel] = 0
    }

    recentNotices.forEach(notice => {
      const dayLabel = dayNames[new Date(notice.createdAt).getDay()]
      if (dailyCounts[dayLabel] !== undefined) {
        dailyCounts[dayLabel]++
      }
    })

    // Order chronological (e.g. from 6 days ago up to today)
    const activityData = Object.keys(dailyCounts).reverse().map(day => ({
      day,
      count: dailyCounts[day]
    }))

    // Get recent activity list
    const recentNoticesList = await prisma.notice.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        category: true,
        priority: true,
        createdAt: true
      }
    })

    const recentStudentsList = await prisma.user.findMany({
      take: 5,
      where: { role: 'STUDENT' },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true
      }
    })

    return res.status(200).json({
      totalNotices,
      totalStudents,
      urgentNotices,
      categoryBreakdown: [
        { name: 'Exam', count: categoryExam, color: '#ef4444' },
        { name: 'Event', count: categoryEvent, color: '#3b82f6' },
        { name: 'General', count: categoryGeneral, color: '#8b5cf6' }
      ],
      activityData,
      recentNotices: recentNoticesList,
      recentStudents: recentStudentsList
    })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}
