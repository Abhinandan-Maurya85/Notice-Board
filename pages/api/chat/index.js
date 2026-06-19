import { prisma } from "../../../lib/prisma";

export default async function handler(req, res) {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        reply: "Please enter a message.",
      });
    }

    const msg = message.toLowerCase();

    // Hello
    if (msg.includes("hello") || msg.includes("hi")) {
      return res.status(200).json({
        reply: "👋 Hello! Welcome to the University Notice Board Portal. How can I help you?",
      });
    }

    // University Info
    if (msg.includes("university")) {
      return res.status(200).json({
        reply: "🎓 This is the University Notice Board Portal where students and faculty can view important notices.",
      });
    }

    // Contact Info
    if (msg.includes("contact")) {
      return res.status(200).json({
        reply: "📞 Contact us at: info@university.edu",
      });
    }

    // Total Notices
    if (msg.includes("count") || msg.includes("total notices")) {
      const total = await prisma.notice.count();

      return res.status(200).json({
        reply: `📊 Total notices available: ${total}`,
      });
    }

    // Internship Notices
    if (msg.includes("internship")) {
      const notices = await prisma.notice.findMany({
        orderBy: {
          createdAt: "desc",
        },
      });

      return res.status(200).json({
        reply:
          notices.length > 0
            ? notices.map((n) => `💼 ${n.title}`).join("\n")
            : "No internship notices found.",
      });
    }

    // Exam Notices
    if (msg.includes("exam")) {
      const notices = await prisma.notice.findMany({
        where: {
          category: "Exam",
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return res.status(200).json({
        reply:
          notices.length > 0
            ? notices.map((n) => `📝 ${n.title}`).join("\n")
            : "No exam notices found.",
      });
    }

    // Latest Notices
    if (msg.includes("latest") || msg.includes("notice")) {
      const notices = await prisma.notice.findMany({
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      });

      return res.status(200).json({
        reply:
          notices.length > 0
            ? notices.map((n) => `📌 ${n.title}`).join("\n")
            : "No notices found.",
      });
    }

    // Default Reply
    return res.status(200).json({
      reply:
        "🤖 I can help with:\n\n• latest notices\n• exam notices\n• internship notices\n• total notices\n• contact\n• university\n• hello",
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      reply: "Something went wrong.",
    });
  }
}