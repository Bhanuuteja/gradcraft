export const gradCraftProject = {
    id: 'grad-craft',
    title: 'GradCraft',
    category: 'Productivity & AI',
    description: 'A production-grade, ATS-free resume builder featuring AI-powered JD optimization (Groq), precision PDF generation, and full-cycle application tracking.',
    longDescription: 'GradCraft is a production-level SaaS platform designed to solve the "black hole" of ATS rejections. Unlike generic builders that focus on moving pixels, GradCraft focuses on strategy. It leverages Groq AI (Llama 3) to analyze generic resumes against specific Job Descriptions in real-time, effectively rewriting them to match the keywords, tone, and requirements of the role. The platform features two distinct AI modes ("Conservative" text matching vs. "Bold" executive tone), a "Brutal" resume roaster, and a custom print engine ensuring 100% ATS-parseable PDFs. All tracking data is persisted via Supabase, creating a unified command center for the job search process.',
    challenges: [
        'Mitigating AI Hallucinations: Implemented a "Strict-Constraint" prompt engineering layer to force Llama-3 to rewrite existing experiences using the STAR method without inventing false facts.',
        'Precision PDF Rendering: Overcame HTML-to-PDF layout shifts by building a custom print-css engine that enforces strict page breaks and semantic structure for ATS parsers.',
        'Real-time State Management: Architected a robust local-first state machine that syncs complex nested JSON data (sections, items, skills) to Supabase with debounced persistence.'
    ],
    features: [
        'GD-Optimized Resume & Cover Letter generation using Groq AI (Llama 3 70B).',
        'Dual-Mode AI Output: Option A (Safe Match) vs. Option B (Bold Executive).',
        '"Brutal" AI Critique engine that identifies red flags before application.',
        'Background LaTeX-style PDF compilation for professional, ATS-proof formatting.',
        'Integrated Application Tracking Dashboard (Kanban style statuses).',
        'Full-stack architecture with Supabase Auth & Database (JSONB storage).'
    ],
    image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&q=80&w=1000',
    technologies: ['React', 'TypeScript', 'Supabase', 'Groq AI', 'Tailwind CSS', 'Framer Motion', 'Vite', 'Vercel'],
    githubLink: 'https://github.com/bhanuuteja',
    liveLink: 'https://gradcraft.vercel.app/',
    videoLink: ''
};
