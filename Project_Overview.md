<div style="text-align: center; margin-top: 150px;">
    <h1 style="font-size: 3em; color: #1e293b;">AI-Powered Student-Company Recruitment Portal</h1>
    <h2 style="color: #64748b; font-weight: 300;">Comprehensive System Architecture & Technical Specification</h2>
    <br><br><br>
    <p style="font-size: 1.2em; color: #475569;">Prepared by: Engineering Team</p>
    <p style="font-size: 1em; color: #94a3b8;">Date: April 2026 | Version: 1.0.0</p>
</div>

<div style="page-break-after: always;"></div>

## Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [System Architecture & Technology Stack](#2-system-architecture--technology-stack)
3. [The AI Candidate Matching Engine](#3-the-ai-candidate-matching-engine)
4. [Real-time Communication Pipeline](#4-real-time-communication-pipeline)
5. [Database Schema & Data Models](#5-database-schema--data-models)
6. [API Endpoint Documentation](#6-api-endpoint-documentation)
7. [Deployment Strategy & Future Roadmap](#7-deployment-strategy--future-roadmap)

<br><br>

## 1. Executive Summary

The **AI-Powered Recruitment Portal** is a modern, full-stack application designed to revolutionize how emerging student talent connects with industry professionals. Traditional hiring processes often rely on superficial resume parsing, which fails to capture a candidate's true potential, communication skills, and contextual capabilities.

This platform replaces outdated screening pipelines with a holistic, multi-dimensional candidate evaluation system. By bridging the gap between passive resumes and active engagement, the application empowers recruiters to make data-driven decisions while providing students with actionable insights on their market readiness.

### Key Value Propositions:
* **For Students:** A centralized hub to upload PDF resumes, network with industry mentors via live chat, and receive an instant, AI-generated "Match Score" that highlights their specific capabilities (e.g., "Engineering Depth", "Leadership").
* **For Companies:** A curated, automatically ranked dashboard of candidates tailored to specific job roles. Recruiters bypass the noise of hundreds of applicants, focusing immediately on candidates scored highest by the AI engine across skills, resumes, and communication metrics.

<div style="page-break-after: always;"></div>

## 2. System Architecture & Technology Stack

The application is built upon a scalable, decoupled architecture, separating the client-side presentation layer from the robust server-side processing and database management layers. 

### 2.1 Frontend (Client-Side)
The frontend is engineered for maximum performance, Search Engine Optimization (SEO), and a premium user experience.
* **Framework:** Next.js (React 18) utilizing the modern App Router architecture for seamless Server-Side Rendering (SSR) and optimized client-side routing.
* **Styling & UI:** Custom Vanilla CSS utilizing modern design paradigms, including glassmorphism, dynamic conic-gradients, and smooth micro-animations. Iconography is powered by Lucide React.
* **Real-time Engine:** SockJS combined with STOMP (Simple Text Oriented Messaging Protocol) handles bidirectional WebSocket streams for live chat.
* **Data Visualization:** Recharts is utilized for rendering analytics, while custom CSS components render the dynamic AI Score Rings.

### 2.2 Backend (Server-Side)
The backend is a high-performance Java application designed to handle complex algorithmic processing and concurrent WebSocket connections.
* **Framework:** Java 21 powered by Spring Boot 3.2.
* **PDF Processing:** Apache PDFBox 3.0 is deeply integrated into the file upload pipeline to extract raw text streams from binary PDF files directly in memory.
* **Messaging Broker:** Spring WebSocket Message Broker facilitates the routing of chat messages between specific user topics.
* **Security & Network:** A custom global `CorsFilter` bean ensures that both multipart/form-data preflight `OPTIONS` requests and cross-origin SockJS handshakes (with `allowCredentials(true)`) are securely handled across the `localhost:3000` to `localhost:8080` boundary.

### 2.3 Data Layer
* **Persistence Framework:** Spring Data JPA with Hibernate.
* **Database:** Currently configured with an H2 In-Memory Database for rapid development and demonstration purposes, seeded on startup via a custom `DataInitializer`. The schema is fully compliant for a zero-friction migration to PostgreSQL.

<div style="page-break-after: always;"></div>

## 3. The AI Candidate Matching Engine

The core intellectual property of the platform is the sophisticated `AIService.java` ranking algorithm. Rather than relying on simple keyword matching, the engine evaluates candidates across four distinct, weighted dimensions to generate a final **Fit Score (0-100%)**.

### 3.1 Factor 1: Skill Overlap (40% Weight)
The engine calculates the exact percentage of overlapping technical and soft skills between the student's declared profile and the specific `JobRole` requirements. This provides a baseline metric for technical competency.

### 3.2 Factor 2: Resume Content Analysis (30% Weight)
When a student uploads a PDF, Apache PDFBox extracts the raw text. The AI engine runs this text through specialized dictionaries containing over 40 weighted keywords across different domains:
* **Leadership Signals:** "managed", "led", "captain", "organized".
* **Engineering Signals:** "deployed", "architecture", "algorithm", "full-stack".
* **Legal/Research Signals:** "thesis", "compliance", "drafted", "policy".
The text is tokenized, scored, and normalized to generate a resume quality metric.

### 3.3 Factor 3: Chat Sentiment & Quality (20% Weight)
The system actively analyzes the depth of the student's communication by querying their history in the `InteractionRepository`. It measures message length, question frequency (curiosity), and professional vocabulary to ensure the candidate possesses strong communication skills.

### 3.4 Factor 4: Mentor Recommendations (10% Weight)
A manual feedback loop is integrated into the final score. If an industry mentor logs a positive `FEEDBACK` interaction for a student, the algorithm grants bonus points, simulating a real-world referral system.

### 3.5 AI Output & Explainability
To ensure transparency, the AI Engine generates two human-readable outputs:
1. **Capability Badges:** Tags like "High Achiever" or "Engineering Depth" are dynamically assigned based on scoring thresholds.
2. **Reasoning Text:** A dynamically constructed paragraph explaining exactly *why* the candidate received their score, fostering trust with recruiters.

<div style="page-break-after: always;"></div>

## 4. Real-time Communication Pipeline

The platform facilitates instant, 1-on-1 networking between students and mentors using a robust WebSocket architecture.

### 4.1 Connection Lifecycle
1. **Handshake:** The Next.js frontend initiates a SockJS connection to `http://localhost:8080/ws`.
2. **Subscription:** Upon connection, the client subscribes to a unique, secure topic: `/topic/messages/{USER_ID}`.
3. **Transmission:** When a user sends a message, it is published to the `/app/chat.send` destination.

### 4.2 Message Routing (`WSChatController`)
The Spring Boot backend intercepts messages at the `@MessageMapping("/chat.send")` endpoint. The lifecycle involves:
* Timestamping the message and categorizing it as a `CHAT` interaction.
* Persisting the raw message content to the database via `InteractionRepository` for future AI analysis.
* Broadcasting the message strictly to the receiver's specific `/topic/messages/` queue, while simultaneously echoing it back to the sender for optimistic UI rendering.

<div style="page-break-after: always;"></div>

## 5. Database Schema & Data Models

The relational database is structured to support the AI engine and the complex relationships between students, companies, and historical data.

### 5.1 Core Entities

#### `Student` Model
* **Attributes:** `id`, `name`, `email`, `githubUrl`, `resumeText` (Long Text), `skills` (Collection), `verificationStatus` (Enum: PENDING, VERIFIED, REJECTED).
* **Purpose:** Acts as the central node for candidate evaluation. The `resumeText` field holds the raw output from the PDFBox extraction.

#### `Employee` Model
* **Attributes:** `id`, `name`, `jobTitle`, `companyId`, `companyName`, `bio`.
* **Purpose:** Represents the industry mentors that students network with and the recruiters who evaluate the AI dashboards.

#### `JobRole` Model
* **Attributes:** `id`, `title`, `description`, `companyId`, `department`, `requiredSkills` (Collection).
* **Purpose:** The target metric against which students are evaluated. The AI engine cross-references the student's profile with these requirements.

#### `Interaction` Model
* **Attributes:** `id`, `senderId`, `receiverId`, `companyId`, `jobPostId`, `content`, `type` (Enum: VIEW, APPLY, BOOKMARK, CHAT, FEEDBACK), `timestamp`.
* **Purpose:** A universal ledger tracking every event in the system. Used to render chat histories, compile company analytics, and fuel the AI sentiment engine.

<div style="page-break-after: always;"></div>

## 6. API Endpoint Documentation

The backend exposes a comprehensive RESTful API for client operations alongside the WebSocket endpoints.

### 6.1 Candidate Matching & PDF Processing
* `POST /api/candidates/student/upload-resume/{id}`
  * Accepts `multipart/form-data` containing a PDF file. Executes PDFBox extraction, saves the raw text, and triggers an immediate AI re-calculation.
* `GET /api/candidates/match/{roleId}`
  * Triggers the AI Engine to rank the entire student database against a specific role, returning a sorted list of `StudentMatchResult` DTOs containing score rings and reasoning.

### 6.2 Chat & Interactions
* `GET /api/chat/history?id1={id}&id2={id}`
  * Retrieves chronological message history between two specific users.
* `POST /api/chat/send`
  * REST fallback for sending chat messages if the WebSocket connection degrades.

### 6.3 Analytics
* `GET /api/analytics/company/{companyId}`
  * Aggregates total views, applications, and bookmarks by analyzing the `Interaction` ledger, returning statistical payloads for the Recharts frontend.

<div style="page-break-after: always;"></div>

## 7. Deployment Strategy & Future Roadmap

To transition this application from a local development environment to a globally accessible production platform, a structured deployment pipeline is required.

### 7.1 Containerization (Docker)
Both the frontend and backend will be isolated into lightweight Docker containers:
* **Backend:** A multi-stage Maven build resulting in a streamlined Eclipse Temurin JRE container.
* **Frontend:** Utilizing Next.js `output: 'standalone'` to create an ultra-optimized Node.js container stripped of unnecessary dependencies.

### 7.2 Google Cloud Run Deployment
The containers will be deployed to **Google Cloud Run**, providing:
* **Serverless Auto-scaling:** The platform will automatically scale from zero to thousands of instances based on traffic spikes (e.g., during university hiring fairs).
* **Dynamic Routing:** Hardcoded `localhost` references will be replaced with injected environment variables (`NEXT_PUBLIC_API_URL` and Spring Boot `$PORT`).

### 7.3 Future Enhancements
1. **Cloud SQL Migration:** Transitioning the ephemeral H2 database to a highly available Google Cloud SQL PostgreSQL instance.
2. **Object Storage:** Offloading the physical PDF files to Google Cloud Storage (GCS) to allow recruiters to view the original formatted resumes alongside the parsed AI text.
3. **LLM Integration:** Upgrading the rules-based keyword AI engine by routing the parsed PDF text and chat histories through external Large Language Models (like OpenAI GPT-4 or Google Gemini) for unparalleled semantic understanding and candidate evaluation.

---
*End of Document*
