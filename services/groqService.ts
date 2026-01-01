
import { ResumeData } from '../types';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

interface TailoredResponse {
    optionA: ResumeData;
    optionB: ResumeData;
    critique: string;
}

export const tailorResume = async (currentResume: ResumeData, jobDescription: string): Promise<TailoredResponse> => {
    if (!GROQ_API_KEY) {
        throw new Error("Missing Groq API Key");
    }

    const prompt = `
    You are an expert Resume Strategist.
    
    **TASK:**
    Analyze the RESUME and the JOB DESCRIPTION (JD).
    Then, generate **TWO tailored versions** of the resume content and a critique.

    **1. CRITIQUE ("The Roast")**
    - Be brutally honest. Identify buzzwords, weak metrics, and generic phrasing.
    - Max 3 bullet points.

    **2. OPTION A ("Conservative Match")**
    - High keyword matching.
    - Professional, standard tone.
    - Focus on stability and hard skills.

    **3. OPTION B ("Bold & Action-Oriented")**
    - Executive/Leader tone.
    - Strong STAR-method bullet points.
    - Emphasize impact, results, and confidence.

    **4. OPTION A & B DETAILS:**
    - **Option A (Conservative)**: Professional, standard tone. Matching cover letter emphasizes reliability and experience.
    - **Option B (Bold)**: Executive/Leader tone. Matching cover letter is confident, succinct, and value-driven.

    **REQUIRED OUTPUT FORMAT (JSON):**
    You must return a JSON object with this EXACT structure. 
    **IMPORTANT:** For 'optionA' and 'optionB', return the *Full* updated objects for 'personalInfo', 'experience', 'skills', and 'projects'.
    Also include a **Full Cover Letter** object for each option.
    
    {
      "critique": "string",
      "optionA": {
        "personalInfo": { ...keep existing, update 'summary' to match JD... },
        "skills": [ 
           { "name": "Technical/Hard Skills", "items": "Java, Python, React, TypeScript (Comma separated)" },
           { "name": "Soft Skills", "items": "Leadership, Communication, problem-solving" }
        ],
        "experience": [ ...rewritten descriptions to match JD... ],
        "projects": [ ...rewritten descriptions... ],
        "coverLetter": {
            "recipientName": "Hiring Manager",
            "recipientTitle": "Hiring Manager",
            "companyName": "[Company Name from JD]",
            "companyAddress": "[Address or City from JD]",
            "date": "Today's Date",
            "content": "[Highly tailored 3-4 paragraph cover letter matching the tone of Option A]"
        }
      },
      "optionB": { 
          // ...Same structure as Option A but with bold/executive content and bold cover letter... 
          "coverLetter": { ... }
      }
    }

    RESUME DATA:
    ${JSON.stringify(currentResume)}

    JOB DESCRIPTION:
    ${jobDescription}
  `;

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: [{ role: 'user', content: prompt }],
                model: 'llama-3.3-70b-versatile',
                temperature: 0.5,
                response_format: { type: "json_object" }
            })
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`Groq API Error: ${err}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content;
        const parsed = JSON.parse(content);

        // Helper to merge results safely
        const mergeSafe = (base: ResumeData, newVariant: any): ResumeData => {
            if (!newVariant) return base;
            return {
                ...base,
                personalInfo: { ...base.personalInfo, ...(newVariant.personalInfo || {}) },
                skills: newVariant.skills && Array.isArray(newVariant.skills) ? newVariant.skills : base.skills,
                experience: newVariant.experience && Array.isArray(newVariant.experience) ? newVariant.experience : base.experience,
                projects: newVariant.projects && Array.isArray(newVariant.projects) ? newVariant.projects : base.projects,
                // Preserve others
                education: base.education,
                customSections: base.customSections,
                sectionOrder: base.sectionOrder,
                design: base.design,
                // Update Cover Letter if provided, otherwise keep base
                coverLetter: newVariant.coverLetter || base.coverLetter
            };
        };

        return {
            optionA: mergeSafe(currentResume, parsed.optionA),
            optionB: mergeSafe(currentResume, parsed.optionB),
            critique: parsed.critique || "Review complete."
        };

    } catch (error) {
        console.error("AI Tailoring Failed:", error);
        throw error;
    }
};

export const refineResume = async (currentResume: ResumeData, instruction: string): Promise<ResumeData> => {
    if (!GROQ_API_KEY) throw new Error("Missing Groq API Key");

    const prompt = `
    You are an expert Resume Editor working in a conversational refinement loop.
    
    **TASK:**
    Update the RESUME DATA based strictly on the USER INSTRUCTION.
    
    **USER INSTRUCTION:**
    "${instruction}"

    **GUIDELINES:**
    - Only modify the fields relevant to the instruction.
    - Keep the rest of the data exactly as is.
    - If the user asks for a specific tone (e.g. "arrogant", "funny", "professional"), adopt it ONLY for the content rewriting.
    
    **STRUCTURAL CHANGES (Adding Sections):**
    - If the user asks to add a NEW section (e.g. "Add a Certificates section"), you MUST:
      1. Create a new entry in 'customSections' with a unique ID (e.g. "custom-certificates").
      2. Add that same ID to the 'sectionOrder' array where it belongs.
    
    **OUTPUT FORMAT (JSON ONLY):**
    Return the fully valid ResumeData JSON object.

    RESUME DATA:
    ${JSON.stringify(currentResume)}
    `;

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: [{ role: 'user', content: prompt }],
                model: 'llama-3.3-70b-versatile',
                temperature: 0.5,
                response_format: { type: "json_object" }
            })
        });

        if (!response.ok) throw new Error(await response.text());

        const data = await response.json();
        const content = data.choices[0].message.content;
        const refined = JSON.parse(content);

        // Merge logic same as above
        return {
            ...currentResume,
            personalInfo: { ...currentResume.personalInfo, ...refined.personalInfo },
            skills: refined.skills || currentResume.skills,
            experience: refined.experience || currentResume.experience,
            projects: refined.projects || currentResume.projects,
            education: refined.education || currentResume.education,

            // Allow AI to add/modify custom sections (e.g. "Certificates")
            customSections: refined.customSections || currentResume.customSections,
            // Allow AI to update order if new sections are added
            sectionOrder: refined.sectionOrder && Array.isArray(refined.sectionOrder) ? refined.sectionOrder : currentResume.sectionOrder,

            design: currentResume.design,
            coverLetter: refined.coverLetter || currentResume.coverLetter
        };
    } catch (error) {
        console.error("Refinement Failed:", error);
        throw error;
    }
};
