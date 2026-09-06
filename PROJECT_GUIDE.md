# AI SupportHub — Complete Master Project Guide & Architectural Reference

> **Welcome to the AI SupportHub Developer & Interview Guide!**  
> This guide is designed to give you a complete, crystal-clear understanding of the entire codebase, its architecture, end-to-end data flows, AI pipeline, and real-time support escalation mechanisms so you can confidently explain, run, and defend this project in any technical interview.

---

# SECTION A — PROJECT OVERVIEW

### 1. What is AI SupportHub?
**AI SupportHub** is a multi-tenant, AI-powered customer support and ticketing platform built with the **MERN** stack (MongoDB, Express.js, React, Node.js), **Socket.io** real-time messaging, and **Retrieval-Augmented Generation (RAG)** AI integration (Gemini / OpenAI).

### 2. What Problem Does It Solve?
Traditional customer support systems have two extremes:
1. **Inefficient manual queues**: Human support agents are overwhelmed by repetitive, common questions (e.g., refund policies, pricing, course curriculum, account hours).
2. **Frustrating, disconnected chatbots**: Generic chatbots that hallucinate fake information, have no knowledge of company policies, and cannot seamlessly transfer context to a human agent when stuck.

**AI SupportHub solves this problem by creating an intelligent, continuous support pipeline:**
- Customers chat with an **AI Support Assistant** that is strictly grounded in the organization's verified **Knowledge Base**.
- The AI solves routine questions instantly and automatically marks issues as **`RESOLVED`** when the customer confirms satisfaction.
- If the customer asks for a human or the issue requires account investigation, the session automatically transitions to **`HUMAN_REQUIRED`**. A human agent takes over the live chat, inspects the AI summary, chats in real time, and manually resolves the ticket.

### 3. User Roles & Permissions
The system enforces strict Role-Based Access Control (**RBAC**) across 4 roles:

| Role | Who They Are | What They Can Do |
| :--- | :--- | :--- |
| **`CUSTOMER`** | End-users / Students seeking support | Start new chat sessions, chat with AI, request human support, view conversation history, update profile. |
| **`AGENT`** | Dedicated customer support staff | View active escalation queues, take over live chats from AI, search company knowledge base, chat in real time, write internal notes, and resolve tickets. |
| **`ADMIN`** | Company team managers & operations | View company analytics, manage knowledge base articles and document uploads, inspect tickets & conversations, invite agents. |
| **`OWNER`** | Founder / Creator of the organization | Everything an Admin can do, plus manage company join keys, approve admin requests, and update organization settings. |

---

# SECTION B — TECHNOLOGIES USED

| Technology | Where Used | Why Used in This Project |
| :--- | :--- | :--- |
| **React 18** | Frontend (SPA) | Component-based UI, reactive state management with hooks, fast DOM rendering for real-time chat. |
| **Vite** | Frontend Build Tool | Blazing-fast development server, instant Hot Module Replacement (HMR), optimized production bundling. |
| **Tailwind CSS** | Styling | Modern, responsive, dark-mode glassmorphic aesthetics with utility-first CSS. |
| **Lucide React** | Frontend Icons | Lightweight, consistent, modern vector icon set. |
| **React Router Dom (v6)** | Frontend Routing | Client-side routing, protected layouts for Customer, Agent, and Admin roles. |
| **Axios** | HTTP Client | Promise-based HTTP requests with automatic authorization token interceptors. |
| **Node.js** | Backend Runtime | Non-blocking, event-driven JavaScript runtime ideal for concurrent chat requests. |
| **Express.js** | Backend Web Framework | REST API routing, middleware chaining, centralized error handling, and file uploads. |
| **MongoDB & Mongoose** | Database & ODM | Flexible JSON-like document store, schema validation, indexing, and object modeling for multi-tenant isolation. |
| **JSON Web Tokens (JWT)** | Authentication | Stateless authentication transmitting encrypted user ID, role, and organization ID in bearer tokens. |
| **Bcrypt.js** | Security | Secure cryptographic password hashing with unique salt rounds before database persistence. |
| **Socket.io** | Real-Time Engine | Bi-directional WebSocket communication for live messaging, typing indicators, and instant escalation updates. |
| **Google Gemini API** | AI Provider | Large Language Model (`gemini-1.5-flash`) and embeddings (`text-embedding-004`) for RAG knowledge answers. |
| **OpenAI API** | Alternative AI Provider | Large Language Model (`gpt-4o-mini`) and embeddings (`text-embedding-3-small`) configurable via environment variable. |
| **Multer & PDF-Parse** | Document Ingestion | Parses uploaded PDF and DOCX files into raw text for chunking and vector search. |

---

# SECTION C — COMPLETE FOLDER STRUCTURE

```text
ai-support/
├── client/                      # React Frontend Application (Vite)
│   ├── public/                  # Static assets (favicons, logos)
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── chat/            # ChatWindow, MessageList, MessageInput, TypingIndicator, EscalationModal
│   │   │   ├── common/          # Button, Input, Modal, Badge, Navbar, Sidebar, StatCard, LoadingSpinner
│   │   │   ├── dashboard/       # ActivityFeed, CategoryChart
│   │   │   ├── knowledge/       # AddKnowledgeModal, DocumentUploadModal, FAQViewer, KnowledgeList
│   │   │   └── tickets/         # CreateTicketModal, TicketDetailModal, TicketList, TicketStatusBadge, PriorityBadge
│   │   ├── context/             # React Contexts (AuthContext, ToastContext)
│   │   ├── hooks/               # Custom hooks (useAuth, useSocket)
│   │   ├── layouts/             # CustomerLayout, AgentLayout, AdminLayout
│   │   ├── pages/               # Application Pages
│   │   │   ├── admin/           # AdminDashboard, KnowledgeBase, Agents, Customers, Tickets, Conversations, AdminTeam, Settings
│   │   │   ├── agent/           # AgentDashboard, AgentConversation, AgentTickets, AgentKnowledge, AgentInvitations, AgentProfile
│   │   │   ├── auth/            # Login, Register
│   │   │   ├── customer/        # Chat, Conversations, Profile, CustomerDashboard, SupportPortal
│   │   │   └── LandingPage.jsx  # Public SaaS landing page
│   │   ├── routes/              # AppRoutes.jsx (Route definitions & RBAC guards)
│   │   ├── services/            # API Axios wrappers (api.js, auth, chat, ticket, knowledge, agent, admin)
│   │   ├── utils/               # Formatters, constants (roles, ticket statuses)
│   │   ├── App.jsx              # Main App wrapper with Toast & Router providers
│   │   ├── index.css            # Tailwind & glassmorphism theme styling
│   │   └── main.jsx             # React DOM root entry point
│   ├── index.html               # Main HTML template
│   ├── package.json             # Frontend dependencies
│   ├── tailwind.config.js       # Tailwind theme colors and animations
│   └── vite.config.js           # Vite development server & reverse proxy config
│
├── server/                      # Node.js & Express.js Backend API
│   ├── src/
│   │   ├── config/              # Database (db.js) & Cloudinary config
│   │   ├── controllers/         # Request handlers
│   │   │   ├── auth.controller.js            # Register, Login, Admin join, Agent register, getMe
│   │   │   ├── chat.controller.js            # Start session, send message, takeover, resolve, summarize
│   │   │   ├── ticket.controller.js          # CRUD tickets, assign agent, add internal notes
│   │   │   ├── knowledge.controller.js       # Upload docs, text chunking, embedding generation
│   │   │   ├── agent.controller.js           # Global directory, invite agents, accept/decline invites
│   │   │   ├── admin.controller.js           # Analytics metrics, customer lists
│   │   │   └── adminManagement.controller.js # Approve admin requests, company keys
│   │   ├── middleware/          # auth.middleware.js, role.middleware.js, error.middleware.js, upload.middleware.js
│   │   ├── models/              # Mongoose database models
│   │   │   ├── User.js              # User accounts with roles (CUSTOMER, AGENT, ADMIN, OWNER)
│   │   │   ├── Organization.js      # Multi-tenant company workspace with settings & join keys
│   │   │   ├── Conversation.js      # Chat sessions linked 1-to-1 with Tickets
│   │   │   ├── Ticket.js            # Support tickets with status: OPEN, HUMAN_REQUIRED, RESOLVED
│   │   │   ├── Message.js           # Chat messages with senderType (customer, agent, ai, system)
│   │   │   ├── KnowledgeDocument.js # Uploaded or manual knowledge files
│   │   │   ├── KnowledgeChunk.js    # Chunked text with high-dimensional vector embeddings
│   │   │   ├── AgentInvitation.js   # Single-company agent employment invitations
│   │   │   ├── AdminJoinRequest.js  # Key-based admin join requests
│   │   │   └── Notification.js      # In-app real-time notifications
│   │   ├── routes/              # Express route registrations (/api/auth, /api/chat, /api/tickets, etc.)
│   │   ├── seed/                # seedDemoData.js (Populates sample companies, KB, users, and tickets)
│   │   ├── services/            # Core business logic
│   │   │   ├── conversation.service.js # New session creation, message handling, AI resolution, escalation
│   │   │   ├── ticket.service.js       # Ticket status updates & internal notes
│   │   │   ├── ai/                     # AI provider abstraction, prompt builder, fallback generator
│   │   │   └── knowledge/              # Text chunker, embedding generator, hybrid retrieval service
│   │   ├── socket/              # socket.js & chat.socket.js (Socket.io event management)
│   │   ├── utils/               # ApiError, logger, tokenGenerator, keyGenerator
│   │   ├── validators/          # Input schema validators (ticket.validator.js)
│   │   ├── app.js               # Express application initialization & middleware setup
│   │   └── server.js            # HTTP server start & Socket.io attachment
│   ├── .env                     # Local environment configuration
│   ├── .env.example             # Template for required environment variables
│   └── package.json             # Backend dependencies & run scripts
│
└── PROJECT_GUIDE.md             # This comprehensive master documentation
```

---

# SECTION D — FILE-BY-FILE COMPREHENSIVE BREAKDOWN

### 1. Backend Database Models (`server/src/models/`)

| File | Purpose & Responsibilities |
| :--- | :--- |
| [`User.js`](file:///c:/Users/harsh/OneDrive/Desktop/ai-support/server/src/models/User.js) | Defines user accounts with `email`, `passwordHash`, `role` (`CUSTOMER`, `AGENT`, `ADMIN`, `OWNER`), `organizationId`, and password comparison helper (`matchPassword`). |
| [`Organization.js`](file:///c:/Users/harsh/OneDrive/Desktop/ai-support/server/src/models/Organization.js) | Defines company tenant spaces with `name`, `slug`, `ownerId`, `adminJoinKey`, and AI configuration settings. |
| [`Conversation.js`](file:///c:/Users/harsh/OneDrive/Desktop/ai-support/server/src/models/Conversation.js) | Stores chat sessions with `organizationId`, `customerId`, `assignedAgentId`, `status` (`OPEN`, `HUMAN_REQUIRED`, `RESOLVED`), `mode` (`ai`, `human`), and 1-to-1 reference `ticketId`. |
| [`Ticket.js`](file:///c:/Users/harsh/OneDrive/Desktop/ai-support/server/src/models/Ticket.js) | Stores support tickets with unique `ticketNumber` (`TICK-XXXXXX`), `conversationId` (1-to-1 ref), `category`, `priority`, `status` (`OPEN`, `HUMAN_REQUIRED`, `RESOLVED`), `aiSummary`, and internal agent notes. |
| [`Message.js`](file:///c:/Users/harsh/OneDrive/Desktop/ai-support/server/src/models/Message.js) | Stores individual chat utterances with `conversationId`, `senderId`, `senderType` (`customer`, `agent`, `ai`, `system`), `content`, and RAG chunk citations. |
| [`KnowledgeDocument.js`](file:///c:/Users/harsh/OneDrive/Desktop/ai-support/server/src/models/KnowledgeDocument.js) | Stores uploaded PDF/DOCX or text documents with metadata (`title`, `category`, `organizationId`, `chunkCount`). |
| [`KnowledgeChunk.js`](file:///c:/Users/harsh/OneDrive/Desktop/ai-support/server/src/models/KnowledgeChunk.js) | Stores 350-character sliced text chunks with their high-dimensional vector embeddings for cosine similarity retrieval. |
| [`AgentInvitation.js`](file:///c:/Users/harsh/OneDrive/Desktop/ai-support/server/src/models/AgentInvitation.js) | Tracks single-company employment invitations sent by admins to independent agents in the Global Talent Directory. |
| [`AdminJoinRequest.js`](file:///c:/Users/harsh/OneDrive/Desktop/ai-support/server/src/models/AdminJoinRequest.js) | Tracks key-based admin join requests submitted using the company's secret `adminJoinKey`. |
| [`Notification.js`](file:///c:/Users/harsh/OneDrive/Desktop/ai-support/server/src/models/Notification.js) | Stores real-time in-app alerts (invitation received, ticket assigned, escalation alert). |

---

### 2. Backend Controllers (`server/src/controllers/`)

| File | Purpose & Responsibilities |
| :--- | :--- |
| [`auth.controller.js`](file:///c:/Users/harsh/OneDrive/Desktop/ai-support/server/src/controllers/auth.controller.js) | Handles user registration for companies, agents, and customers; processes login, bcrypt password comparison, JWT token issuance, and current user profile retrieval (`getMe`). |
| [`chat.controller.js`](file:///c:/Users/harsh/OneDrive/Desktop/ai-support/server/src/controllers/chat.controller.js) | Orchestrates starting new 1-to-1 sessions (`startConversation`), sending messages (`sendMessage`), human escalation (`escalateConversation`), agent live takeover (`takeOverConversation`), manual resolution (`resolveConversation`), AI chat summarization, and AI suggested replies. |
| [`ticket.controller.js`](file:///c:/Users/harsh/OneDrive/Desktop/ai-support/server/src/controllers/ticket.controller.js) | Handles listing tickets with role-based filters, fetching single ticket details, updating status/priority, assigning support agents, and adding internal team notes. |
| [`knowledge.controller.js`](file:///c:/Users/harsh/OneDrive/Desktop/ai-support/server/src/controllers/knowledge.controller.js) | Handles document uploads (PDF/DOCX/text), manual FAQ creation, text chunking, embedding generation, listing KB articles, and document deletion. |
| [`agent.controller.js`](file:///c:/Users/harsh/OneDrive/Desktop/ai-support/server/src/controllers/agent.controller.js) | Handles the Global Talent Directory of available freelance agents, sending company invitations, agent accepting/declining invitations, and fetching company agent rosters. |
| [`admin.controller.js`](file:///c:/Users/harsh/OneDrive/Desktop/ai-support/server/src/controllers/admin.controller.js) | Aggregates company analytics metrics (open tickets, resolved tickets, AI resolution rate, category breakdown) and lists customers with engagement statistics. |
| [`adminManagement.controller.js`](file:///c:/Users/harsh/OneDrive/Desktop/ai-support/server/src/controllers/adminManagement.controller.js) | Allows company Owners to view pending admin join requests, approve/reject admins, and regenerate secret company join keys. |

---

### 3. Backend Routes (`server/src/routes/`)

| File | Route Base | Responsibilities |
| :--- | :--- | :--- |
| [`auth.routes.js`](file:///c:/Users/harsh/OneDrive/Desktop/ai-support/server/src/routes/auth.routes.js) | `/api/auth` | Public auth routes (register, login, join requests) & protected `/me` profile route. |
| [`chat.routes.js`](file:///c:/Users/harsh/OneDrive/Desktop/ai-support/server/src/routes/chat.routes.js) | `/api/conversations` | Conversation lifecycle routes: `/start`, `/:id`, `/:id/messages`, `/:id/escalate`, `/:id/takeover`, `/:id/resolve`, `/:id/summarize`. |
| [`ticket.routes.js`](file:///c:/Users/harsh/OneDrive/Desktop/ai-support/server/src/routes/ticket.routes.js) | `/api/tickets` | Ticket routes: listing, single detail, update status/priority, internal notes. |
| [`knowledge.routes.js`](file:///c:/Users/harsh/OneDrive/Desktop/ai-support/server/src/routes/knowledge.routes.js) | `/api/knowledge` | Knowledge base routes with multer file upload middleware for document ingestion. |
| [`agent.routes.js`](file:///c:/Users/harsh/OneDrive/Desktop/ai-support/server/src/routes/agent.routes.js) | `/api/agents` | Directory discovery, sending invitations, and accepting/declining company invites. |
| [`admin.routes.js`](file:///c:/Users/harsh/OneDrive/Desktop/ai-support/server/src/routes/admin.routes.js) | `/api/admin` | Owner/Admin analytics, team management, join request approvals, and settings. |

---

### 4. Backend Services (`server/src/services/`)

| File | Purpose & Responsibilities |
| :--- | :--- |
| [`conversation.service.js`](file:///c:/Users/harsh/OneDrive/Desktop/ai-support/server/src/services/conversation.service.js) | Core orchestration engine: creates 1-to-1 `Conversation` + `Ticket` on `createNewSession()`, manages `handleCustomerMessage()`, runs AI resolution detection (`detectResolutionConfirmation`), human escalation, and agent manual resolution. |
| [`ticket.service.js`](file:///c:/Users/harsh/OneDrive/Desktop/ai-support/server/src/services/ticket.service.js) | Manages ticket updates, agent assignments, team notes, and synchronizes status changes with linked conversations. |
| [`ai/aiProvider.js`](file:///c:/Users/harsh/OneDrive/Desktop/ai-support/server/src/services/ai/aiProvider.js) | Universal AI abstraction layer routing requests to Gemini, OpenAI, or intelligent fallback. |
| [`ai/promptBuilder.js`](file:///c:/Users/harsh/OneDrive/Desktop/ai-support/server/src/services/ai/promptBuilder.js) | Constructs structured prompts with strict grounding rules, verified knowledge chunks, and dialogue history. |
| [`ai/smartFallbackGenerator.js`](file:///c:/Users/harsh/OneDrive/Desktop/ai-support/server/src/services/ai/smartFallbackGenerator.js) | Intelligent local rule engine answering knowledge questions offline when no API key is supplied. |
| [`knowledge/documentParser.js`](file:///c:/Users/harsh/OneDrive/Desktop/ai-support/server/src/services/knowledge/documentParser.js) | Extracts plain text from uploaded PDF, DOCX, or text files. |
| [`knowledge/textChunker.js`](file:///c:/Users/harsh/OneDrive/Desktop/ai-support/server/src/services/knowledge/textChunker.js) | Slices extracted text into 350-character chunks with 50-character sliding overlaps. |
| [`knowledge/embeddingService.js`](file:///c:/Users/harsh/OneDrive/Desktop/ai-support/server/src/services/knowledge/embeddingService.js) | Generates vector embeddings for text chunks via Gemini, OpenAI, or deterministic local vectors. |
| [`knowledge/retrievalService.js`](file:///c:/Users/harsh/OneDrive/Desktop/ai-support/server/src/services/knowledge/retrievalService.js) | Implements hybrid RAG retrieval (Cosine Vector Similarity + Keyword match boosting). |

---

### 5. Backend Middleware (`server/src/middleware/`)

| File | Purpose & Responsibilities |
| :--- | :--- |
| [`auth.middleware.js`](file:///c:/Users/harsh/OneDrive/Desktop/ai-support/server/src/middleware/auth.middleware.js) | `protect` middleware: extracts JWT from `Authorization: Bearer <token>`, validates signature, attaches `req.user` and `req.organizationId`. |
| [`role.middleware.js`](file:///c:/Users/harsh/OneDrive/Desktop/ai-support/server/src/middleware/role.middleware.js) | Enforces RBAC permissions: `requireRole(['ADMIN'])`, `requireAgentOrAdmin`, `requireOwner`. |
| [`error.middleware.js`](file:///c:/Users/harsh/OneDrive/Desktop/ai-support/server/src/middleware/error.middleware.js) | Global error handling middleware catching `ApiError` and formatting consistent JSON error responses with status codes. |
| [`upload.middleware.js`](file:///c:/Users/harsh/OneDrive/Desktop/ai-support/server/src/middleware/upload.middleware.js) | Configures `multer` for memory storage or disk uploads with file type (PDF/DOCX/TXT) and size constraints. |

---

### 6. Backend Socket.io & Configuration (`server/src/`)

| File | Purpose & Responsibilities |
| :--- | :--- |
| [`server.js`](file:///c:/Users/harsh/OneDrive/Desktop/ai-support/server/src/server.js) | Server entry point: connects to MongoDB and initializes HTTP and WebSocket servers on `PORT`. |
| [`app.js`](file:///c:/Users/harsh/OneDrive/Desktop/ai-support/server/src/app.js) | Initializes Express app, registers CORS, helmet security headers, body parsers, logging, and route mountings. |
| [`config/db.js`](file:///c:/Users/harsh/OneDrive/Desktop/ai-support/server/src/config/db.js) | Manages Mongoose connection to MongoDB Atlas or local MongoDB with connection retry handlers. |
| [`socket/socket.js`](file:///c:/Users/harsh/OneDrive/Desktop/ai-support/server/src/socket/socket.js) | Initializes Socket.io instance with CORS, exports `getIO()` singleton for cross-controller broadcasts. |
| [`socket/chat.socket.js`](file:///c:/Users/harsh/OneDrive/Desktop/ai-support/server/src/socket/chat.socket.js) | Registers JWT handshake authentication, room subscriptions (`conversation:<id>`, `org:<id>`), typing events, and disconnect handlers. |
| [`utils/ApiError.js`](file:///c:/Users/harsh/OneDrive/Desktop/ai-support/server/src/utils/ApiError.js) | Custom Error subclass encapsulating HTTP status codes, error messages, and operational flags. |

---

### 7. Frontend Context & Hooks (`client/src/`)

| File | Purpose & Responsibilities |
| :--- | :--- |
| [`context/AuthContext.jsx`](file:///c:/Users/harsh/OneDrive/Desktop/ai-support/client/src/context/AuthContext.jsx) | Global authentication state provider storing `user`, `token`, `role`, and providing `login`, `register`, and `logout` actions. |
| [`context/ToastContext.jsx`](file:///c:/Users/harsh/OneDrive/Desktop/ai-support/client/src/context/ToastContext.jsx) | Global toast notification manager rendering animated success, error, and info banners. |
| [`hooks/useAuth.js`](file:///c:/Users/harsh/OneDrive/Desktop/ai-support/client/src/hooks/useAuth.js) | Custom hook consuming `AuthContext` with helper flags (`isCustomer`, `isAgent`, `isAdmin`, `isOwner`). |
| [`hooks/useSocket.js`](file:///c:/Users/harsh/OneDrive/Desktop/ai-support/client/src/hooks/useSocket.js) | Custom hook managing Socket.io lifecycle, room joining, typing events, and cleanup. |

---

### 8. Frontend Components (`client/src/components/`)

| File | Purpose & Responsibilities |
| :--- | :--- |
| [`chat/ChatWindow.jsx`](file:///c:/Users/harsh/OneDrive/Desktop/ai-support/client/src/components/chat/ChatWindow.jsx) | Core messaging viewport rendering message stream, typing indicator, "Request Human" button (customer), and "Resolve Ticket" button (agent). |
| [`chat/MessageList.jsx`](file:///c:/Users/harsh/OneDrive/Desktop/ai-support/client/src/components/chat/MessageList.jsx) | Renders formatted chat bubbles distinguishing customer, agent, AI, and system messages with timestamps and source citations. |
| [`chat/MessageInput.jsx`](file:///c:/Users/harsh/OneDrive/Desktop/ai-support/client/src/components/chat/MessageInput.jsx) | Chat textarea with Enter-to-send support, typing event triggers, and send button. |
| [`chat/TypingIndicator.jsx`](file:///c:/Users/harsh/OneDrive/Desktop/ai-support/client/src/components/chat/TypingIndicator.jsx) | Smooth pulsating animation showing when AI is thinking or another user is typing. |
| [`chat/EscalationModal.jsx`](file:///c:/Users/harsh/OneDrive/Desktop/ai-support/client/src/components/chat/EscalationModal.jsx) | Modal dialog prompting customer for escalation reason before transferring to human agent queue. |
| [`common/Sidebar.jsx`](file:///c:/Users/harsh/OneDrive/Desktop/ai-support/client/src/components/common/Sidebar.jsx) | Responsive navigation sidebar adapting menu items dynamically based on user role (`CUSTOMER`, `AGENT`, `ADMIN`, `OWNER`). |
| [`common/Navbar.jsx`](file:///c:/Users/harsh/OneDrive/Desktop/ai-support/client/src/components/common/Navbar.jsx) | Top header bar showing company branding, active role badge, user profile menu, and logout action. |
| [`tickets/TicketStatusBadge.jsx`](file:///c:/Users/harsh/OneDrive/Desktop/ai-support/client/src/components/tickets/TicketStatusBadge.jsx) | Renders stylized status pill badges for `OPEN` (blue), `HUMAN_REQUIRED` (warning/amber), and `RESOLVED` (emerald). |
| [`tickets/TicketDetailModal.jsx`](file:///c:/Users/harsh/OneDrive/Desktop/ai-support/client/src/components/tickets/TicketDetailModal.jsx) | Comprehensive modal allowing agents/admins to inspect ticket details, modify status/priority, and add internal notes. |

---

### 9. Frontend Pages (`client/src/pages/`)

| File | Route | Purpose & Responsibilities |
| :--- | :--- | :--- |
| [`customer/Chat.jsx`](file:///c:/Users/harsh/OneDrive/Desktop/ai-support/client/src/pages/customer/Chat.jsx) | `/chat` | Customer AI assistant page featuring quick inquiries and **New Session** creation. |
| [`customer/Conversations.jsx`](file:///c:/Users/harsh/OneDrive/Desktop/ai-support/client/src/pages/customer/Conversations.jsx) | `/conversations` | Customer session history listing past AI and human dialogues with status badges. |
| [`customer/Profile.jsx`](file:///c:/Users/harsh/OneDrive/Desktop/ai-support/client/src/pages/customer/Profile.jsx) | `/profile` | Customer profile management page (avatar, name, email). |
| [`agent/AgentConversation.jsx`](file:///c:/Users/harsh/OneDrive/Desktop/ai-support/client/src/pages/agent/AgentConversation.jsx) | `/agent/conversations` | Agent live support desk: queue of escalated chats, takeover action, real-time chat, and ticket resolution. |
| [`agent/AgentTickets.jsx`](file:///c:/Users/harsh/OneDrive/Desktop/ai-support/client/src/pages/agent/AgentTickets.jsx) | `/agent/tickets` | Support ticket table with search, status filters (`OPEN`, `HUMAN_REQUIRED`, `RESOLVED`), and detail modal. |
| [`admin/AdminDashboard.jsx`](file:///c:/Users/harsh/OneDrive/Desktop/ai-support/client/src/pages/admin/AdminDashboard.jsx) | `/admin/dashboard` | Executive analytics dashboard displaying key operational KPIs, ticket charts, and activity feeds. |
| [`admin/KnowledgeBase.jsx`](file:///c:/Users/harsh/OneDrive/Desktop/ai-support/client/src/pages/admin/KnowledgeBase.jsx) | `/admin/knowledge` | Knowledge management center for uploading PDFs/DOCX, creating FAQs, and viewing chunk embeddings. |
| [`auth/Login.jsx`](file:///c:/Users/harsh/OneDrive/Desktop/ai-support/client/src/pages/auth/Login.jsx) | `/login` | Universal authentication page with quick demo account 1-click login buttons. |
| [`auth/Register.jsx`](file:///c:/Users/harsh/OneDrive/Desktop/ai-support/client/src/pages/auth/Register.jsx) | `/register` | Multi-tab registration for new companies, freelance agents, and admin join requests. |
| [`LandingPage.jsx`](file:///c:/Users/harsh/OneDrive/Desktop/ai-support/client/src/pages/LandingPage.jsx) | `/` | Marketing landing page presenting product features, architecture highlights, and live demo access. |

---

### 10. Frontend API Services (`client/src/services/`)

| File | Purpose & Responsibilities |
| :--- | :--- |
| [`api.js`](file:///c:/Users/harsh/OneDrive/Desktop/ai-support/client/src/services/api.js) | Axios instance with baseURL `/api`, request interceptor attaching JWT token, and response interceptor handling 401 unauthenticated redirects. |
| [`chat.service.js`](file:///c:/Users/harsh/OneDrive/Desktop/ai-support/client/src/services/chat.service.js) | Encapsulates all conversation API calls: `startConversation`, `sendMessage`, `escalateConversation`, `takeOverConversation`, `resolveConversation`, `summarizeChat`. |
| [`ticket.service.js`](file:///c:/Users/harsh/OneDrive/Desktop/ai-support/client/src/services/ticket.service.js) | Encapsulates ticket API calls: `getTickets`, `getTicketById`, `updateTicket`, `addInternalNote`. |
| [`knowledge.service.js`](file:///c:/Users/harsh/OneDrive/Desktop/ai-support/client/src/services/knowledge.service.js) | Encapsulates knowledge base API calls: `getDocuments`, `uploadDocument`, `createFAQ`, `deleteDocument`. |
| [`auth.service.js`](file:///c:/Users/harsh/OneDrive/Desktop/ai-support/client/src/services/auth.service.js) | Encapsulates auth API calls: `login`, `registerCompany`, `registerAgent`, `requestAdminJoin`, `getMe`. |

---

# SECTION E — COMPLETE APPLICATION FLOW

### The Complete Request & Response Lifecycle

```text
========================================================================================
                                 CLIENT REQUEST LIFECYCLE
========================================================================================

[ 1. User Action in Browser ]
  Customer types a question in Chat.jsx and hits Enter
        ↓
[ 2. React Component State & Hook ]
  ChatWindow.jsx triggers handleSend(content)
        ↓
[ 3. Frontend API Service (Axios) ]
  chat.service.js calls api.post('/conversations/:id/messages', { content })
  Axios Interceptor attaches Authorization: Bearer <jwt_token>
        ↓
[ 4. Vite Reverse Proxy / Network ]
  Proxies request from http://localhost:5173/api/... to http://localhost:5000/api/...
        ↓
[ 5. Express Router & Global Middleware ]
  Express matches route in chat.routes.js -> protect middleware executes
  protect validates JWT, fetches User from MongoDB, attaches req.user and req.organizationId
        ↓
[ 6. Chat Controller ]
  chat.controller.js -> sendMessage(req, res, next) validates input and checks permissions
        ↓
[ 7. Business Logic Service ]
  conversation.service.js -> handleCustomerMessage()
  - Saves Customer Message to MongoDB
  - Checks if message confirms issue resolution (e.g., "Yes, that solved it")
  - If not resolved: Calls retrievalService.js to fetch RAG chunks from Knowledge Base
  - Calls aiProvider.js -> builds prompt with company context -> calls Gemini/OpenAI
  - Saves AI Response Message to MongoDB
  - Detects if customer needs human escalation
        ↓
[ 8. Mongoose & MongoDB ]
  Mongoose executes queries on MongoDB:
  - messages.insertOne(...)
  - conversations.updateOne(...)
  - tickets.updateOne(...)
        ↓
[ 9. Real-Time Socket.io Broadcast ]
  chat.controller.js emits new_message to Socket room: conversation:<id>
  If escalated: emits conversation_escalated to org:<organizationId>
        ↓
[ 10. HTTP Response Sent Back to Client ]
  Controller returns JSON: { success: true, customerMessage, aiMessage, escalated, resolved, ticket }
        ↓
[ 11. React Updates UI ]
  ChatWindow.jsx receives response + socket event -> updates messages state -> smooth scroll to bottom

========================================================================================
```

---

# SECTION F — CUSTOMER FLOW

```text
                             CUSTOMER SUPPORT FLOW
                             
                        [ Customer Clicks New Session ]
                                       ↓
                        [ Creates Conversation (OPEN) ]
                        [ Creates Linked Ticket (OPEN)]
                                       ↓
                        [ Initial AI Welcome Message  ]
                                       ↓
                        [ Customer Sends Question     ]
                                       ↓
                        [ AI Searches Knowledge Base  ]
                                       ↓
                        [ AI Returns Verified Answer  ]
                                       ↓
                    ┌──────────────────┴──────────────────┐
                    ↓                                     ↓
        [ Customer confirms: "Solved!" ]     [ AI cannot solve / Human requested ]
                    ↓                                     ↓
        [ Ticket status: RESOLVED ]          [ Ticket status: HUMAN_REQUIRED   ]
        [ Conversation: RESOLVED  ]          [ Conversation: HUMAN mode        ]
                    ↓                                     ↓
        [ Session Finished Successfully ]    [ Agent Takes Over Live Chat Desk ]
                                                          ↓
                                             [ Agent Chats & Solves Issue      ]
                                                          ↓
                                             [ Agent Clicks "Resolve Ticket"   ]
                                                          ↓
                                             [ Ticket status: RESOLVED         ]
```

---

# SECTION G — AUTHENTICATION FLOW

```text
[ Registration / Login ] ──► [ bcrypt.compare / User.create ] ──► [ Generate JWT Token ]
                                                                          │
                                                                          ▼
                                                         [ Stored in sessionStorage ]
                                                                          │
                                                                          ▼
                                                       [ Attached to every API Request ]
                                                       [ Header: Bearer <token>        ]
                                                                          │
                                                                          ▼
                                                          [ auth.middleware.js (protect) ]
                                                          - jwt.verify(token, secret)
                                                          - req.user = user
                                                          - req.organizationId = orgId
```

### Key Security Implementations:
1. **Password Hashing**: Passwords are never stored in plaintext. `User.hashPassword` hashes passwords using `bcryptjs` with 10 salt rounds before saving.
2. **JWT Structure**: Tokens contain `{ id: user._id, role: user.role, organizationId: user.organizationId }` signed with `JWT_SECRET` and expiring in 7 days.
3. **Role-Based Guards**: `requireAgentOrAdmin` in `role.middleware.js` blocks unauthorized role access.
4. **Multi-Tenant Isolation**: Every database query scopes by `organizationId: req.organizationId` so customers and agents from one company can never access another company's data.

---

# SECTION H — API FLOW

| Method | Endpoint | Purpose | Who Can Use |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register-company` | Create organization and owner account | Public |
| `POST` | `/api/auth/register-agent` | Register independent agent in Global Directory | Public |
| `POST` | `/api/auth/request-admin-join` | Request admin access using company join key | Public |
| `POST` | `/api/auth/register-customer` | Register customer under company slug | Public |
| `POST` | `/api/auth/login` | Authenticate user and receive JWT token | Public |
| `GET` | `/api/auth/me` | Fetch authenticated user profile & organization | Authenticated |
| `POST` | `/api/conversations/start` | Create a brand new Conversation + Ticket session | Customer |
| `GET` | `/api/conversations` | List conversation history (scoped by role) | Customer, Agent, Admin |
| `GET` | `/api/conversations/:id` | Get single conversation with full message history | Customer (own), Agent, Admin |
| `POST` | `/api/conversations/:id/messages` | Send message (triggers AI answer or agent message) | Customer, Agent |
| `POST` | `/api/conversations/:id/escalate` | Manually escalate session to human queue | Customer, Agent |
| `POST` | `/api/conversations/:id/takeover` | Agent takes over live conversation | Agent, Admin |
| `POST` | `/api/conversations/:id/resolve` | Agent marks conversation & ticket as RESOLVED | Agent, Admin |
| `POST` | `/api/conversations/:id/summarize` | Generate AI executive summary of chat | Agent, Admin |
| `POST` | `/api/conversations/:id/suggest-reply` | Generate AI suggested reply for agent | Agent, Admin |
| `GET` | `/api/tickets` | List tickets with status & priority filters | Customer (own), Agent, Admin |
| `GET` | `/api/tickets/:id` | Get ticket details and internal team notes | Customer (own), Agent, Admin |
| `PUT` | `/api/tickets/:id` | Update ticket status, priority, or category | Agent, Admin |
| `POST` | `/api/tickets/:id/notes` | Add internal agent note | Agent, Admin |
| `GET` | `/api/knowledge` | List organization knowledge documents & chunks | Agent, Admin |
| `POST` | `/api/knowledge/upload` | Upload PDF/DOCX or text file into Knowledge Base | Admin, Owner |
| `DELETE`| `/api/knowledge/:id` | Delete knowledge document and chunk embeddings | Admin, Owner |
| `GET` | `/api/admin/dashboard` | Get analytics metrics, counts, and charts | Admin, Owner |

---

# SECTION I — DATABASE

### Model Relationship Diagram

```text
   ┌────────────────────────────────────────────────────────┐
   │                      Organization                      │
   │  _id, name, slug, ownerId, adminJoinKey, settings...   │
   └───────────────┬────────────────────────┬───────────────┘
                   │ 1:N                    │ 1:N
                   ▼                        ▼
       ┌───────────────────────┐   ┌───────────────────────────┐
       │         User          │   │     KnowledgeDocument     │
       │ _id, name, email,     │   │ _id, title, rawContent... │
       │ passwordHash, role... │   └─────────────┬─────────────┘
       └───────────┬───────────┘                 │ 1:N
                   │ 1:N                         ▼
                   │               ┌───────────────────────────┐
                   │               │      KnowledgeChunk       │
                   │               │ _id, content, embedding.. │
                   │               └───────────────────────────┘
                   │
                   ▼ (1 Customer creates N Sessions)
       ┌───────────────────────────────────────────────────────┐
       │                     Conversation                      │
       │ _id, customerId, assignedAgentId, status, mode...     │
       │ ticketId (1-to-1 ref to Ticket)                       │
       └───────────────┬──────────────────────────▲────────────┘
                       │ 1:N                      │ 1-to-1
                       ▼                          │
       ┌───────────────────────────────┐          │
       │            Message            │          │
       │ _id, conversationId, senderId,│          │
       │ senderType, content, meta...  │          │
       └───────────────────────────────┘          │
                                                  │
       ┌──────────────────────────────────────────┴────────────┐
       │                        Ticket                         │
       │ _id, ticketNumber, customerId, conversationId,        │
       │ title, description, category, priority, status...     │
       └───────────────────────────────────────────────────────┘
```

---

# SECTION J — AI FLOW & RAG PIPELINE

```text
[ Customer Query ]
       │
       ▼
[ retrievalService.js ] ──► Computes Embedding + Keyword Match against KnowledgeChunk
       │
       ▼
[ Top K Chunks Retrieved ] (e.g. Refund Policy: "7 days money-back guarantee...")
       │
       ▼
[ promptBuilder.js ] ────► Injects System Rules + Verified Context + Chat History
       │
       ▼
[ aiProvider.js ] ───────► Sends payload to Google Gemini / OpenAI
       │
       ▼
[ AI Generates Grounded Answer ]
       │
       ▼
[ Resolution & Escalation Detection ]
  - If customer confirms issue solved -> Status becomes RESOLVED
  - If customer asks for human or low context match -> Status becomes HUMAN_REQUIRED
       │
       ▼
[ Stored in Message collection & Returned to Customer ]
```

> [!NOTE]
> If `GEMINI_API_KEY` or `OPENAI_API_KEY` is not provided, the system does NOT crash. It uses `generateSmartFallbackResponse` to extract facts from the prompt and local knowledge base, making offline development and grading 100% reliable.

---

# SECTION K — SOCKET.IO REAL-TIME FLOW

1. **Authentication Handshake**:
   When the React client mounts, `useSocket.js` connects to the Socket.io server with `{ auth: { token } }`. The server validates the JWT in `io.use(...)`.
2. **Joining Rooms**:
   - `user:<userId>`: For targeted notifications and invitation alerts.
   - `org:<organizationId>`: For organization-wide broadcasts (new tickets, escalations).
   - `conversation:<conversationId>`: Joined when opening a chat window for real-time messaging.
3. **Core Events**:
   - `send_message` / `new_message`: Real-time message delivery between customer and agent.
   - `typing_start` / `typing_stop`: Live indicator when the other party is typing.
   - `conversation_escalated`: Broadcasts to the organization's agent queue when a chat requires human help.
   - `agent_joined`: Alerts customer that a human support agent joined.
   - `conversation_resolved`: Broadcasts instant resolution status to all room participants.

---

# SECTION L — KNOWLEDGE BASE & DOCUMENT PROCESSING

### Step-by-Step Document Ingestion:
1. **Upload**: Admin uploads a file (PDF, DOCX, or plain text) or pastes FAQ text via the Knowledge Base page.
2. **Text Extraction**: `documentParser.js` parses the file contents using `pdf-parse` (for PDFs) or `mammoth` (for DOCX).
3. **Chunking**: `textChunker.js` splits long documents into 350-character chunks with a 50-character sliding window overlap to preserve semantic context across sentence boundaries.
4. **Vector Embedding**: `embeddingService.js` converts each text chunk into a high-dimensional vector using Gemini (`text-embedding-004`), OpenAI (`text-embedding-3-small`), or deterministic fallback.
5. **Storage**: Chunks and embeddings are stored in the `KnowledgeChunk` collection linked to the `organizationId`.
6. **Query Retrieval**: When a customer asks a question, `retrievalService.js` calculates Cosine Similarity between the query vector and chunk vectors with keyword boosting, ensuring fast and accurate context injection.

---

# SECTION M — ENVIRONMENT VARIABLES (What I Must Configure)

Create a file named `.env` in the `server/` directory.

```env
# ==========================================
# SERVER CONFIGURATION
# ==========================================
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# ==========================================
# DATABASE (MongoDB Connection String)
# ==========================================
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/ai_supporthub?retryWrites=true&w=majority

# ==========================================
# JWT AUTHENTICATION
# ==========================================
JWT_SECRET=your_super_secret_jwt_key_here_minimum_32_characters
JWT_EXPIRES_IN=7d

# ==========================================
# AI CONFIGURATION
# ==========================================
AI_PROVIDER=gemini
GEMINI_API_KEY=your_google_gemini_api_key_here
OPENAI_API_KEY=your_openai_api_key_here

# ==========================================
# CLOUDINARY (Optional for Cloud File Uploads)
# ==========================================
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### Environment Variables Breakdown:

| Variable | Where to Put It | What It Is | Why It Is Required | Where to Obtain |
| :--- | :--- | :--- | :--- | :--- |
| `PORT` | `server/.env` | Port number for Express server | Defines backend listening port (default: 5000). | Set locally (e.g. 5000). |
| `MONGODB_URI` | `server/.env` | MongoDB connection URL | Connects Mongoose to your MongoDB Atlas cluster or local database. | [MongoDB Atlas](https://cloud.mongodb.com). |
| `JWT_SECRET` | `server/.env` | Secret encryption key | Signs and validates user JWT tokens for secure authentication. | Generate any 32+ character random string. |
| `AI_PROVIDER` | `server/.env` | AI provider selector | Determines whether backend calls Gemini or OpenAI (`gemini` / `openai`). | Set to `gemini` or `openai`. |
| `GEMINI_API_KEY` | `server/.env` | Google AI Studio API key | Used to generate AI chat completions and text embeddings. | [Google AI Studio](https://aistudio.google.com). |
| `OPENAI_API_KEY` | `server/.env` | OpenAI API key | Alternative provider for chat and embeddings if selected. | [OpenAI Platform](https://platform.openai.com). |

---

# SECTION N — MANUAL SETUP CHECKLIST

### Must Do Before Running
- [x] Run `npm install` in both `server/` and `client/` directories.
- [x] Create `server/.env` with your `MONGODB_URI` and `JWT_SECRET`.
- [x] Run `npm run seed` in `server/` to initialize demo organizations, accounts, and knowledge base.

### Optional (Configure Later)
- Add your own `GEMINI_API_KEY` or `OPENAI_API_KEY` to `.env` for live LLM generation.
- Add Cloudinary credentials if you wish to host document uploads in the cloud.

### Automatically Handled by Application
- 1-to-1 binding between Conversations and Tickets on every New Session click.
- Automatic creation of initial AI welcome message.
- Automatic issue resolution detection based on customer feedback.
- Real-time Socket.io room routing and message broadcasting.

---

# SECTION O — HOW TO RUN THE PROJECT

### Step 1: Install Dependencies
```bash
# In server directory
cd server
npm install

# In client directory
cd ../client
npm install
```

### Step 2: Seed Demo Database
```bash
cd ../server
npm run seed
```

### Step 3: Start the Backend Server
```bash
# In server directory (runs on port 5000)
npm run dev
```

### Step 4: Start the Frontend Client
```bash
# In client directory (runs on port 5173)
npm run dev
```

### Step 5: Open Browser
- Open [http://localhost:5173](http://localhost:5173) in your browser.

---

# SECTION P — COMMON ERRORS & TROUBLESHOOTING

| Error | Why It Happens | How to Fix |
| :--- | :--- | :--- |
| **`MongooseServerSelectionError`** | MongoDB URI is incorrect or IP address is not whitelisted in MongoDB Atlas. | Check `MONGODB_URI` in `server/.env`. In MongoDB Atlas, go to **Network Access** and add `0.0.0.0/0` (Allow access from anywhere). |
| **`401 Unauthorized / Token Expired`** | Missing or expired JWT token in request headers. | Log out and log back in to generate a fresh token in `sessionStorage`. |
| **`CORS Error`** | Frontend origin does not match backend CORS policy. | Ensure `CLIENT_URL=http://localhost:5173` in `server/.env` and Vite proxy in `vite.config.js` is active. |
| **`AI API Key Missing`** | `GEMINI_API_KEY` is not set. | The backend automatically uses the smart deterministic fallback generator. To use real AI, paste your key in `server/.env`. |
| **`Socket Connection Failed`** | Backend server is not running or port mismatch. | Ensure backend is running on `PORT 5000` and Vite dev server proxies `/socket.io`. |

---

# SECTION Q — INTERVIEW EXPLANATION & Q&A PREPARATION

### 1-to-2 Minute Elevator Pitch
> *"AI SupportHub is a full-stack MERN customer support platform that integrates Retrieval-Augmented Generation (RAG) and Socket.io real-time chat. Every customer support session automatically creates a 1-to-1 linked Conversation and Ticket in MongoDB. The customer chats with an AI Assistant grounded in the company's verified Knowledge Base. If the AI solves the problem and the customer confirms it, the ticket is automatically marked as `RESOLVED`. If the issue requires human assistance or the user asks for an agent, the ticket transitions to `HUMAN_REQUIRED`. A human support agent takes over the conversation in real time from the agent desk and manually resolves the ticket when done. The platform enforces multi-tenant organization isolation and role-based access control across Customers, Agents, Admins, and Owners."*

### Top Interview Questions & Answers

#### Q1: Why did you bind 1 Conversation to exactly 1 Ticket on every session?
> **Answer**: In customer support architectures, tracking customer interactions as independent tickets ensures clear auditability, accurate SLA tracking, and clean separation between past resolved issues and new inquiries. Tying every new session to a dedicated ticket prevents conversation pollution and makes data analysis straightforward.

#### Q2: What are the simplified ticket statuses and what do they mean?
> **Answer**: We use three distinct statuses:
> 1. **`OPEN`**: AI Assistant is actively handling the customer inquiry (`mode: 'ai'`).
> 2. **`HUMAN_REQUIRED`**: The issue was escalated to the human support queue because the AI could not solve it or the customer requested human assistance (`mode: 'human'`).
> 3. **`RESOLVED`**: The problem has been solved—either automatically by AI resolution confirmation or manually by a human agent.

#### Q3: How does the AI know how to answer company-specific questions without hallucinating?
> **Answer**: We use Retrieval-Augmented Generation (RAG). Company documents are chunked into small text segments and converted to vector embeddings. When a customer sends a query, we perform vector similarity search plus keyword matching to retrieve only relevant chunks. We inject these verified chunks into the LLM system prompt with strict instructions: *"Use only the provided knowledge context to answer. If not found, offer to connect with a human agent."*

#### Q4: How does AI issue resolution detection work?
> **Answer**: We analyze the customer's response for explicit confirmation phrases such as *"Yes, that solved my problem"*, *"It works now"*, or *"Problem solved"*. We specifically filter out ambiguous, non-committal words like *"ok"*, *"fine"*, or *"I'll try"* so tickets are never prematurely closed without explicit confirmation.

---

# SECTION R — COMPLETE FLOW DIAGRAMS

### 1. New Session Creation
```text
Customer Clicks "New Session"
             │
             ▼
POST /api/conversations/start
             │
             ├──► Creates Conversation (status: OPEN, mode: ai)
             ├──► Creates Ticket (status: OPEN, linked to Conversation)
             ├──► Creates Initial AI Welcome Message
             │
             ▼
Returns fresh Conversation & Ticket IDs to Client
```

### 2. Customer Chat & AI Grounding
```text
Customer Message: "What is the refund policy?"
             │
             ▼
Retrieve Top Chunks from Knowledge Base
             │
             ▼
Build Prompt with Verified Company Chunks
             │
             ▼
LLM Generates Grounded Answer
             │
             ▼
Saved to Message Collection & Broadcasted via Socket.io
```

### 3. Human Escalation & Agent Resolution
```text
Customer asks: "I want to talk to a human agent"
             │
             ▼
Ticket.status = HUMAN_REQUIRED
Conversation.status = HUMAN_REQUIRED, mode = human
             │
             ▼
Socket emits 'conversation_escalated' to Org Room
             │
             ▼
Agent clicks "Take Over Conversation"
             │
             ▼
Agent chats with Customer in Real Time
             │
             ▼
Agent clicks "Resolve Ticket"
             │
             ▼
Ticket.status = RESOLVED, resolvedAt = new Date()
Conversation.status = RESOLVED
```

---

# SECTION S — WHAT IS AUTOMATIC VS MANUAL

| Task | Automatic / Manual | Who / What Does It |
| :--- | :--- | :--- |
| **Create Account & Login** | Manual | Customer / Agent / Admin fills auth form |
| **Create 1-to-1 Conversation + Ticket** | **Automatic** | Triggered when customer clicks "New Session" |
| **Initial Welcome Message** | **Automatic** | Generated on new session creation |
| **Knowledge Base Retrieval (RAG)** | **Automatic** | `retrievalService.js` retrieves relevant chunks |
| **AI Answer Generation** | **Automatic** | `aiProvider.js` generates response using LLM |
| **AI Resolution Detection** | **Automatic** | Marks `RESOLVED` on explicit confirmation |
| **Human Escalation Trigger** | **Automatic / Manual** | Triggered by AI detection or customer click |
| **Agent Takeover** | Manual | Agent clicks "Take Over" in live chat desk |
| **Agent Ticket Resolution** | Manual | Agent clicks "Resolve Ticket" in chat window |
| **Knowledge Base Document Upload** | Manual | Admin / Owner uploads documents |
| **Environment Variable Setup** | Manual | Developer configures `.env` before running |

---

# SECTION T — FINAL VERIFIED TEST CHECKLIST

- [x] **MongoDB Configured & Connected**: Verified connection to MongoDB instance.
- [x] **Environment Variables Tested**: Standard `.env.example` verified with fallback safety.
- [x] **Customer Login Tested**: Authenticated via JWT bearer token.
- [x] **New Session Binding Tested**: Confirmed 1 New Conversation = 1 New Ticket with fresh MongoDB `_id`s.
- [x] **AI Chat & Knowledge Retrieval Tested**: Knowledge chunks accurately retrieved and injected into prompt.
- [x] **AI Resolution Detection Tested**: Verified explicit phrase marks `RESOLVED`; verified weak words (`okay`, `I'll try`) keep ticket `OPEN`.
- [x] **Human Escalation Tested**: Verified escalation sets `status = HUMAN_REQUIRED` and `mode = human`.
- [x] **Agent Takeover & Real-Time Chat Tested**: Agent assigns session and exchanges messages.
- [x] **Agent Ticket Resolution Tested**: Verified agent manual resolve sets `status = RESOLVED` and records `resolvedAt`.
- [x] **Customer Conversation History Tested**: Displays past dialogues with correct status badges.
- [x] **Frontend Production Build Tested**: `vite build` completed with 0 errors.
