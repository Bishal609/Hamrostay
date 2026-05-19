# HamroBot - Self-Trained AI Concierge

## Overview

HamroBot is an intelligent AI concierge chatbot for HamroStay Luxury Hotels, powered by **Groq LLM (LLaMA 3)** and trained with comprehensive hotel knowledge.

## Architecture

### Backend Stack
- **LLM Engine**: Groq (llama3-8b-8192)
- **Training Data**: Self-trained knowledge base in `chatbotTraining.js`
- **Database**: Prisma + Database
- **Framework**: Node.js/Express

### Frontend Stack
- **UI Framework**: React + Tailwind CSS
- **State Management**: TanStack Query
- **Icons**: Lucide React
- **Component**: ChatWidget (floating chat interface)

## Self-Training Data

The chatbot is trained on comprehensive HamroStay knowledge base:

### 1. **Room Information** (`chatbotTraining.js`)
```javascript
- Deluxe Room (1-2 guests): NPR 8,000-12,000
- Executive Suite (2-4 guests): NPR 15,000-22,000
- Royal Penthouse (3-6 guests): NPR 35,000-50,000
```

### 2. **Hotel Amenities**
- 24/7 Concierge Service
- Fine Dining Restaurant
- Rooftop Bar & Lounge
- Spa & Wellness Center
- Fitness Center & Swimming Pool
- Business Center & Valet Parking

### 3. **Policies & Operations**
- Check-in: 2:00 PM | Check-out: 12:00 PM
- Early Check-in/Late Checkout: NPR 2,000 (subject to availability)
- Cancellation: Free up to 48 hours before arrival
- Pets: Allowed with NPR 1,500 cleaning fee
- Smoking: Only in designated outdoor areas
- Tax: 13% VAT on all bookings

### 4. **Local Knowledge**
- **Temples**: Pashupatinath, Boudhanath Stupa, Swayambhunath, Durbar Square
- **Activities**: Helicopter tours, yoga, cooking classes, trekking, paragliding
- **Distance**: Airport ~20 mins away (TIA)

### 5. **Special Services**
- Honeymoon: Complimentary upgrade, champagne, couples massage
- Birthday: Decorations, cake delivery, special dinner
- Corporate: Conference halls for 500+ guests
- Meetings: Business packages with WiFi & AV facilities

## Key Files

### Backend

**1. [server/src/utils/chatbotTraining.js](server/src/utils/chatbotTraining.js)** - Training Data
- Comprehensive knowledge base
- Hotel info, amenities, policies
- Local attractions, special services
- FAQs and booking tips

**2. [server/src/config/groq.js](server/src/config/groq.js)** - LLM Configuration
- Groq API setup
- System prompt configuration
- Integrates training data

**3. [server/src/modules/chat/chat.service.js](server/src/modules/chat/chat.service.js)** - Chat Logic
- `buildContextualPrompt()`: Fetches real hotel data from database
- `sendMessage()`: Processes user queries with context
- Conversation history management
- Database persistence

### Frontend

**[client/src/components/chat/ChatWidget.jsx](client/src/components/chat/ChatWidget.jsx)** - Chat Interface
- Floating chat widget
- Quick suggestion buttons
- Real-time message streaming
- Session management

**[client/src/api/chatApi.js](client/src/api/chatApi.js)** - API Client
- `sendMessage()`: Send user message
- `getSessions()`: Fetch chat history
- `getSessionMessages()`: Retrieve specific session
- `deleteSession()`: Clear chat history

## How the Chatbot Works

### Message Flow

```
User Input
    ↓
ChatWidget Component
    ↓
chatApi.sendMessage()
    ↓
Backend: /chat/message endpoint
    ↓
chat.service.js: sendMessage()
    ├─ Create/fetch chat session
    ├─ Retrieve conversation history
    ├─ Build contextual prompt with training data
    ├─ Fetch real room data from database
    └─ Call Groq LLM API
    ↓
Groq LLaMA 3 Model
    ├─ System Prompt (with training data)
    ├─ Conversation History
    └─ User Message
    ↓
AI Response
    ↓
Save to Database
    ↓
Return to Frontend
    ↓
Update Chat UI
```

### Context Injection

The chatbot receives enriched context on every message:

```javascript
// System Prompt Structure:
{
  role: "system",
  content: SYSTEM_CONTEXT + 
           TRAINING_DATA + 
           CURRENT_AVAILABLE_ROOMS +
           HOTEL_POLICIES +
           LOCAL_ATTRACTIONS
}
```

## Quick Suggestion Features

The ChatWidget includes 4 quick suggestion buttons:

1. **🛏️ Room types & pricing** - Room information and costs
2. **📅 Book a room** - Booking inquiries and offers
3. **🌟 Special services** - Honeymoon, events, packages
4. **🗺️ Local attractions** - Nearby temples, activities

## API Endpoints

### Chat Endpoints

**POST /chat/message**
```json
Request: { "message": "What rooms do you have?", "sessionId": "xxx" }
Response: { "sessionId": "xxx", "message": "AI response...", "tokens": 256 }
```

**GET /chat/sessions**
```json
Response: [
  { "id": "xxx", "title": "Room inquiry", "updatedAt": "2024-01-01", "_count": { "messages": 5 } }
]
```

**GET /chat/sessions/:sessionId/messages**
```json
Response: [
  { "role": "user", "content": "Tell me about rooms" },
  { "role": "assistant", "content": "We have..." }
]
```

**DELETE /chat/sessions/:sessionId**
- Deletes entire chat session

## Training Enhancement Tips

To improve the chatbot further:

### 1. Add More Training Data
Update `chatbotTraining.js` with:
- Seasonal packages and promotions
- Staff information and expertise
- Payment methods and currency info
- Dietary restrictions and meal info

### 2. Dynamic Context
```javascript
// In chat.service.js, add:
const bookings = await prisma.booking.findMany(); // Real occupancy
const events = await prisma.event.findMany(); // Upcoming events
// Include in context for better responses
```

### 3. Conversation Memory
- Currently stores 20 previous messages
- Adjust `take: 20` in `getSessionMessages()` for longer memory
- Reduces context window but improves continuity

### 4. Fine-Tuning Responses
```javascript
// Adjust in groq.js:
temperature: 0.7,    // 0 = deterministic, 1 = creative
max_tokens: 1024,    // Increase for longer responses
```

## Environment Variables

Required in `.env`:
```
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama3-8b-8192  # Optional, defaults shown
DATABASE_URL=your_prisma_database_url
```

## Performance Metrics

- **Response Time**: ~2-5 seconds per message
- **Token Usage**: ~200-300 tokens per response
- **Context Window**: ~4,096 tokens
- **Max Response Length**: 1,024 tokens

## Troubleshooting

### Chatbot gives generic responses
→ Check `chatbotTraining.js` data completeness
→ Verify Groq API key is valid
→ Increase context in system prompt

### Slow responses
→ Reduce `take: 20` in conversation history
→ Decrease `max_tokens` from 1024
→ Check Groq API rate limits

### Empty messages from database
→ Verify room data exists in Prisma database
→ Check database connection string
→ Review error logs in `chat.service.js`

## Future Enhancements

- [ ] Integration with booking system for real-time availability
- [ ] Multi-language support (Nepali, English, Chinese)
- [ ] Sentiment analysis for issue escalation
- [ ] Analytics dashboard for chatbot usage
- [ ] Scheduled training data updates
- [ ] Voice input/output support
- [ ] Integration with payment gateway
- [ ] Custom business rule engine

---

**Powered by**: Groq LLM (LLaMA 3) | **Framework**: Node.js/React | **Database**: Prisma
