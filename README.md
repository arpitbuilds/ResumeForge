# ResumeForge AI 🚀

A modern, full-stack, AI-powered Resume Builder that dynamically matches your profile against Applicant Tracking Systems (ATS) and specific job descriptions using the **Google Gemini** language model.

## 🌟 Core Features

- **Smart ATS Analyzer**: Evaluates resumes in real-time, providing a 0-100 match score with tailored strengths and missing keyword suggestions.
- **Job Description Matcher**: Compare your resume securely against pasted LinkedIn/Indeed job postings to discover exactly which required skills are missing.
- **AI Content Generator**: Automatically enhances your Professional Summary and Experience bullets on the fly using professional, action-oriented verbs via Google Gemini.
- **AI PDF Parser (Advanced Schema)**: Upload existing PDF resumes, and the AI will extract dense, unstructured data (including Experience, Education, Technical Skills, Projects, Certifications, GitHub, and LeetCode) directly into structured, editable UI Forms.
- **Live View WebSockets & Tracking**: Generate company-specific public tracking links (e.g. `?ref=Google`). When an employer opens your resume, you instantly receive a real-time push notification via `Socket.io`.
- **Persistent Database Notifications**: Offline? No problem. The backend stores view history in an isolated Notification MongoDB collection, accessible via a dynamic Bell icon dropdown in your Navbar.
- **Premium Dark Theme & Multiple Templates**: A gorgeous, minimalist dark theme built entirely with Tailwind CSS. Includes 4 distinct render templates (Classic, Modern, Minimal, MinimalImage) ensuring the editor remains sleek while natively exporting a clean, white, ATS-friendly PDF.
- **Secure Authentication & Storage**: Complete registration and login system with bcrypt handling deeply nested JSON document structures, paired with ImageKit for rapid profile photo hosting.

## 🛠️ Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, Redux Toolkit, Socket.io-client, Lucide React
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), Socket.io, JSON Web Tokens (JWT)
- **AI Integration**: Google Gemini (`@google/genai`)
- **Cloud Storage**: ImageKit

## 🚀 Running Locally

### Prerequisites
- Node.js (v18+ recommended)
- A MongoDB cluster (Atlas or local)
- A Google Gemini API Key
- ImageKit public/private keys

### 1. Backend Setup
1. Open the `server` directory in your terminal.
2. Rename `.env-example` to `.env` and fill in your keys.
3. Install dependencies: `npm install`
4. Start the development server: `npm run server` (runs on `http://localhost:4000` via nodemon).

### 2. Frontend Setup
1. Open the `client` directory in your terminal.
2. Ensure your `VITE_BASE_URL` in `client/.env` points to your backend.
3. Install dependencies: `npm install`
4. Start the frontend server: `npm run dev`
