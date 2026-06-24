import { Server } from 'socket.io'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  // ... your existing auth + validation logic ...

  // Save notice
  const notice = await prisma.notice.create({ data: { ...req.body } })

  // Create notifications for all students
  const students = await prisma.user.findMany({ where: { role: 'STUDENT' } })

  await prisma.notification.createMany({
    data: students.map(s => ({
      userId: s.id,
      noticeId: notice.id,
      isRead: false,
    }))
  })

  //  Emit real-time event to all students
  const io = res.socket.server.io
  if (io) {
    students.forEach(student => {
      io.to(`user_${student.id}`).emit('new_notification', {
        message: `New notice: ${notice.title}`,
        noticeId: notice.id,
        priority: notice.priority,
      })
    })
  }

  return res.status(201).json(notice)
}