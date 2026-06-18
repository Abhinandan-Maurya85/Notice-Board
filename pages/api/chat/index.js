// Gemini AI
try {
  const aiReply = await askGemini(message);

  return res.status(200).json({
    reply: aiReply,
  });
} catch (error) {
  console.log("Gemini Error:", error.message);

  return res.status(200).json({
    reply:
      "🤖 AI Assistant is currently unavailable. Please ask about notices, exams, events, or urgent notices.",
  });
}