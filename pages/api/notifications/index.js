import { prisma } from "../../../lib/prisma";

export default async function handler(req, res) {
  try {
    const notifications = await prisma.notification.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json(notifications);
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
}