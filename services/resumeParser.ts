import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import { ResumeData, Experience, Education, Project } from '../types';
import { generateId } from '../utils';

// Set worker source for pdfjs
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

interface ParsedResume {
    text: string;
    data: Partial<ResumeData>;
}

export const extractTextFromPdf = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();

        // Improved: Join with newlines to preserve structure better than space
        // This helps in detecting headers which are usually on their own lines
        const pageText = textContent.items.map((item: any) => item.str).join('\n');
        fullText += pageText + '\n';
    }

    return fullText;
};

export const extractTextFromDocx = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
};

export const parseResumeText = (text: string): Partial<ResumeData> => {
    const data: Partial<ResumeData> = {
        personalInfo: {
            fullName: '',
            email: '',
            phone: '',
            location: '',
            openToRelocate: false,
            linkedin: '',
            github: '',
            portfolio: '',
            summary: ''
        },
        skills: [{ name: 'Technical Skills', items: '' }],
        experience: [],
        education: [],
        projects: []
    };

    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    // --- 1. Global Extraction (Email, Phone, Links) ---
    const emailRegex = /[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}/;
    const phoneRegex = /(\+?\d{1,2}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
    const linkedinRegex = /linkedin\.com\/in\/[a-zA-Z0-9-]+/;
    const githubRegex = /github\.com\/[a-zA-Z0-9-]+/;

    // We search the raw text for these patterns
    const emailMatch = text.match(emailRegex);
    if (emailMatch) data.personalInfo!.email = emailMatch[0];

    const phoneMatch = text.match(phoneRegex);
    if (phoneMatch) data.personalInfo!.phone = phoneMatch[0];

    const linkedinMatch = text.match(linkedinRegex);
    if (linkedinMatch) data.personalInfo!.linkedin = linkedinMatch[0];

    const githubMatch = text.match(githubRegex);
    if (githubMatch) data.personalInfo!.github = githubMatch[0];

    // Portfolio: simplified check
    const urlMatches = text.matchAll(/https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g);
    for (const match of urlMatches) {
        const url = match[0];
        if (!url.includes('linkedin') && !url.includes('github')) {
            data.personalInfo!.portfolio = url;
            break;
        }
    }

    // Name Heuristic: The first non-empty line that isn't a known header
    if (lines.length > 0) {
        const firstLine = lines[0];
        if (firstLine.length < 50 && !firstLine.includes('@')) {
            data.personalInfo!.fullName = firstLine;
        }
    }

    // --- 2. Section Parsing ---
    // Define headers and buckets
    let currentSection: 'none' | 'summary' | 'skills' | 'experience' | 'projects' | 'education' = 'none';
    const sections: Record<string, string[]> = {
        summary: [],
        skills: [],
        experience: [],
        projects: [],
        education: []
    };

    const headerPatterns = {
        summary: /^(professional )?summary|profile|objective$/i,
        skills: /^skills|technologies|technical skills|core competencies$/i,
        experience: /^experience|work history|employment|work experience$/i,
        projects: /^projects|personal projects|portfolio$/i,
        education: /^education|academic background|qualifications$/i
    };

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Check if line is a header
        let isHeader = false;
        if (line.length < 50) { // Headers are usually short
            for (const [key, regex] of Object.entries(headerPatterns)) {
                if (regex.test(line.toLowerCase())) {
                    currentSection = key as any;
                    isHeader = true;
                    break;
                }
            }
        }

        if (!isHeader && currentSection !== 'none') {
            sections[currentSection].push(line);
        }
    }

    // --- 3. Map Sections to Data ---

    // Summary
    if (sections.summary.length > 0) {
        data.personalInfo!.summary = sections.summary.join('\n');
    }

    // Skills
    if (sections.skills.length > 0) {
        // Try to detect if skills are comma separated or newlines
        // Just join them all for now
        data.skills![0].items = sections.skills.join(', ');
    }

    // Experience
    // Without AI, it's hard to separate multiple jobs.
    // We will dump the "Experience" text into a single block for the user to edit.
    if (sections.experience.length > 0) {
        const rawExp = sections.experience.join('\n');
        // Heuristic: If we find clear delimiters like dates, we could split, but for now safe to dump.
        const newExp: Experience = {
            id: generateId(),
            company: 'Imported Experience',
            role: 'Please Edit',
            duration: '',
            description: rawExp
        };
        data.experience!.push(newExp);
    }

    // Projects
    if (sections.projects.length > 0) {
        const rawProj = sections.projects.join('\n');
        const newProj: Project = {
            id: generateId(),
            name: 'Imported Projects',
            technologies: '',
            link: '',
            description: rawProj
        };
        data.projects!.push(newProj);
    }

    // Education
    if (sections.education.length > 0) {
        const rawEdu = sections.education.join('\n');
        const newEdu: Education = {
            id: generateId(),
            school: 'Imported Education',
            degree: '',
            year: '',
            coursework: rawEdu // Reuse coursework field to show the raw text
        };
        data.education!.push(newEdu);
    }

    return data;
};

export const parseResumeFile = async (file: File): Promise<Partial<ResumeData>> => {
    let text = '';
    if (file.type === 'application/pdf') {
        text = await extractTextFromPdf(file);
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        text = await extractTextFromDocx(file);
    } else {
        throw new Error('Unsupported file type. Please upload PDF or DOCX.');
    }

    return parseResumeText(text);
};
