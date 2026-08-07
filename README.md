# ResumeForge

A full-stack resume builder that matches user profiles against Applicant Tracking Systems (ATS) and specific job descriptions using the Google Gemini API.

## Core Features

- **ATS Analyzer**: Evaluates resumes to provide a match score (0-100), highlighting existing strengths and suggesting missing keywords.
- **Job Description Matcher**: Compares the current resume against pasted job postings to identify missing required skills.
- **Content Generator**: Uses Google Gemini to suggest improvements and action verbs for the Professional Summary and Experience bullet points.
- **PDF Parser**: Extracts data from uploaded PDF resumes (including Experience, Education, Technical Skills, Projects, and Certifications) and populates the application's forms.
- **View Tracking & Notifications**: Allows users to generate company-specific tracking links (e.g., `?ref=Google`). When the link is opened, the user receives a real-time push notification via `Socket.io`.
- **Notification History**: Stores resume view history in a MongoDB collection, accessible from the navigation bar for users who were offline during the view.
- **Templates & Export**: Built with Tailwind CSS. Includes four export templates (Classic, Modern, Minimal, MinimalImage) that generate standard, ATS-friendly PDFs.
- **Authentication & Storage**: User registration and login system using bcrypt and JWT, with ImageKit integration for profile photo hosting.

## Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, Redux Toolkit, Socket.io-client, Lucide React
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), Socket.io, JSON Web Tokens (JWT)
- **AI Integration**: Google Gemini (`@google/genai`)
- **Cloud Storage**: ImageKit

## Running Locally

### Prerequisites
- Node.js (v18+ recommended)
- A MongoDB cluster (Atlas or local)
- A Google Gemini API Key
- ImageKit public/private keys

### 1. Backend Setup
1. Open the `server` directory in your terminal.
2. Rename `.env-example` to `.env` and fill in your keys and environment variables.
3. Install dependencies: `npm install`
4. Start the development server: `npm run server` (runs on `http://localhost:4000` via nodemon).

### 2. Frontend Setup
1. Open the `client` directory in your terminal.
2. Ensure your `VITE_BASE_URL` in `client/.env` points to your local backend.
3. Install dependencies: `npm install`
4. Start the frontend server: `npm run dev`
