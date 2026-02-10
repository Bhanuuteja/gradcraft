
import { ResumeData, ATSScoreResult } from '../types';

// Common stop words to ignore when extracting keywords
const STOP_WORDS = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'if', 'then', 'else', 'when',
    'at', 'by', 'for', 'from', 'in', 'into', 'of', 'off', 'on', 'onto',
    'out', 'over', 'to', 'up', 'with', 'is', 'are', 'was', 'were', 'be',
    'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
    'would', 'shall', 'should', 'can', 'could', 'may', 'might', 'must',
    'i', 'you', 'he', 'she', 'it', 'we', 'they', 'my', 'your', 'his',
    'her', 'its', 'our', 'their', 'this', 'that', 'these', 'those',
    'what', 'which', 'who', 'whom', 'whose', 'where', 'why', 'how',
    'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other',
    'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so',
    'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don',
    'should', 'now', 'd', 'll', 'm', 'o', 're', 've', 'y', 'ain', 'aren',
    'couldn', 'didn', 'doesn', 'hadn', 'hasn', 'haven', 'isn', 'ma',
    'mightn', 'mustn', 'needn', 'shan', 'shouldn', 'wasn', 'weren',
    'won', 'wouldn', 'experience', 'work', 'job', 'position', 'role',
    'responsibilities', 'qualifications', 'requirements', 'skills',
    'team', 'company', 'business', 'years', 'looking', 'seeking'
]);

// Helper to clean and extract unique keywords from text
const extractKeywords = (text: string): string[] => {
    if (!text) return [];

    // Remove special characters and split by whitespace
    const words = text.toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 2 && !STOP_WORDS.has(word));

    // Count frequency to identify important keywords (simple top frequency approach)
    const frequency: Record<string, number> = {};
    words.forEach(word => {
        frequency[word] = (frequency[word] || 0) + 1;
    });

    // Sort by frequency
    return Object.entries(frequency)
        .sort(([, a], [, b]) => b - a)
        .map(([word]) => word)
        .slice(0, 20); // Top 20 keywords
};

// Helper to get all text from resume
const getResumeText = (resume: ResumeData): string => {
    const parts = [
        resume.personalInfo.summary,
        ...resume.experience.map(e => `${e.role} ${e.company} ${e.description}`),
        ...resume.education.map(e => `${e.school} ${e.degree} ${e.coursework || ''}`),
        ...resume.projects.map(p => `${p.name} ${p.technologies} ${p.description}`),
        ...resume.skills.map(s => `${s.name} ${s.items}`),
        ...resume.customSections.map(c => c.items.map(i => `${i.title} ${i.description}`).join(' '))
    ];
    return parts.join(' ').toLowerCase();
};

export const calculateLocalATSScore = (resume: ResumeData, jd: string): ATSScoreResult => {
    const jdKeywords = extractKeywords(jd);
    const resumeText = getResumeText(resume);

    const foundKeywords: string[] = [];
    const missingKeywords: string[] = [];

    jdKeywords.forEach(keyword => {
        if (resumeText.includes(keyword)) {
            foundKeywords.push(keyword);
        } else {
            missingKeywords.push(keyword);
        }
    });

    // Calculate Base Score (Keywords match)
    const matchRatio = jdKeywords.length > 0 ? foundKeywords.length / jdKeywords.length : 0;
    let score = Math.round(matchRatio * 100);

    // Critical Issues Check
    const criticalIssues: string[] = [];
    if (!resume.personalInfo.email) criticalIssues.push("Missing contact email.");
    if (!resume.personalInfo.phone) criticalIssues.push("Missing contact phone number.");
    if (resume.experience.length === 0) criticalIssues.push("No experience listed.");
    if (resume.skills.length === 0) criticalIssues.push("No skills section found.");
    if (resume.personalInfo.summary.length < 50) criticalIssues.push("Summary is too short or missing.");

    // Deduct score for critical issues
    score = Math.max(0, score - (criticalIssues.length * 10));

    // Positive Signals
    const positiveSignals: string[] = [];
    if (score > 80) positiveSignals.push("Excellent keyword matching!");
    if (resume.experience.length > 2) positiveSignals.push("Good depth of experience demonstrated.");
    if (resume.projects.length > 0) positiveSignals.push("Projects section demonstrates practical skills.");
    if (resume.customSections.length > 0) positiveSignals.push("Custom sections add unique value.");

    // Cap score
    score = Math.min(100, Math.max(0, score));

    return {
        score,
        missingKeywords,
        criticalIssues,
        positiveSignals
    };
};
