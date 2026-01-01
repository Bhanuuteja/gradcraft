
export interface Experience {
  id: string;
  company: string;
  role: string;
  duration: string;
  description: string;
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  year: string;
  gpa?: string;
  coursework?: string;
}

export interface Project {
  id: string;
  name: string;
  technologies: string;
  link: string;
  description: string;
}

export interface CustomSectionItem {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  description: string;
}

export interface CustomSection {
  id: string;
  title: string;
  items: CustomSectionItem[];
}

export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location?: string;
  openToRelocate?: boolean;
  linkedin: string;
  github: string;
  portfolio: string;
  summary: string;
}

export interface CoverLetter {
  recipientName: string;
  recipientTitle: string;
  companyName: string;
  companyAddress: string;
  date: string;
  content: string;
}

export interface ResumeDesign {
  template: 'modern' | 'professional' | 'minimal';
  font: 'serif' | 'sans';
  accentColor: string;
  spacing: 'compact' | 'normal';
}

export interface SkillCategory {
  name: string;
  items: string;
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  skills: SkillCategory[];
  experience: Experience[];
  education: Education[];
  projects: Project[];
  customSections: CustomSection[];
  sectionOrder: string[];
  design: ResumeDesign;
  coverLetter: CoverLetter;
}

export interface OptimizationResponse {
  summary: string;
  skills: string;
  experience: {
    id: string;
    description: string;
  }[];
  projects: {
    id: string;
    description: string;
  }[];
  matchScore: number;
  brutalHonesty: string;
  topMissingKeywords: string[];
  coverLetterContent: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
}

export interface SavedResume {
  id: string;
  userId: string;
  name: string;
  lastModified: number;
  data: ResumeData;
}

export type ApplicationStatus = 'Applied' | 'Interviewing' | 'Rejected' | 'Offer';

export interface Application {
  id: string;
  userId: string;
  resumeId: string;
  company: string;
  role: string;
  status: ApplicationStatus;
  appliedDate: number;
  jd?: string;
}
