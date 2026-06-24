export default async function handler(req, res) {
 const { userId } = req.body  // or from JWT

 await prisma.notification.updateMany({
   where: { userId, isRead: false },
   data: { isRead: true }
 })

 return res.status(200).json({ success: true })
}

