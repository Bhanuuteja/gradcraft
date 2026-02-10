# GradCraft 🎓
**Category:** Productivity & AI | **Status:** Production

> "The thoughtful way to build your resume. Write clearly. Score higher. Get hired."

**GradCraft** is a production-grade SaaS platform designed to solve the "black hole" of ATS rejections. It empowers students and job seekers to generate ATS-optimized, professionally formatted resumes and cover letters with a single click.

Unlike generic builders that focus on moving pixels, GradCraft focuses on **strategy**. It leverages **Groq AI (Llama 3)** to analyze Job Descriptions in real-time and rewrite resume content to match the specific keywords, tone, and requirements of the role.

![GradCraft Hero](https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&q=80&w=1000)

## 🚀 Key Features

### 🧠 AI-Powered Optimization (Groq)
- **Contextual Tailoring**: Analyzes your base resume against a specific Job Description.
- **Dual-Mode Output**: Generates two distinct variations:
    - **Option A (Conservative)**: Maximizes keyword matching and safety.
    - **Option B (Bold)**: Adopts an executive, results-driven tone.
- **"Brutal" Critique**: Provides an honest, AI-generated roast of your resume's weaknesses before you apply.

### 📄 Precision PDF Rendering
- **ATS-Proof**: Generates clean, single-column layouts that parse perfectly in Applicant Tracking Systems (Greenhouse, Lever, Workday).
- **No Design Headaches**: Replaces manual formatting with structured data entry. The platform handles typography, spacing, and layout automatically.

### 📊 Application Command Center
- **Full-Cycle Tracking**: A unified dashboard to track every application status (Applied → Interviewing → Offer).
- **Version Control**: Links specific resume versions to the exact job description they were tailored for, so you never lose context for an interview.

## 🛠️ Technical Architecture

This project was built to demonstrate a full-stack production environment using modern web technologies.

- **Frontend**: `React`, `TypeScript`, `Tailwind CSS`, `Framer Motion` (for 3D interactions).
- **Backend & Auth**: `Supabase` (PostgreSQL) for secure user authentication and JSONB data persistence.
- **AI Engine**: `Groq SDK` accessing `Llama-3-70b` for ultra-fast inference and text generation.
- **Deployment**: `Vercel` (CI/CD integration via GitHub).

## 💡 Challenges & Solutions

### 1. The "Hallucination" Problem
**Challenge**: Early AI models would invent experiences to please the Job Description.
**Solution**: Implemented a "Strict-Constraint" prompt engineering layer that forces the AI to only *rewrite* existing experiences using the STAR method, rather than inventing new ones.

### 2. PDF Consistency
**Challenge**: HTML-to-PDF conversion often breaks layout or text selection, confusing ATS parsers.
**Solution**: Developed a custom print-css engine that enforces strict page breaks, legible typography (Inter/Merriweather), and accessible semantic structure ensuring 100% parse rates.

### 3. State Management at Scale
**Challenge**: Managing complex nested resume data (sections, items, skills) with real-time editing.
**Solution**: Built a robust local-first state architecture that syncs to Supabase in the background (debounced auto-save), ensuring users never lose work even on unstable connections.

## 🔗 Links
- **Live Demo**: [gradcraft.vercel.app](https://gradcraft.vercel.app/)
- **GitHub**: [github.com/bhanuuteja](https://github.com/bhanuuteja)
