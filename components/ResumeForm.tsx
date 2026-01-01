// Imports updated
import React, { useState } from 'react';
import { ResumeData, Experience, Education, Project, CustomSection, ResumeDesign } from '../types';
import { generateId } from '../utils';
import { Plus, Trash2, Briefcase, GraduationCap, User, Code, FolderGit2, ArrowUp, ArrowDown, ChevronRight, ChevronLeft, Palette, Type as TypeIcon, LayoutTemplate, Layers, Mail } from 'lucide-react';
import RichTextarea from './RichTextarea';

interface ResumeFormProps {
    data: ResumeData;
    onChange: (data: ResumeData) => void;
    activeDoc: 'resume' | 'cover-letter';
}

type SectionType = 'personal' | 'experience' | 'projects' | 'education' | 'skills' | 'custom' | 'design' | 'coverletter' | 'structure';

const SECTION_CONFIG: { id: SectionType; label: string; icon: React.ReactNode }[] = [
    { id: 'personal', label: 'Personal', icon: <User className="w-4 h-4" /> },
    { id: 'experience', label: 'Experience', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'projects', label: 'Projects', icon: <FolderGit2 className="w-4 h-4" /> },
    { id: 'education', label: 'Education', icon: <GraduationCap className="w-4 h-4" /> },
    { id: 'skills', label: 'Skills', icon: <Code className="w-4 h-4" /> },
    { id: 'custom', label: 'Custom', icon: <Layers className="w-4 h-4" /> },
    { id: 'coverletter', label: 'Letter', icon: <Mail className="w-4 h-4" /> },
    { id: 'design', label: 'Design', icon: <Palette className="w-4 h-4" /> },
];

const PRESET_COLORS = ['#2563eb', '#1e40af', '#0f172a', '#166534', '#6b21a8', '#dc2626'];

const ItemToolbar: React.FC<{ title: string; onUp: () => void; onDown: () => void; onDelete: () => void; isFirst: boolean; isLast: boolean }> = ({ title, onUp, onDown, onDelete, isFirst, isLast }) => (
    <div className="flex justify-between items-center px-4 py-2 bg-slate-50 dark:bg-neutral-800/50 border-b border-slate-200 dark:border-neutral-700">
        <span className="font-bold text-[9px] text-slate-500 uppercase tracking-widest truncate max-w-[120px] xs:max-w-[180px] md:max-w-[400px]">{title || 'NEW RECORD'}</span>
        <div className="flex items-center gap-1 shrink-0 ml-2">
            <button onClick={onUp} disabled={isFirst} className="p-1.5 hover:bg-white dark:hover:bg-neutral-700 rounded-lg text-slate-400 disabled:opacity-20 transition-all"><ArrowUp className="w-3.5 h-3.5" /></button>
            <button onClick={onDown} disabled={isLast} className="p-1.5 hover:bg-white dark:hover:bg-neutral-700 rounded-lg text-slate-400 disabled:opacity-20 transition-all"><ArrowDown className="w-3.5 h-3.5" /></button>
            <button onClick={onDelete} className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-brand-primary rounded-lg ml-1 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
    </div>
);

const ResumeForm: React.FC<ResumeFormProps> = ({ data, onChange, activeDoc }) => {
    const [activeSection, setActiveSection] = useState<SectionType>(activeDoc === 'cover-letter' ? 'coverletter' : 'personal');
    const [isNavCollapsed, setIsNavCollapsed] = useState(false);
    const [designTab, setDesignTab] = useState<'style' | 'order'>('style');

    const updateDesign = (field: keyof ResumeDesign, value: any) => {
        onChange({ ...data, design: { ...data.design, [field]: value } });
    };

    const moveItem = <T,>(list: T[], index: number, direction: 'up' | 'down'): T[] => {
        const newList = [...list];
        if (direction === 'up' && index > 0) [newList[index], newList[index - 1]] = [newList[index - 1], newList[index]];
        if (direction === 'down' && index < list.length - 1) [newList[index], newList[index + 1]] = [newList[index + 1], newList[index]];
        return newList;
    };

    return (
        <div className="flex flex-col lg:flex-row h-full">
            <nav className={`shrink-0 bg-white dark:bg-neutral-950 border-r border-slate-200 dark:border-neutral-900 flex flex-row lg:flex-col transition-all duration-300 overflow-x-auto lg:overflow-y-auto lg:overflow-x-hidden ${isNavCollapsed ? 'lg:w-16' : 'lg:w-48'}`}>
                {SECTION_CONFIG.map(section => (
                    <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`flex items-center gap-3 px-6 py-4 lg:py-5 text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeSection === section.id ? 'text-brand-primary bg-blue-50 dark:bg-blue-900/10 border-b-4 lg:border-b-0 lg:border-r-4 border-brand-primary' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-neutral-900'}`}
                    >
                        <span className="shrink-0">{section.icon}</span>
                        <span className={`${isNavCollapsed ? 'lg:hidden' : 'block'}`}>{section.label}</span>
                    </button>
                ))}
                <button onClick={() => setIsNavCollapsed(!isNavCollapsed)} className="hidden lg:flex mt-auto p-6 justify-center text-slate-300 hover:text-brand-primary transition-colors">
                    {isNavCollapsed ? <ChevronRight /> : <ChevronLeft />}
                </button>
            </nav>

            <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-white dark:bg-black custom-scrollbar">
                <div className="max-w-5xl mx-auto space-y-12 pb-32">

                    {activeSection === 'personal' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 animate-in fade-in duration-500">
                            <div className="space-y-1.5"><label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider px-1">Full Name</label><input value={data.personalInfo.fullName} onChange={e => onChange({ ...data, personalInfo: { ...data.personalInfo, fullName: e.target.value } })} className="input-field py-2.5 px-4 text-sm" /></div>
                            <div className="space-y-1.5"><label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider px-1">Email</label><input value={data.personalInfo.email} onChange={e => onChange({ ...data, personalInfo: { ...data.personalInfo, email: e.target.value } })} className="input-field py-2.5 px-4 text-sm" /></div>
                            <div className="space-y-1.5"><label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider px-1">Phone</label><input value={data.personalInfo.phone} onChange={e => onChange({ ...data, personalInfo: { ...data.personalInfo, phone: e.target.value } })} className="input-field py-2.5 px-4 text-sm" /></div>
                            <div className="space-y-1.5"><label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider px-1">Location</label><input value={data.personalInfo.location || ''} onChange={e => onChange({ ...data, personalInfo: { ...data.personalInfo, location: e.target.value } })} className="input-field py-2.5 px-4 text-sm" /></div>
                            <div className="space-y-4 md:col-span-2 bg-slate-50 dark:bg-neutral-900 p-5 rounded-2xl border border-slate-100 dark:border-neutral-800">
                                <label className="flex items-center gap-4 md:gap-6 cursor-pointer">
                                    <div className="relative shrink-0">
                                        <input type="checkbox" checked={data.personalInfo.openToRelocate} onChange={e => onChange({ ...data, personalInfo: { ...data.personalInfo, openToRelocate: e.target.checked } })} className="sr-only" />
                                        <div className={`w-12 h-6 md:w-16 md:h-8 rounded-full transition-all ${data.personalInfo.openToRelocate ? 'bg-brand-primary' : 'bg-slate-300'}`} />
                                        <div className={`absolute top-1 left-1 w-4 h-4 md:w-6 md:h-6 bg-white rounded-full transition-all ${data.personalInfo.openToRelocate ? 'translate-x-6 md:translate-x-8' : ''}`} />
                                    </div>
                                    <span className="text-xs md:text-sm font-black uppercase tracking-[0.1em] md:tracking-[0.2em] text-slate-600 dark:text-slate-300">Open to Relocation</span>
                                </label>
                            </div>
                            <div className="space-y-1.5"><label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider px-1">LinkedIn</label><input value={data.personalInfo.linkedin} onChange={e => onChange({ ...data, personalInfo: { ...data.personalInfo, linkedin: e.target.value } })} className="input-field py-2.5 px-4 text-sm" /></div>
                            <div className="space-y-1.5"><label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider px-1">GitHub</label><input value={data.personalInfo.github} onChange={e => onChange({ ...data, personalInfo: { ...data.personalInfo, github: e.target.value } })} className="input-field py-2.5 px-4 text-sm" /></div>
                            <div className="space-y-1.5"><label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider px-1">Portfolio / Website</label><input value={data.personalInfo.portfolio || ''} onChange={e => onChange({ ...data, personalInfo: { ...data.personalInfo, portfolio: e.target.value } })} className="input-field py-2.5 px-4 text-sm" /></div>
                            <div className="md:col-span-2 space-y-1.5"><label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider px-1">Professional Summary</label><RichTextarea value={data.personalInfo.summary} onChangeValue={v => onChange({ ...data, personalInfo: { ...data.personalInfo, summary: v } })} className="h-40 md:h-48 text-sm" /></div>
                        </div>
                    )}

                    {activeSection === 'experience' && (
                        <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
                            {data.experience.map((exp, idx) => (
                                <div key={exp.id} className="card-brand overflow-hidden shadow-md hover:shadow-xl transition-all">
                                    <ItemToolbar title={exp.company} onUp={() => onChange({ ...data, experience: moveItem(data.experience, idx, 'up') })} onDown={() => onChange({ ...data, experience: moveItem(data.experience, idx, 'down') })} onDelete={() => onChange({ ...data, experience: data.experience.filter((_, i) => i !== idx) })} isFirst={idx === 0} isLast={idx === data.experience.length - 1} />
                                    <div className="p-5 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[9px] md:text-[10px] font-black uppercase text-slate-400 px-1 whitespace-nowrap">Organization Name</label>
                                            <input placeholder="Organization" value={exp.company} onChange={e => { const n = [...data.experience]; n[idx].company = e.target.value; onChange({ ...data, experience: n }) }} className="input-field py-3 md:py-4 px-4 md:px-6 text-sm md:text-base" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] md:text-[10px] font-black uppercase text-slate-400 px-1 whitespace-nowrap">Job Role / Title</label>
                                            <input placeholder="Role" value={exp.role} onChange={e => { const n = [...data.experience]; n[idx].role = e.target.value; onChange({ ...data, experience: n }) }} className="input-field py-3 md:py-4 px-4 md:px-6 text-sm md:text-base" />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-[9px] md:text-[10px] font-black uppercase text-slate-400 px-1 whitespace-nowrap">Time Duration</label>
                                            <input placeholder="e.g. Jan 2020 - Present" value={exp.duration} onChange={e => { const n = [...data.experience]; n[idx].duration = e.target.value; onChange({ ...data, experience: n }) }} className="input-field py-3 md:py-4 px-4 md:px-6 text-sm md:text-base" />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-[9px] md:text-[10px] font-black uppercase text-slate-400 px-1 whitespace-nowrap">Description</label>
                                            <RichTextarea placeholder="Key contributions using STAR method..." value={exp.description} onChangeValue={v => { const n = [...data.experience]; n[idx].description = v; onChange({ ...data, experience: n }) }} className="h-64 md:h-72 text-sm md:text-base" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <button onClick={() => onChange({ ...data, experience: [...data.experience, { id: generateId(), company: '', role: '', duration: '', description: '' }] })} className="w-full py-6 md:py-8 border-2 border-dashed border-slate-200 dark:border-neutral-800 rounded-2xl flex items-center justify-center gap-2 md:gap-3 text-slate-400 font-bold uppercase tracking-widest hover:text-brand-primary hover:border-brand-primary transition-all group active:scale-98">
                                <Plus className="group-hover:rotate-90 transition-transform w-5 h-5 md:w-6 md:h-6" /> Add Position
                            </button>
                        </div>
                    )}

                    {activeSection === 'projects' && (
                        <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
                            {data.projects.map((proj, idx) => (
                                <div key={proj.id} className="card-brand overflow-hidden shadow-md hover:shadow-xl transition-all">
                                    <ItemToolbar title={proj.name} onUp={() => onChange({ ...data, projects: moveItem(data.projects, idx, 'up') })} onDown={() => onChange({ ...data, projects: moveItem(data.projects, idx, 'down') })} onDelete={() => onChange({ ...data, projects: data.projects.filter((_, i) => i !== idx) })} isFirst={idx === 0} isLast={idx === data.projects.length - 1} />
                                    <div className="p-5 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[9px] md:text-[10px] font-black uppercase text-slate-400 px-1 whitespace-nowrap">Project Name</label>
                                            <input placeholder="Project Name" value={proj.name} onChange={e => { const n = [...data.projects]; n[idx].name = e.target.value; onChange({ ...data, projects: n }) }} className="input-field py-3 md:py-4 px-4 md:px-6 text-sm md:text-base" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] md:text-[10px] font-black uppercase text-slate-400 px-1 whitespace-nowrap">Technical Stack</label>
                                            <input placeholder="e.g. React, Node, AWS" value={proj.technologies} onChange={e => { const n = [...data.projects]; n[idx].technologies = e.target.value; onChange({ ...data, projects: n }) }} className="input-field py-3 md:py-4 px-4 md:px-6 text-sm md:text-base" />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-[9px] md:text-[10px] font-black uppercase text-slate-400 px-1 whitespace-nowrap">Link / URL</label>
                                            <input placeholder="Link" value={proj.link} onChange={e => { const n = [...data.projects]; n[idx].link = e.target.value; onChange({ ...data, projects: n }) }} className="input-field py-3 md:py-4 px-4 md:px-6 text-sm md:text-base" />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-[9px] md:text-[10px] font-black uppercase text-slate-400 px-1 whitespace-nowrap">Description</label>
                                            <RichTextarea placeholder="Describe the problem, solution, and impact..." value={proj.description} onChangeValue={v => { const n = [...data.projects]; n[idx].description = v; onChange({ ...data, projects: n }) }} className="h-56 md:h-64 text-sm md:text-base" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <button onClick={() => onChange({ ...data, projects: [...data.projects, { id: generateId(), name: '', technologies: '', link: '', description: '' }] })} className="w-full py-6 md:py-8 border-2 border-dashed border-slate-200 dark:border-neutral-800 rounded-2xl flex items-center justify-center gap-2 md:gap-3 text-slate-400 font-bold uppercase tracking-widest hover:text-brand-primary hover:border-brand-primary transition-all group active:scale-98">
                                <Plus className="group-hover:rotate-90 transition-transform w-5 h-5 md:w-6 md:h-6" /> Add Project
                            </button>
                        </div>
                    )}

                    {activeSection === 'education' && (
                        <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
                            {data.education.map((edu, idx) => (
                                <div key={edu.id} className="card-brand overflow-hidden shadow-md">
                                    <ItemToolbar title={edu.school} onUp={() => onChange({ ...data, education: moveItem(data.education, idx, 'up') })} onDown={() => onChange({ ...data, education: moveItem(data.education, idx, 'down') })} onDelete={() => onChange({ ...data, education: data.education.filter((_, i) => i !== idx) })} isFirst={idx === 0} isLast={idx === data.education.length - 1} />
                                    <div className="p-5 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                        <input placeholder="School / University" value={edu.school} onChange={e => { const n = [...data.education]; n[idx].school = e.target.value; onChange({ ...data, education: n }) }} className="input-field py-3 md:py-4 px-4 md:px-6" />
                                        <input placeholder="Degree" value={edu.degree} onChange={e => { const n = [...data.education]; n[idx].degree = e.target.value; onChange({ ...data, education: n }) }} className="input-field py-3 md:py-4 px-4 md:px-6" />
                                        <input placeholder="Year" value={edu.year} onChange={e => { const n = [...data.education]; n[idx].year = e.target.value; onChange({ ...data, education: n }) }} className="input-field py-3 md:py-4 px-4 md:px-6" />
                                        <input placeholder="GPA" value={edu.gpa || ''} onChange={e => { const n = [...data.education]; n[idx].gpa = e.target.value; onChange({ ...data, education: n }) }} className="input-field py-3 md:py-4 px-4 md:px-6" />
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-[9px] md:text-[10px] font-black uppercase text-slate-400 px-1">Relevant Coursework</label>
                                            <RichTextarea placeholder="Data Structures, Algorithms, Financial Analysis..." value={edu.coursework || ''} onChangeValue={v => { const n = [...data.education]; n[idx].coursework = v; onChange({ ...data, education: n }) }} className="h-32 md:h-40" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <button onClick={() => onChange({ ...data, education: [...data.education, { id: generateId(), school: '', degree: '', year: '' }] })} className="w-full py-6 md:py-8 border-2 border-dashed border-slate-200 dark:border-neutral-800 rounded-2xl flex items-center justify-center gap-2 md:gap-3 text-slate-400 font-bold uppercase tracking-widest hover:text-brand-primary hover:border-brand-primary transition-all group active:scale-98">
                                <Plus className="group-hover:rotate-90 transition-transform w-5 h-5 md:w-6 md:h-6" /> Add Education
                            </button>
                        </div>
                    )}

                    {activeSection === 'skills' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {(() => {
                                // Safety check for legacy data (string vs array)
                                const currentSkills = Array.isArray(data.skills)
                                    ? data.skills
                                    : [{ name: 'Technical Skills', items: (data.skills as unknown as string) || '' }];

                                return (
                                    <>
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-lg font-black uppercase tracking-tight text-slate-800">Skills & Expertise</h3>
                                            <button onClick={() => onChange({ ...data, skills: [...currentSkills, { name: '', items: '' }] })} className="text-[10px] font-black uppercase tracking-widest bg-brand-primary/10 text-brand-primary px-3 py-1.5 rounded-lg hover:bg-brand-primary hover:text-white transition-all">+ Add Category</button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {currentSkills.map((skill, index) => (
                                                <div key={index} className="p-4 bg-slate-50 border-2 border-slate-100 rounded-xl space-y-3 group hover:border-brand-primary/20 transition-all relative">
                                                    <div className="flex justify-between items-center">
                                                        <input
                                                            value={skill.name}
                                                            onChange={e => {
                                                                const newSkills = [...currentSkills];
                                                                newSkills[index] = { ...newSkills[index], name: e.target.value };
                                                                onChange({ ...data, skills: newSkills });
                                                            }}
                                                            placeholder="Category Name (e.g. Languages)"
                                                            className="bg-transparent font-bold text-xs uppercase tracking-wider text-slate-900 placeholder:text-slate-400 outline-none w-full"
                                                        />
                                                        <button
                                                            onClick={() => {
                                                                const newSkills = currentSkills.filter((_, i) => i !== index);
                                                                onChange({ ...data, skills: newSkills });
                                                            }}
                                                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-red-500 transition-all"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                    <textarea
                                                        value={skill.items}
                                                        onChange={e => {
                                                            const newSkills = [...currentSkills];
                                                            newSkills[index] = { ...newSkills[index], items: e.target.value };
                                                            onChange({ ...data, skills: newSkills });
                                                        }}
                                                        placeholder="List skills here..."
                                                        className="w-full text-sm bg-white p-3 rounded-lg border border-slate-200 outline-none focus:border-brand-primary transition-all h-24 resize-none"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                        {currentSkills.length === 0 && (
                                            <div className="text-center p-8 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-xs font-bold uppercase tracking-widest cursor-pointer hover:bg-slate-50 transition-all" onClick={() => onChange({ ...data, skills: [...currentSkills, { name: 'Technical Skills', items: '' }] })}>
                                                Click to add your first skill category
                                            </div>
                                        )}
                                    </>
                                );
                            })()}
                        </div>
                    )}

                    {activeSection === 'custom' && (
                        <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
                            {data.customSections.map((sec, sIdx) => (
                                <div key={sec.id} className="card-brand overflow-hidden shadow-md">
                                    <div className="bg-slate-50 dark:bg-neutral-800/50 px-5 md:px-8 py-4 md:py-6 border-b border-slate-200 flex justify-between items-center">
                                        <input value={sec.title} onChange={e => { const n = [...data.customSections]; n[sIdx].title = e.target.value; onChange({ ...data, customSections: n }) }} className="bg-transparent font-black uppercase text-sm md:text-base tracking-[0.1em] md:tracking-[0.2em] outline-none border-b-2 border-transparent focus:border-brand-primary text-slate-700 dark:text-white pb-1" />
                                        <button onClick={() => onChange({ ...data, customSections: data.customSections.filter((_, i) => i !== sIdx), sectionOrder: data.sectionOrder.filter(id => id !== sec.id) })} className="text-red-500 hover:bg-red-50 p-2 md:p-3 rounded-xl transition-all"><Trash2 className="w-4 h-4 md:w-5 md:h-5" /></button>
                                    </div>
                                    <div className="p-5 md:p-10 space-y-8 md:space-y-10">
                                        {sec.items.map((item, iIdx) => (
                                            <div key={item.id} className="space-y-4 md:space-y-6 border-b border-slate-100 dark:border-neutral-800 pb-8 md:pb-10 last:border-0 last:pb-0">
                                                <div className="flex justify-between items-center gap-4 md:gap-6">
                                                    <input placeholder="Title" value={item.title} onChange={e => { const n = [...data.customSections]; n[sIdx].items[iIdx].title = e.target.value; onChange({ ...data, customSections: n }) }} className="input-field py-3 md:py-4 px-4 md:px-6 text-sm md:text-base" />
                                                    <button onClick={() => { const n = [...data.customSections]; n[sIdx].items.splice(iIdx, 1); onChange({ ...data, customSections: n }) }} className="p-2 md:p-3 text-slate-400 hover:text-red-500 transition-all"><Trash2 className="w-4 h-4 md:w-5 md:h-5" /></button>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <input placeholder="Subtitle / Org" value={item.subtitle} onChange={e => { const n = [...data.customSections]; n[sIdx].items[iIdx].subtitle = e.target.value; onChange({ ...data, customSections: n }) }} className="input-field py-3 px-4 text-sm" />
                                                    <input placeholder="Date / Period" value={item.date} onChange={e => { const n = [...data.customSections]; n[sIdx].items[iIdx].date = e.target.value; onChange({ ...data, customSections: n }) }} className="input-field py-3 px-4 text-sm" />
                                                </div>
                                                <RichTextarea placeholder="Details and accomplishments..." value={item.description} onChangeValue={v => { const n = [...data.customSections]; n[sIdx].items[iIdx].description = v; onChange({ ...data, customSections: n }) }} className="h-40 md:h-48" />
                                            </div>
                                        ))}
                                        <button onClick={() => { const n = [...data.customSections]; n[sIdx].items.push({ id: generateId(), title: '', subtitle: '', date: '', description: '' }); onChange({ ...data, customSections: n }) }} className="text-[10px] md:text-xs font-black uppercase tracking-widest text-brand-primary flex items-center gap-2 md:gap-3 hover:translate-x-2 transition-transform"><Plus className="w-4 h-4 md:w-5 md:h-5" /> Add Category Item</button>
                                    </div>
                                </div>
                            ))}
                            <button onClick={() => {
                                const newId = generateId();
                                onChange({
                                    ...data,
                                    customSections: [...data.customSections, { id: newId, title: 'NEW SECTION', items: [] }],
                                    sectionOrder: [...data.sectionOrder, newId]
                                });
                            }} className="w-full py-6 md:py-8 border-2 border-dashed border-slate-200 dark:border-neutral-800 rounded-2xl flex items-center justify-center gap-2 md:gap-3 text-slate-400 font-bold uppercase tracking-widest hover:text-brand-primary hover:border-brand-primary transition-all group active:scale-98">
                                <Plus className="group-hover:rotate-90 transition-transform w-5 h-5 md:w-6 md:h-6" /> New Category
                            </button>
                        </div>
                    )}

                    {activeSection === 'coverletter' && (
                        <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
                            <div className="bg-brand-primary text-white p-6 md:p-10 rounded-2xl shadow-lg relative overflow-hidden">
                                <Mail className="absolute -right-5 -bottom-5 w-32 h-32 opacity-10 rotate-12" />
                                <div className="relative z-10">
                                    <h2 className="text-xl md:text-3xl font-black uppercase mb-1 tracking-tight">Cover Letter</h2>
                                    <p className="text-blue-100 opacity-80 text-xs md:text-sm">Draft your customized cover letter.</p>
                                </div>
                            </div>
                            <RichTextarea
                                value={data.coverLetter.content}
                                onChangeValue={v => onChange({ ...data, coverLetter: { ...data.coverLetter, content: v } })}
                                className="h-[300px] md:h-[400px] font-latex text-sm md:text-base p-4 md:p-6 leading-relaxed"
                                placeholder="Dear Hiring Manager..."
                            />
                        </div>
                    )}

                    {activeSection === 'design' && (
                        <div className="space-y-8 animate-in fade-in duration-500 max-w-2xl mx-auto">

                            {/* Sub-Tab Switcher */}
                            <div className="flex p-1 bg-slate-100 dark:bg-neutral-800 rounded-xl">
                                <button
                                    onClick={() => setDesignTab('style')}
                                    className={`flex-1 py-2 text-xs font-bold uppercase tracking-wide rounded-lg transition-all ${designTab === 'style' ? 'bg-white dark:bg-neutral-700 shadow-sm text-brand-primary' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
                                >
                                    Global Style
                                </button>
                                <button
                                    onClick={() => setDesignTab('order')}
                                    className={`flex-1 py-2 text-xs font-bold uppercase tracking-wide rounded-lg transition-all ${designTab === 'order' ? 'bg-white dark:bg-neutral-700 shadow-sm text-brand-primary' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
                                >
                                    Section Order
                                </button>
                            </div>

                            {/* Style Tab Content */}
                            {designTab === 'style' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="space-y-4 md:space-y-6">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2 md:gap-3"><Palette className="w-4 h-4 md:w-5 md:h-5 text-brand-primary" /> Accent Color</label>
                                        <div className="flex flex-wrap gap-3 md:gap-6">
                                            {PRESET_COLORS.map(color => (
                                                <button
                                                    key={color}
                                                    onClick={() => updateDesign('accentColor', color)}
                                                    className={`w-10 h-10 md:w-16 md:h-16 rounded-xl border-2 md:border-4 transition-all hover:scale-110 active:scale-90 ${data.design.accentColor === color ? 'border-slate-900 dark:border-white shadow-lg' : 'border-transparent shadow-sm'}`}
                                                    style={{ backgroundColor: color }}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2 md:gap-3"><LayoutTemplate className="w-4 h-4" /> Information Density</label>
                                            <div className="grid grid-cols-2 gap-2 md:gap-4">
                                                {(['compact', 'normal'] as const).map(s => (
                                                    <button key={s} onClick={() => updateDesign('spacing', s)} className={`p-4 rounded-xl border-2 font-black uppercase tracking-widest text-[10px] transition-all shadow-sm ${data.design.spacing === s ? 'border-brand-primary bg-blue-50 text-brand-primary shadow-md' : 'border-slate-100 dark:border-neutral-800 text-slate-400 hover:border-slate-200'}`}>{s}</button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2 md:gap-3"><TypeIcon className="w-4 h-4" /> Typography System</label>
                                            <div className="grid grid-cols-2 gap-2 md:gap-4">
                                                {(['serif', 'sans'] as const).map(f => (
                                                    <button key={f} onClick={() => updateDesign('font', f)} className={`p-4 rounded-xl border-2 font-black uppercase tracking-widest text-[10px] transition-all shadow-sm ${data.design.font === f ? 'border-brand-primary bg-blue-50 text-brand-primary shadow-md' : 'border-slate-100 dark:border-neutral-800 text-slate-400 hover:border-slate-200'}`}>{f}</button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Order Tab Content */}
                            {designTab === 'order' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="text-center space-y-2 mb-6">
                                        <p className="text-xs text-slate-500">Drag items to reorder logic not yet implemented, but buttons work!</p>
                                    </div>
                                    <div className="space-y-3">
                                        {data.sectionOrder.map((secId, idx) => {
                                            const getLabel = (id: string) => {
                                                switch (id) {
                                                    case 'summary': return 'Professional Summary';
                                                    case 'experience': return 'Experience';
                                                    case 'education': return 'Education';
                                                    case 'projects': return 'Projects';
                                                    case 'skills': return 'Skills';
                                                    default: return data.customSections.find(c => c.id === id)?.title || 'Custom';
                                                }
                                            };
                                            return (
                                                <div key={secId} className="flex items-center justify-between p-4 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl shadow-sm group hover:border-brand-primary/50 transition-all">
                                                    <span className="font-bold text-sm uppercase tracking-wide text-slate-700 dark:text-slate-200">{getLabel(secId)}</span>
                                                    <div className="flex items-center gap-2">
                                                        <button onClick={() => onChange({ ...data, sectionOrder: moveItem(data.sectionOrder, idx, 'up') })} disabled={idx === 0} className="p-2 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-lg text-slate-400 hover:text-brand-primary disabled:opacity-20 transition-all"><ArrowUp className="w-4 h-4" /></button>
                                                        <button onClick={() => onChange({ ...data, sectionOrder: moveItem(data.sectionOrder, idx, 'down') })} disabled={idx === data.sectionOrder.length - 1} className="p-2 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-lg text-slate-400 hover:text-brand-primary disabled:opacity-20 transition-all"><ArrowDown className="w-4 h-4" /></button>
                                                        <div className="w-px h-6 bg-slate-200 dark:bg-neutral-800 mx-1" />
                                                        <button onClick={() => onChange({ ...data, sectionOrder: data.sectionOrder.filter(s => s !== secId) })} className="p-2 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Restore Hidden Sections */}
                                    <div className="pt-8 border-t border-slate-200 dark:border-neutral-800">
                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">Hidden Sections</p>
                                        <div className="flex flex-wrap gap-3">
                                            {['summary', 'experience', 'education', 'projects', 'skills', ...data.customSections.map(c => c.id)]
                                                .filter(id => !data.sectionOrder.includes(id))
                                                .map(id => {
                                                    const getLabel = (xId: string) => {
                                                        switch (xId) {
                                                            case 'summary': return 'Summary';
                                                            case 'experience': return 'Experience';
                                                            case 'education': return 'Education';
                                                            case 'projects': return 'Projects';
                                                            case 'skills': return 'Skills';
                                                            default: return data.customSections.find(c => c.id === xId)?.title || 'Custom';
                                                        }
                                                    };
                                                    return (
                                                        <button key={id} onClick={() => onChange({ ...data, sectionOrder: [...data.sectionOrder, id] })} className="px-4 py-2 bg-slate-100 dark:bg-neutral-800 rounded-lg text-xs font-bold text-slate-500 hover:text-brand-primary hover:bg-brand-primary/10 transition-all flex items-center gap-2">
                                                            <Plus className="w-3 h-3" /> {getLabel(id)}
                                                        </button>
                                                    );
                                                })}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>

    );
};

export default ResumeForm;
