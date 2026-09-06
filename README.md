# AI SupportHub — Enterprise AI-Powered Customer Support SaaS Platform

> **AI SupportHub** is a standalone multi-tenant AI customer support SaaS platform built with the MERN stack (MongoDB, Express, React, Node.js), Socket.io real-time chat, and Retrieval-Augmented Generation (RAG) powered by Gemini and OpenAI.

---

## 1. Project Overview

AI SupportHub allows businesses to deploy an intelligent, zero-hallucination customer support copilot trained exclusively on their private knowledge base. When customer queries require payment investigation, account modifications, or human touch, conversations seamlessly escalate into support tickets with live Socket.io messaging between human agents and customers.

The system features a pre-configured demo organization: **SkillUp Academy** (online programming & technology courses provider).

---

## 2. Key Features

- **Multi-Tenant Isolation**: Strict organization-level scoping across all database models, APIs, and file uploads.
- **RAG Knowledge Base**: Upload PDF, DOCX, TXT, or create manual FAQs. Automatically parsed, chunked, and vector-embedded for sub-second semantic retrieval.
- **Zero Hallucination AI Guardrails**: Strict system prompts guarantee the AI never hallucinates pricing, discounts, guarantees, or policies outside the organization's verified knowledge.
- **AI Ticket Classification**: Automatically determines ticket **Category** (*Billing, Technical, Account, Course/Product, Refund, General*) and **Priority** (*Low, Medium, High, Urgent*).
- **AI Conversation Summarizer**: Generates executive summaries, key context bullet points, customer problem definitions, and recommended next actions for agents.
- **AI Copilot Reply Suggester**: Drafts professional replies for human agents to review and edit before sending.
- **Real-Time Live Chat**: Bidirectional Socket.io communication with typing indicators, online presence tracking, and message persistence.
- **Role-Based Access Control (RBAC)**: Dedicated interfaces and route protection for `ADMIN`, `AGENT`, and `CUSTOMER`.

---

## 3. Tech Stack

- **Frontend**: React 18, Vite, React Router 6, Tailwind CSS, Lucide Icons, Axios, Socket.io-client, Context API.
- **Backend**: Node.js, Express.js (ES Modules), MongoDB & Mongoose, Socket.io, JWT, bcryptjs, Multer, Helmet, CORS, Rate Limiting.
- **AI Layer**: Provider abstraction supporting **Google Gemini** (`gemini-1.5-flash`, `text-embedding-004`), **OpenAI** (`gpt-4o-mini`, `text-embedding-3-small`), and resilient smart local fallback vector search.
- **Storage**: Cloudinary remote asset storage with automatic fallback to local disk storage.

---

## 4. Architecture & Folder Structure

```
AI-SupportHub/
├── client/
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/       # Navbar, Sidebar, Modal, Badge, Button, Input, StatCard, LoadingSpinner
│   │   │   ├── chat/         # ChatWindow, MessageList, MessageInput, EscalationModal, TypingIndicator
│   │   │   ├── tickets/      # TicketList, TicketDetailModal, TicketStatusBadge, PriorityBadge, CreateTicketModal
│   │   │   ├── knowledge/    # KnowledgeList, AddKnowledgeModal, DocumentUploadModal, FAQViewer
│   │   │   └── dashboard/    # ActivityFeed, CategoryChart
│   │   ├── pages/
│   │   │   ├── auth/         # Login.jsx, Register.jsx
│   │   │   ├── customer/     # CustomerDashboard.jsx, Chat.jsx, Conversations.jsx, Tickets.jsx, Profile.jsx
│   │   │   ├── agent/        # AgentDashboard.jsx, AgentTickets.jsx, AgentConversation.jsx
│   │   │   ├── admin/        # AdminDashboard.jsx, KnowledgeBase.jsx, Agents.jsx, Customers.jsx, Tickets.jsx, Conversations.jsx, Settings.jsx
│   │   │   └── LandingPage.jsx
│   │   ├── layouts/          # AdminLayout.jsx, AgentLayout.jsx, CustomerLayout.jsx
│   │   ├── context/          # AuthContext.jsx, ToastContext.jsx
│   │   ├── hooks/            # useAuth.js, useSocket.js
│   │   ├── services/         # api.js, auth.service.js, chat.service.js, ticket.service.js, knowledge.service.js
│   │   ├── routes/           # AppRoutes.jsx
│   │   ├── utils/            # constants.js, formatters.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
│
├── server/
│   ├── src/
│   │   ├── config/           # db.js, cloudinary.js
│   │   ├── models/           # User.js, Organization.js, Conversation.js, Message.js, Ticket.js, KnowledgeDocument.js, KnowledgeChunk.js, Notification.js
│   │   ├── controllers/      # auth, user, organization, chat, ticket, knowledge, admin controllers
│   │   ├── routes/           # auth, user, organization, chat, ticket, knowledge, admin routes
│   │   ├── middleware/       # auth.middleware.js, role.middleware.js, error.middleware.js, upload.middleware.js
│   │   ├── validators/       # auth.validator.js, ticket.validator.js, knowledge.validator.js
│   │   ├── services/
│   │   │   ├── ai/           # aiProvider.js, gemini.provider.js, openai.provider.js, promptBuilder.js, responseGenerator.js, ticketClassifier.js, summarizer.js, replySuggester.js
│   │   │   ├── knowledge/    # documentParser.js, textChunker.js, embeddingService.js, retrievalService.js
│   │   │   ├── conversation.service.js
│   │   │   └── ticket.service.js
│   │   ├── socket/           # socket.js, chat.socket.js
│   │   ├── utils/            # ApiError.js, logger.js, generateToken.js
│   │   ├── seed/             # seedDemoData.js
│   │   ├── app.js
│   │   └── server.js
│   ├── .env.example
│   ├── .env
│   └── package.json
│
├── .gitignore
├── README.md
└── package.json
```

---

## 5. Database Schema Architecture

- **User**: Name, unique Email, passwordHash, role (`ADMIN`, `AGENT`, `CUSTOMER`), organizationId, avatar, status (`active`, `inactive`, `suspended`), isOnline.
- **Organization**: Name, slug (`skillup-academy`), description, settings (supportEmail, businessHours, aiModel, aiTemperature, autoEscalateOnNegativeSentiment).
- **KnowledgeDocument**: OrganizationId, title, category, fileUrl, fileType (`text`, `faq`, `pdf`, `docx`), processingStatus, chunkCount, rawContent, tags.
- **KnowledgeChunk**: OrganizationId, documentId, content, embedding vector (128 - 1536 dim array), chunk metadata.
- **Conversation**: OrganizationId, customerId, assignedAgentId, title, status (`active`, `waiting_human`, `agent_active`, `resolved`, `closed`), mode (`ai`, `human`), ticketId, summary.
- **Message**: OrganizationId, conversationId, senderId, senderType (`customer`, `agent`, `ai`, `system`), content, metadata (sourcesUsed, confidenceScore, retrievedChunkIds).
- **Ticket**: OrganizationId, customerId, assignedAgentId, conversationId, ticketNumber (`TICK-XXXXXX`), title, description, category, priority, status, aiSummary (`shortSummary`, `keyDetails`, `customerProblem`, `suggestedAction`), internalNotes.

---

## 6. RAG Ingestion & Semantic Retrieval Pipeline

```
Admin Uploads Document (PDF / DOCX / FAQ)
                  │
                  ▼
         Text Extraction (mammoth / pdf-parse)
                  │
                  ▼
         Semantic Chunking (sliding window: 350 words, 50 overlap)
                  │
                  ▼
         Vector Embedding Generation (Gemini / OpenAI / Fallback)
                  │
                  ▼
         Stored in MongoDB KnowledgeChunk collection
                  │
[ Customer asks: "Can I get a refund after 20 days?" ]
                  │
                  ▼
         Generate Query Vector Embedding
                  │
                  ▼
         Cosine Similarity + Keyword Hybrid Retrieval (Scoped to Org)
                  │
                  ▼
         Grounding Prompt Builder (Strict anti-hallucination constraints)
                  │
                  ▼
         AI Generates Answer: "According to SkillUp Academy's refund policy, refunds are available within 7 days..."
```

---

## 7. Socket.io Real-Time Event Architecture

- **Authentication**: JWT token handshake check.
- **Rooms**:
  - `org:<organizationId>`: Organization-level broadcasts for new tickets & escalations.
  - `conversation:<conversationId>`: Room for real-time customer and agent chat exchanges.
- **Events**:
  - `join_conversation` / `leave_conversation`
  - `typing_start` / `typing_stop`
  - `send_message` / `new_message`
  - `conversation_escalated`
  - `agent_joined`

---

## 8. Environment Variables

Create `server/.env` based on `server/.env.example`:

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

MONGODB_URI=mongodb://localhost:27017/ai_supporthub
JWT_SECRET=ai_supporthub_super_secret_jwt_key_2025_change_in_production
JWT_EXPIRES_IN=7d

AI_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=your_openai_api_key_here

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

---

## 9. Installation & Setup Instructions

### Step 1: Install Dependencies

```bash
# Install root, server, and client dependencies concurrently
npm run install:all
```

Or install individually:

```bash
cd server && npm install
cd ../client && npm install
```

### Step 2: Seed Demo Database

```bash
npm run seed
```

This will automatically create:
- Organization: **SkillUp Academy**
- Pre-indexed RAG Knowledge base (MERN, Java, Python, DSA courses, 7-day refund policy, FAQs, troubleshooting guides)
- Admin, Agent, and Customer accounts
- Sample support tickets & conversation threads

### Step 3: Run the Application

```bash
# Run both Backend API (port 5000) and Frontend Vite Server (port 5173) together:
npm run dev
```

Frontend URL: `http://localhost:5173`
Backend URL: `http://localhost:5000`

---

## 10. Development & Demo Credentials

| Role | Email | Password | Access Portal |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@skillupacademy.dev` | `SkillUpAdmin123!` | `/admin/dashboard` |
| **AGENT** | `agent@skillupacademy.dev` | `SkillUpAgent123!` | `/agent/dashboard` |
| **CUSTOMER** | `customer@skillupacademy.dev` | `SkillUpCustomer123!` | `/customer/dashboard` |

*(Note: On the login page and landing page, 1-click demo login buttons automatically fill these credentials for effortless testing).*

---

## 11. End-to-End Testing Checklist

1. **Admin Knowledge Ingestion**:
   - Log in as `admin@skillupacademy.dev`.
   - Go to **Knowledge Base** (`/admin/knowledge`).
   - Use the **RAG Semantic Retrieval Sandbox** to test queries like *"Can I get a refund after 5 days?"* and view retrieved matching chunks.
2. **Customer Interaction with AI**:
   - Log in as `customer@skillupacademy.dev`.
   - Go to **AI Chat Assistant** (`/chat`).
   - Ask: *"How much does the MERN Stack course cost?"* -> AI answers: *"₹4,999"*.
   - Ask: *"Can I get a refund after 20 days?"* -> AI answers: *"According to SkillUp Academy's refund policy, refunds are only available within 7 days... I do not have information indicating 20 days is supported."*
3. **Escalation Flow**:
   - In chat, click **Request Human** or ask: *"I paid via UPI but my course is locked, I want to talk to an agent."*
   - AI detects account investigation / human request, creates support ticket `#TICK-XXXXXX`, and switches mode to human queue.
4. **Agent Takeover & AI Copilot**:
   - Log in as `agent@skillupacademy.dev`.
   - On the **Agent Dashboard** (`/agent/dashboard`), view the escalated chat in the waiting queue.
   - Open **Live Conversations** (`/agent/conversations`) and click **Take Over Conversation**.
   - Click **Generate AI Summary** to view structured incident context.
   - Click **Generate AI Reply** in ticket modal to draft a contextual response.
   - Send live reply -> verify customer receives it instantly over Socket.io.
   - Mark ticket as **Resolved**.

---

## 12. Known Limitations & Fallbacks

- **Zero-Crash Local Fallback**: If no `GEMINI_API_KEY` or `OPENAI_API_KEY` is provided, the application switches to an offline term-frequency semantic matcher and rule-based completion engine, allowing full portfolio demonstrations without paid API keys.
- **Local File Upload Fallback**: If Cloudinary credentials are omitted, uploaded documents are safely processed and stored in the local server `uploads/` directory.

---

## 13. Future Improvements

- Multi-channel ingestion (WhatsApp / Slack / Email webhook connectors).
- Voice support with speech-to-text and text-to-speech audio streaming.
- Automated CSAT customer satisfaction survey ratings upon ticket resolution.
- Live co-browsing and screen-sharing integration for technical support agents.
