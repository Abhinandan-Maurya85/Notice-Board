import { prisma } from "../../../lib/prisma"
import { getAuthUser } from "../../../lib/auth"

export default async function handler(req, res) {
  const user = getAuthUser(req)
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const notifications = await prisma.notification.findMany({
      where: {
        userId: user.id,   // ✅ only fetch THIS user's notifications
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return res.status(200).json(notifications)
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}