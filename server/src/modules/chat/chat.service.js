// server/src/modules/chat/chat.service.js
const { groq, SYSTEM_PROMPT } = require("../../config/groq");
const { prisma } = require("../../config/db");
const {
  ROOM_TYPES,
  HOTEL_AMENITIES,
  POLICIES,
  LOCAL_ATTRACTIONS,
  SPECIAL_SERVICES,
  FAQs,
} = require("../../utils/chatbotTraining");

/**
 * Build enhanced context from real database and training data
 */
const buildContextualPrompt = async (userMessage) => {
  try {
    // Fetch real hotel data from database
    const rooms = await prisma.room.findMany({
      take: 5,
      select: { name: true, description: true, pricePerNight: true, amenities: true, capacity: true, bedType: true },
    });

    const roomInfo = rooms.length ? `\nCURRENT AVAILABLE ROOMS:\n${rooms.map(r => `- ${r.name} (${r.capacity} guests, ${r.bedType}): NPR ${r.pricePerNight}/night - ${r.description}`).join("\n")}` : "";

    // Build context message with training data
    const trainingContext = `
TRAINING DATA - HOTEL INFORMATION:

ROOM TYPES & PRICING:
${Object.values(ROOM_TYPES).map(r => `- ${r.name} (${r.capacity}): ${r.price_range} - ${r.amenities.join(", ")}`).join("\n")}

AMENITIES:
${HOTEL_AMENITIES.join(", ")}

KEY POLICIES:
- Check-in: ${POLICIES.checkin} | Check-out: ${POLICIES.checkout}
- Early Check-in: ${POLICIES.early_checkin}
- Late Checkout: ${POLICIES.late_checkout}
- Cancellation: ${POLICIES.cancellation}
- Pets: ${POLICIES.pets}
- Smoking: ${POLICIES.smoking}
- Tax: 13% VAT on all bookings

NEARBY ATTRACTIONS:
Temples: ${LOCAL_ATTRACTIONS.temples.join(", ")}
Activities: ${LOCAL_ATTRACTIONS.activities.join(", ")}

SPECIAL SERVICES:
- Honeymoon: ${SPECIAL_SERVICES.honeymoon}
- Birthday: ${SPECIAL_SERVICES.birthday}
- Events & Meetings: ${SPECIAL_SERVICES.events}

COMMON FAQs:
${FAQs.map(f => `Q: ${f.q}\nA: ${f.a}`).join("\n\n")}
${roomInfo}
`;

    return trainingContext;
  } catch (error) {
    console.log("Error building context:", error.message);
    return "";
  }
};

const sendMessage = async (userId, { message, sessionId }) => {
  try {
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

    // Get conversation history
    const history = await prisma.chatMessage.findMany({
      where: { sessionId: session.id },
      orderBy: { createdAt: "asc" },
      take: 20,
      select: { role: true, content: true },
    });

    // Build contextual training data
    const contextualTraining = await buildContextualPrompt(message);

    const messages = [
      ...history.map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: message },
    ];

    // Call Groq API with enhanced context
    let completion;
    try {
      completion = await groq.chat.completions.create({
        model: process.env.GROQ_MODEL || "llama3-8b-8192",
        messages: [
          { role: "system", content: SYSTEM_PROMPT + "\n\n" + contextualTraining },
          ...messages,
        ],
        max_tokens: 1024,
        temperature: 0.7,
        stream: false,
      });
    } catch (groqError) {
      console.error("Groq API Error:", groqError.message);
      console.error("GROQ_API_KEY exists:", !!process.env.GROQ_API_KEY);
      throw new Error(`Groq API Error: ${groqError.message}`);
    }

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
  } catch (error) {
    console.error("Chat Service Error:", error);
    throw error;
  }
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
