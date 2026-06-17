import { prisma } from "../../../lib/prisma";

export default async function handler(req, res) {
  const { message } = req.body;

  const msg = message.toLowerCase();

  if (msg.includes("notice")) {
    const notices = await prisma.notice.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    });

    return res.status(200).json({
      reply: notices.map((n) => n.title).join(", "),
    });
  }

  return res.status(200).json({
    reply: `You asked: ${message}`,
  });
}