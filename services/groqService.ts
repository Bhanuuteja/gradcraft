
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
    You are a **RUTHLESS & BRUTAL Resume Critic**. 
    
    **PART 1: THE ROAST**
    First, analyze the provided RESUME DATA against the JOB DESCRIPTION.
    Be mean. Be honest. Tell the candidate exactly why they wouldn't get hired. 
    Call out generic buzzwords, weak metrics, or lack of focus. 
    (Max 3 concise, savage bullet points).

    **PART 2: THE FIX**
    Tailor the resume to match the JD and provide **TWO DISTINCT VARIATIONS**.

    **VARIATION A: "Conservative Match"**
    - Focus on direct keyword matching.
    - Keep tone professional, safe, and factual.
    - Prioritize exact skill matches from the JD.

    **VARIATION B: "Bold & Action-Oriented"**
    - Use strong action verbs and executive language.
    - Rewrite bullet points to be achievement-focused (STAR method).
    - Highlight leadership and impact.

    **OUTPUT FORMAT (JSON ONLY):**
    Return a single JSON object with three keys: "optionA", "optionB", and "critique".
    
    Example:
    {
      "critique": "1. Your summary is boring. 2. No metrics in experience. 3. Skills are a mess.",
      "optionA": { ...resumeData... },
      "optionB": { ...resumeData... }
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
        const parsed: { optionA: ResumeData, optionB: ResumeData, critique: string } = JSON.parse(content);

        // Helper to merge results safely
        const mergeSafe = (base: ResumeData, newVariant: Partial<ResumeData>): ResumeData => ({
            ...base,
            personalInfo: { ...base.personalInfo, ...newVariant.personalInfo },
            skills: newVariant.skills || base.skills,
            experience: newVariant.experience || base.experience,
            projects: newVariant.projects || base.projects,
            education: newVariant.education || base.education,
            title: newVariant.title || base.title, // Keep or update title if AI suggests
            // Preserve other fields
            customSections: base.customSections,
            sectionOrder: base.sectionOrder,
            design: base.design,
            coverLetter: base.coverLetter
        });

        return {
            optionA: mergeSafe(currentResume, parsed.optionA),
            optionB: mergeSafe(currentResume, parsed.optionB),
            critique: parsed.critique || "Your resume was too boring to even roast."
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
            title: refined.title || currentResume.title,
            customSections: currentResume.customSections,
            sectionOrder: currentResume.sectionOrder,
            design: currentResume.design,
            coverLetter: currentResume.coverLetter
        };
    } catch (error) {
        console.error("Refinement Failed:", error);
        throw error;
    }
};
