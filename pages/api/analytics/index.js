import { prisma } from "../../../lib/prisma"
import { getAuthUser } from "../../../lib/auth"

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const user = getAuthUser(req)
  if (!user || (user.role !== "FACULTY" && user.role !== "ADMIN")) {
    return res.status(403).json({ error: "Forbidden" })
  }

  try {
    const [totalNotices, totalStudents, urgentNotices, totalBookmarks] =
      await Promise.all([
        prisma.notice.count(),
        prisma.user.count({ where: { role: "STUDENT" } }),
        prisma.notice.count({ where: { priority: "URGENT" } }),
        prisma.bookmark.count(),
      ])

    const viewAgg = await prisma.noticeView.aggregate({
      _count: { id: true },
    })
    const totalViews = viewAgg._count.id ?? 0

    const uniqueViewers = await prisma.noticeView.groupBy({
      by: ["userId"],
      _count: { userId: true },
    })
    const totalUniqueViewers = uniqueViewers.length

    const noticesWithViews = await prisma.noticeView.groupBy({
      by: ["noticeId"],
      _count: { noticeId: true },
    })
    const readRate =
      totalNotices > 0
        ? Math.round((noticesWithViews.length / totalNotices) * 100)
        : 0

    const avgViewsPerNotice =
      totalNotices > 0 ? +(totalViews / totalNotices).toFixed(1) : 0

    const CATEGORIES = [
      { name: "Exam",     color: "#ef4444" },
      { name: "Event",    color: "#3b82f6" },
      { name: "General",  color: "#8b5cf6" },
      { name: "Academic", color: "#f59e0b" },
      { name: "Sports",   color: "#10b981" },
    ]

    const categoryCountsRaw = await prisma.notice.groupBy({
      by: ["category"],
      _count: { id: true },
    })
    const categoryMap = Object.fromEntries(
      categoryCountsRaw.map((r) => [r.category, r._count.id])
    )

    const categoryBreakdown = CATEGORIES.map(({ name, color }) => ({
      name,
      count: categoryMap[name.toUpperCase()] ?? categoryMap[name] ?? 0,
      color,
    })).filter((c) => c.count > 0)

    const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

    const today = new Date()
    today.setHours(23, 59, 59, 999)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
    sevenDaysAgo.setHours(0, 0, 0, 0)

    const daySlots = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(sevenDaysAgo)
      d.setDate(d.getDate() + i)
      return {
        date: d.toISOString().slice(0, 10),
        label: DAY_LABELS[d.getDay()],
        notices: 0,
        views: 0,
      }
    })

    const dateToSlot = Object.fromEntries(daySlots.map((s, i) => [s.date, i]))

    const recentNoticesRaw = await prisma.notice.findMany({
      where: { createdAt: { gte: sevenDaysAgo, lte: today } },
      select: { createdAt: true },
    })
    recentNoticesRaw.forEach(({ createdAt }) => {
      const key = new Date(createdAt).toISOString().slice(0, 10)
      if (dateToSlot[key] !== undefined) daySlots[dateToSlot[key]].notices++
    })

    const recentViewsRaw = await prisma.noticeView.findMany({
      where: { viewedAt: { gte: sevenDaysAgo, lte: today } },
      select: { viewedAt: true },
    })
    recentViewsRaw.forEach(({ viewedAt }) => {
      const key = new Date(viewedAt).toISOString().slice(0, 10)
      if (dateToSlot[key] !== undefined) daySlots[dateToSlot[key]].views++
    })

    const activityData = daySlots.map(({ label, notices, views }) => ({
      day: label,
      notices,
      views,
    }))

    const topNoticesRaw = await prisma.notice.findMany({
      take: 5,
      orderBy: { viewCount: "desc" },
      select: {
        id: true,
        title: true,
        category: true,
        priority: true,
        viewCount: true,
        createdAt: true,
        _count: { select: { bookmarks: true } },
      },
    })
    const topNotices = topNoticesRaw.map((n) => ({
      id: n.id,
      title: n.title,
      category: n.category,
      priority: n.priority,
      viewCount: n.viewCount,
      bookmarkCount: n._count.bookmarks,
      createdAt: n.createdAt,
    }))

    const recentNotices = await prisma.notice.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        category: true,
        priority: true,
        viewCount: true,
        createdAt: true,
      },
    })

    const recentStudents = await prisma.user.findMany({
      take: 5,
      where: { role: "STUDENT" },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    })

    const priorityCountsRaw = await prisma.notice.groupBy({
      by: ["priority"],
      _count: { id: true },
    })
    const priorityBreakdown = priorityCountsRaw.map((r) => ({
      name: r.priority,
      count: r._count.id,
    }))

    return res.status(200).json({
      totalNotices,
      totalStudents,
      urgentNotices,
      totalViews,
      totalBookmarks,
      totalUniqueViewers,
      readRate,
      avgViewsPerNotice,
      categoryBreakdown,
      priorityBreakdown,
      activityData,
      topNotices,
      recentNotices,
      recentStudents,
    })
  } catch (error) {
    console.error("[analytics]", error)
    return res.status(500).json({ error: error.message })
  }
}