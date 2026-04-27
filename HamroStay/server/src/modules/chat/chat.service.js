// server/src/modules/chat/chat.service.js
const { groq, SYSTEM_PROMPT } = require("../../config/groq");
const { prisma } = require("../../config/db");

const sendMessage = async (userId, { message, sessionId }) => {
  // Get or create chat session
  let session;
  if (sessionId) {
    session = await prisma.chatSession.findUnique({ where: { id: sessionId } });
    if (!session || session.userId !== userId)
      throw Object.assign(new Error("Session not found."), { status: 404 });
  } else {
    session = await prisma.chatSession.create({
      data: { userId, title: message.slice(0, 50) },
    });
  }

  // Get conversation history (last 10 messages for context window)
  const history = await prisma.chatMessage.findMany({
    where: { sessionId: session.id },
    orderBy: { createdAt: "asc" },
    take: 20,
    select: { role: true, content: true },
  });

  const messages = [
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content: message },
  ];

  // Call Groq API
  const completion = await groq.chat.completions.create({
    model: process.env.GROQ_MODEL || "llama3-8b-8192",
    messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
    max_tokens: 800,
    temperature: 0.7,
    stream: false,
  });

  const assistantMessage = completion.choices[0]?.message?.content || "I apologize, I couldn't process your request.";
  const tokens = completion.usage?.total_tokens;

  // Save both messages to DB
  await prisma.chatMessage.createMany({
    data: [
      { sessionId: session.id, role: "user", content: message },
      { sessionId: session.id, role: "assistant", content: assistantMessage, tokens },
    ],
  });

  // Update session timestamp
  await prisma.chatSession.update({ where: { id: session.id }, data: { updatedAt: new Date() } });

  return { sessionId: session.id, message: assistantMessage, tokens };
};

const getSessions = async (userId) => {
  return prisma.chatSession.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    include: {
      _count: { select: { messages: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1, select: { content: true } },
    },
  });
};

const getSessionMessages = async (sessionId, userId) => {
  const session = await prisma.chatSession.findUnique({ where: { id: sessionId } });
  if (!session || session.userId !== userId)
    throw Object.assign(new Error("Session not found."), { status: 404 });

  return prisma.chatMessage.findMany({
    where: { sessionId },
    orderBy: { createdAt: "asc" },
  });
};

const deleteSession = async (sessionId, userId) => {
  const session = await prisma.chatSession.findUnique({ where: { id: sessionId } });
  if (!session || session.userId !== userId)
    throw Object.assign(new Error("Session not found."), { status: 404 });
  await prisma.chatSession.delete({ where: { id: sessionId } });
};

module.exports = { sendMessage, getSessions, getSessionMessages, deleteSession };
