
import { ResumeData, Experience, Education, Project } from '../types';
import { generateId } from '../utils';

// --- Regex Patterns ---

// Section Headers
const SECTIONS = {
    experience: /^(?:experience|work experience|professional experience|employment|work history|career history)\s*:?$/i,
    education: /^(?:education|academic background|qualifications|education & credentials)\s*:?$/i,
    skills: /^(?:skills|technical skills|technologies|core competencies|technical expertise|skills & expertise)\s*:?$/i,
    projects: /^(?:projects|relevant projects|technical projects|personal projects|key projects)\s*:?$/i,
    summary: /^(?:summary|professional summary|profile|about me|executive summary|objective)\s*:?$/i
};

const JOB_TITLES = [
  'engineer', 'developer', 'manager', 'director', 'consultant', 'analyst', 
  'architect', 'admin', 'administrator', 'specialist', 'designer', 'lead', 
  'head', 'vp', 'president', 'officer', 'counsel', 'intern', 'assistant',
  'representative', 'coordinator', 'scientist', 'researcher'
];

const DATE_REGEX = /((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*'?\d{2,4}|(?:\d{1,2}[\/\.]\d{2,4}))\s*[-–to]+\s*((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*'?\d{2,4}|(?:\d{1,2}[\/\.]\d{2,4})|present|current|now)|\b(19|20)\d{2}\s*[-–]\s*(19|20)\d{2}\b/i;
const YEAR_REGEX = /\b(19|20)\d{2}\b/;

const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
const PHONE_REGEX = /\b(?:\+?\d{1,3}[-. \s]?)?\(?\d{3}\)?[-. \s]?\d{3}[-. \s]?\d{4}\b/;
const LINKEDIN_REGEX = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/(?:in\/|[a-z]{2}\/)?([a-zA-Z0-9_-]+)\/?/i;
const GITHUB_REGEX = /(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_-]+)\/?/i;

// Regex for GPA and Coursework
const GPA_REGEX = /GPA\s*:?\s*(\d\.\d{1,2})/i;
const COURSEWORK_REGEX = /(?:relevant )?coursework\s*:?\s*(.*)/i;

// --- Helpers ---

const isBullet = (line: string) => /^[\s\u2022\u2023\u25E6\u2043\u2219\*\-\u25C6]/.test(line);
const cleanBullet = (line: string) => line.replace(/^[\s\u2022\u2023\u25E6\u2043\u2219\*\-\u25C6]+/, '').trim();
const hasJobTitle = (line: string) => JOB_TITLES.some(title => line.toLowerCase().includes(title));

const getSectionType = (line: string): string | null => {
    const clean = line.toLowerCase().trim();
    if (clean.length > 50) return null; 
    
    if (SECTIONS.experience.test(clean)) return 'experience';
    if (SECTIONS.education.test(clean)) return 'education';
    if (SECTIONS.skills.test(clean)) return 'skills';
    if (SECTIONS.projects.test(clean)) return 'projects';
    if (SECTIONS.summary.test(clean)) return 'summary';
    
    return null;
};

// --- Main Parser ---

export const parseResumeWithRegex = (text: string): ResumeData => {
    const rawLines = text.split('\n').map(l => l.trim()).filter(l => l);
    
    // Fix: Missing 'design' and 'coverLetter' properties in the initial data object.
    const data: ResumeData = {
        personalInfo: { fullName: '', email: '', phone: '', location: '', openToRelocate: false, linkedin: '', github: '', summary: '' },
        skills: '',
        experience: [],
        education: [],
        projects: [],
        customSections: [],
        sectionOrder: ['summary', 'skills', 'experience', 'projects', 'education'],
        design: { template: 'modern', font: 'serif', accentColor: '#1e40af', spacing: 'normal' },
        coverLetter: {
            recipientName: '', recipientTitle: '', companyName: '', companyAddress: '',
            date: new Date().toLocaleDateString(), content: ''
        }
    };

    // --- STEP 1: Extract & Clean Contact Info (First Pass) ---
    
    const emailMatch = text.match(EMAIL_REGEX);
    if (emailMatch) data.personalInfo.email = emailMatch[0];

    const phoneMatch = text.match(PHONE_REGEX);
    if (phoneMatch) data.personalInfo.phone = phoneMatch[0];

    const linkedinMatch = text.match(LINKEDIN_REGEX);
    if (linkedinMatch) data.personalInfo.linkedin = `linkedin.com/in/${linkedinMatch[1]}`;

    const githubMatch = text.match(GITHUB_REGEX);
    if (githubMatch) data.personalInfo.github = `github.com/${githubMatch[1]}`;

    // Name Heuristic
    for (const line of rawLines.slice(0, 10)) {
        if (getSectionType(line)) break;
        if (line.includes('@') || PHONE_REGEX.test(line)) continue;
        if (line.toLowerCase().includes('resume') || line.toLowerCase().includes('cv')) continue;
        if (line.length < 40) {
            data.personalInfo.fullName = line;
            break;
        }
    }

    // Location Heuristic: Look for City, State pattern in top lines (e.g. New York, NY or Boston, MA)
    // This is simple and prone to false positives but covers common cases.
    const locationRegex = /([A-Z][a-zA-Z\s]+),\s*([A-Z]{2})/;
    for (const line of rawLines.slice(0, 15)) {
         if (getSectionType(line)) break;
         const match = line.match(locationRegex);
         if (match) {
             // Avoid matching "University of, CA" or similar if possible, but hard without NLP
             if (line.length < 50 && !line.includes('University') && !line.includes('College')) {
                 data.personalInfo.location = match[0];
                 break;
             }
         }
    }

    // --- STEP 2: Filter Lines ---
    const lines = rawLines.filter(line => {
        if (/page \d+ of \d+/i.test(line)) return false;
        if (data.personalInfo.email && line.includes(data.personalInfo.email)) return false;
        if (data.personalInfo.phone && line.includes(data.personalInfo.phone)) return false;
        if (data.personalInfo.linkedin && line.includes(data.personalInfo.linkedin)) return false;
        if (/^(email|phone|mobile|address|location):/i.test(line)) return false;
        return true;
    });

    // --- STEP 3: State Machine Parsing ---

    let currentSection = 'summary'; 
    let expBuffer: Partial<Experience> = {};
    let expDesc: string[] = [];
    
    let projBuffer: Partial<Project> = {};
    let projDesc: string[] = [];

    let eduBuffer: Partial<Education> = {};

    const flushExperience = () => {
        if (expBuffer.company || expBuffer.role) {
            data.experience.push({
                id: generateId(),
                company: expBuffer.company || 'Company',
                role: expBuffer.role || 'Role',
                duration: expBuffer.duration || '',
                description: expDesc.join('\n')
            });
        }
        expBuffer = {};
        expDesc = [];
    };

    const flushProject = () => {
        if (projBuffer.name) {
            data.projects.push({
                id: generateId(),
                name: projBuffer.name,
                technologies: projBuffer.technologies || '',
                link: projBuffer.link || '',
                description: projDesc.join('\n')
            });
        }
        projBuffer = {};
        projDesc = [];
    };

    const flushEducation = () => {
        if (eduBuffer.school) {
            data.education.push({
                id: generateId(),
                school: eduBuffer.school,
                degree: eduBuffer.degree || '',
                year: eduBuffer.year || '',
                gpa: eduBuffer.gpa,
                coursework: eduBuffer.coursework
            });
        }
        eduBuffer = {};
    };

    const switchSection = (newSection: string) => {
        if (currentSection === 'experience') flushExperience();
        if (currentSection === 'projects') flushProject();
        if (currentSection === 'education') flushEducation();
        currentSection = newSection;
    };

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        const sectionType = getSectionType(line);
        if (sectionType) {
            switchSection(sectionType);
            continue; 
        }

        if (currentSection === 'summary') {
            if (line !== data.personalInfo.fullName) {
                if (line.length > 2) {
                     data.personalInfo.summary += (data.personalInfo.summary ? ' ' : '') + line;
                }
            }
        } 
        
        else if (currentSection === 'skills') {
            const clean = cleanBullet(line);
            if (clean.length > 1) {
                data.skills += (data.skills ? ', ' : '') + clean;
            }
        }

        else if (currentSection === 'experience') {
            const isDate = DATE_REGEX.test(line);
            const isTitle = hasJobTitle(line);
            
            if (isDate) {
                if (expBuffer.company && expDesc.length > 0) flushExperience();
                
                const dateStr = line.match(DATE_REGEX)?.[0] || '';
                expBuffer.duration = dateStr;

                const remainder = line.replace(DATE_REGEX, '').trim().replace(/^[-–|,\s]+/, '').replace(/[-–|,\s]+$/, '');
                if (remainder.length > 2) {
                     if (hasJobTitle(remainder)) expBuffer.role = remainder;
                     else expBuffer.company = remainder;
                }

                if (!expBuffer.company || !expBuffer.role) {
                     const prev = lines[i-1];
                     if (prev && !isBullet(prev) && !getSectionType(prev)) {
                         if (!expBuffer.company) expBuffer.company = prev;
                         else if (!expBuffer.role) expBuffer.role = prev;
                     }
                }
            } 
            else if (isTitle && !isBullet(line) && line.length < 80) {
                 if (expBuffer.role && expDesc.length > 0) flushExperience();
                 expBuffer.role = line;
            }
            else if (isBullet(line)) {
                expDesc.push(cleanBullet(line));
            }
            else {
                if (!expBuffer.company && !expBuffer.role && expDesc.length === 0) {
                    if (line.length < 60) expBuffer.company = line;
                } else {
                    expDesc.push(line);
                }
            }
        }

        else if (currentSection === 'projects') {
             const isUrl = line.includes('http') || line.includes('github.com');
             const isBul = isBullet(line);
             const isLikelyTitle = !isUrl && !isBul && line.length < 50 && !line.trim().endsWith('.');
             
             if (isLikelyTitle) {
                 if (projBuffer.name && (projDesc.length > 0 || projBuffer.technologies)) {
                     flushProject();
                 }

                 if (!projBuffer.name) {
                     if (line.includes('|')) {
                         const parts = line.split('|');
                         projBuffer.name = parts[0].trim();
                         projBuffer.technologies = parts.slice(1).join(', ').trim();
                     } else {
                         projBuffer.name = line;
                     }
                     continue;
                 }
             }

             if (isUrl) {
                 projBuffer.link = line;
             } else if (isBul) {
                 projDesc.push(cleanBullet(line));
             } else {
                 if (!projBuffer.technologies && (line.toLowerCase().startsWith('tech') || line.toLowerCase().includes('stack:'))) {
                     projBuffer.technologies = line.replace(/^(technologies|tech stack|tech):?/i, '').trim();
                 } else if (projBuffer.name) {
                     projDesc.push(line);
                 }
             }
        }

        else if (currentSection === 'education') {
            const isDate = DATE_REGEX.test(line) || YEAR_REGEX.test(line);
            
            if (line.toLowerCase().includes('university') || line.toLowerCase().includes('college') || line.toLowerCase().includes('school')) {
                if (eduBuffer.school) flushEducation();
                eduBuffer.school = line;
            } 
            else if (isDate) {
                 eduBuffer.year = line.match(DATE_REGEX)?.[0] || line.match(YEAR_REGEX)?.[0] || line;
            }
            else if (GPA_REGEX.test(line)) {
                eduBuffer.gpa = line.match(GPA_REGEX)?.[1];
            }
            else if (COURSEWORK_REGEX.test(line)) {
                eduBuffer.coursework = line.match(COURSEWORK_REGEX)?.[1];
            }
            else if (/bachelor|master|phd|associate|bs|ba|ms|ma|degree/i.test(line)) {
                eduBuffer.degree = line;
            }
            else {
                if (eduBuffer.school && !eduBuffer.degree) {
                    eduBuffer.degree = line;
                }
            }
        }
    }

    if (currentSection === 'experience') flushExperience();
    if (currentSection === 'projects') flushProject();
    if (currentSection === 'education') flushEducation();

    data.skills = data.skills.replace(/,\s*,/g, ',').replace(/\s+/g, ' ').trim();

    return data;
};
