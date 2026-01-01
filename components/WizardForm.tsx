import React, { useState } from 'react';
import { ResumeData, Experience, Project, Education } from '../types';
import { ArrowRight, ArrowLeft, Check, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { generateId } from '../utils';

interface WizardFormProps {
  data: ResumeData;
  onChange: (data: ResumeData) => void;
  onComplete: () => void;
}

const STEPS = [
    { id: 'intro', title: "Welcome", desc: "Let's start building your professional profile." },
    { id: 'personal', title: "Personal Details", desc: "How can recruiters contact you?" },
    { id: 'experience', title: "Work Experience", desc: "Where have you worked?" },
    { id: 'projects', title: "Projects", desc: "Showcase your best work." },
    { id: 'education', title: "Education", desc: "Your academic background." },
    { id: 'skills', title: "Skills", desc: "What are your technical strengths?" },
];

const WizardForm: React.FC<WizardFormProps> = ({ data, onChange, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const next = () => setCurrentStep(p => Math.min(STEPS.length - 1, p + 1));
  const back = () => setCurrentStep(p => Math.max(0, p - 1));

  const updateInfo = (field: string, val: any) => {
    onChange({ ...data, personalInfo: { ...data.personalInfo, [field]: val } });
  };

  // --- Reordering Helper ---
  const moveItem = <T,>(list: T[], index: number, direction: 'up' | 'down'): T[] => {
    const newList = [...list];
    if (direction === 'up') {
        if (index === 0) return newList;
        [newList[index], newList[index - 1]] = [newList[index - 1], newList[index]];
    } else {
        if (index === newList.length - 1) return newList;
        [newList[index], newList[index + 1]] = [newList[index + 1], newList[index]];
    }
    return newList;
  };

  const renderItemToolbar = (title: string, onUp: () => void, onDown: () => void, onDelete: () => void, isFirst: boolean, isLast: boolean) => (
    <div className="flex justify-between items-center bg-slate-100 dark:bg-neutral-800 px-4 py-2 rounded-t-xl border-b border-slate-200 dark:border-neutral-700 mb-4">
        <span className="font-semibold text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 truncate max-w-[180px]">{title || 'New Item'}</span>
        <div className="flex items-center gap-1">
            <button onClick={onUp} disabled={isFirst} className="p-1 hover:bg-white dark:hover:bg-neutral-700 rounded text-slate-500 disabled:opacity-30 transition-colors"><ArrowUp className="w-4 h-4" /></button>
            <button onClick={onDown} disabled={isLast} className="p-1 hover:bg-white dark:hover:bg-neutral-700 rounded text-slate-500 disabled:opacity-30 transition-colors"><ArrowDown className="w-4 h-4" /></button>
            <div className="w-px h-4 bg-slate-300 dark:bg-neutral-600 mx-2"></div>
            <button onClick={onDelete} className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-500 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
        </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
        case 0: // Intro
            return (
                <div className="text-center space-y-8 py-20 flex flex-col items-center justify-center h-full">
                    <h3 className="text-4xl font-extrabold text-slate-800 dark:text-white tracking-tight">Let's Build Your Resume</h3>
                    <p className="text-slate-600 dark:text-slate-300 max-w-lg mx-auto text-lg leading-relaxed">
                        We'll guide you through each section step-by-step. Don't worry about formatting—we handle that. 
                        Just focus on telling your story.
                    </p>
                    <button onClick={next} className="mt-8 bg-red-600 hover:bg-red-700 text-white px-10 py-4 rounded-full font-bold text-xl transition-transform hover:scale-105 shadow-xl shadow-red-900/20">
                        Start Building
                    </button>
                </div>
            );
        case 1: // Personal
            return (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500 max-w-2xl mx-auto">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                        <input value={data.personalInfo.fullName} onChange={e => updateInfo('fullName', e.target.value)} className="input-field py-3 text-lg" placeholder="e.g. John Doe" autoFocus />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                            <input value={data.personalInfo.email} onChange={e => updateInfo('email', e.target.value)} className="input-field" placeholder="john@example.com" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone</label>
                            <input value={data.personalInfo.phone} onChange={e => updateInfo('phone', e.target.value)} className="input-field" placeholder="(555) 123-4567" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Location</label>
                        <input value={data.personalInfo.location || ''} onChange={e => updateInfo('location', e.target.value)} className="input-field" placeholder="e.g. New York, NY" />
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <input 
                            type="checkbox" 
                            id="openToRelocateWizard"
                            checked={data.personalInfo.openToRelocate || false}
                            onChange={e => updateInfo('openToRelocate', e.target.checked)}
                            className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500"
                        />
                        <label htmlFor="openToRelocateWizard" className="text-sm text-slate-700 dark:text-slate-300 select-none">Open to Relocate</label>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">LinkedIn URL</label>
                        <input value={data.personalInfo.linkedin} onChange={e => updateInfo('linkedin', e.target.value)} className="input-field" placeholder="linkedin.com/in/johndoe" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Portfolio / GitHub</label>
                        <input value={data.personalInfo.github} onChange={e => updateInfo('github', e.target.value)} className="input-field" placeholder="github.com/johndoe" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Professional Summary</label>
                        <textarea value={data.personalInfo.summary} onChange={e => updateInfo('summary', e.target.value)} className="input-field h-40 text-base leading-relaxed" placeholder="Briefly describe your professional background..." />
                    </div>
                </div>
            );
        case 2: // Experience
            return (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500 max-w-3xl mx-auto">
                     {data.experience.map((exp, idx) => (
                        <div key={exp.id} className="bg-slate-50 dark:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-700 shadow-sm overflow-hidden">
                             {renderItemToolbar(
                                exp.company || `Job #${idx+1}`,
                                () => onChange({...data, experience: moveItem(data.experience, idx, 'up')}),
                                () => onChange({...data, experience: moveItem(data.experience, idx, 'down')}),
                                () => onChange({...data, experience: data.experience.filter((_, i) => i !== idx)}),
                                idx === 0,
                                idx === data.experience.length - 1
                             )}
                             <div className="p-6 pt-2 grid grid-cols-2 gap-4">
                                <input placeholder="Company" value={exp.company} onChange={e => {
                                    const newExp = [...data.experience]; newExp[idx].company = e.target.value; onChange({...data, experience: newExp});
                                }} className="input-field font-bold text-lg" />
                                <input placeholder="Role" value={exp.role} onChange={e => {
                                    const newExp = [...data.experience]; newExp[idx].role = e.target.value; onChange({...data, experience: newExp});
                                }} className="input-field font-bold text-lg" />
                                <input placeholder="Duration (e.g. Jan 2020 - Present)" value={exp.duration} onChange={e => {
                                    const newExp = [...data.experience]; newExp[idx].duration = e.target.value; onChange({...data, experience: newExp});
                                }} className="input-field col-span-2" />
                                <textarea placeholder="• Achievements (use bullet points)..." value={exp.description} onChange={e => {
                                    const newExp = [...data.experience]; newExp[idx].description = e.target.value; onChange({...data, experience: newExp});
                                }} className="input-field h-32 font-mono text-sm col-span-2" />
                             </div>
                        </div>
                     ))}
                     <button onClick={() => onChange({...data, experience: [...data.experience, { id: generateId(), company: '', role: '', duration: '', description: '' }]})} className="w-full py-6 border-2 border-dashed border-slate-300 dark:border-neutral-700 rounded-xl text-slate-500 flex justify-center items-center hover:bg-slate-50 dark:hover:bg-neutral-800 hover:border-slate-400 transition-all text-lg font-medium">
                        <Plus className="w-6 h-6 mr-3" /> Add Position
                     </button>
                </div>
            );
        case 3: // Projects
            return (
                 <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500 max-w-3xl mx-auto">
                     {data.projects.map((proj, idx) => (
                        <div key={proj.id} className="bg-slate-50 dark:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-700 shadow-sm overflow-hidden">
                             {renderItemToolbar(
                                proj.name || `Project #${idx+1}`,
                                () => onChange({...data, projects: moveItem(data.projects, idx, 'up')}),
                                () => onChange({...data, projects: moveItem(data.projects, idx, 'down')}),
                                () => onChange({...data, projects: data.projects.filter((_, i) => i !== idx)}),
                                idx === 0,
                                idx === data.projects.length - 1
                             )}
                             <div className="p-6 pt-2 grid grid-cols-2 gap-4">
                                <input placeholder="Project Name" value={proj.name} onChange={e => {
                                    const newProj = [...data.projects]; newProj[idx].name = e.target.value; onChange({...data, projects: newProj});
                                }} className="input-field font-bold text-lg" />
                                <input placeholder="Tech Stack" value={proj.technologies} onChange={e => {
                                    const newProj = [...data.projects]; newProj[idx].technologies = e.target.value; onChange({...data, projects: newProj});
                                }} className="input-field" />
                                <input placeholder="Link" value={proj.link} onChange={e => {
                                    const newProj = [...data.projects]; newProj[idx].link = e.target.value; onChange({...data, projects: newProj});
                                }} className="input-field col-span-2" />
                                <textarea placeholder="• Features & Outcomes..." value={proj.description} onChange={e => {
                                    const newProj = [...data.projects]; newProj[idx].description = e.target.value; onChange({...data, projects: newProj});
                                }} className="input-field h-32 font-mono text-sm col-span-2" />
                             </div>
                        </div>
                     ))}
                     <button onClick={() => onChange({...data, projects: [...data.projects, { id: generateId(), name: '', technologies: '', link: '', description: '' }]})} className="w-full py-6 border-2 border-dashed border-slate-300 dark:border-neutral-700 rounded-xl text-slate-500 flex justify-center items-center hover:bg-slate-50 dark:hover:bg-neutral-800 hover:border-slate-400 transition-all text-lg font-medium">
                        <Plus className="w-6 h-6 mr-3" /> Add Project
                     </button>
                </div>
            );
        case 4: // Education
             return (
                 <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500 max-w-2xl mx-auto">
                     {data.education.map((edu, idx) => (
                        <div key={edu.id} className="bg-slate-50 dark:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-700 shadow-sm overflow-hidden">
                             {renderItemToolbar(
                                edu.school || `School #${idx+1}`,
                                () => onChange({...data, education: moveItem(data.education, idx, 'up')}),
                                () => onChange({...data, education: moveItem(data.education, idx, 'down')}),
                                () => onChange({...data, education: data.education.filter((_, i) => i !== idx)}),
                                idx === 0,
                                idx === data.education.length - 1
                             )}
                             <div className="p-6 pt-2 space-y-4">
                                <input placeholder="School / University" value={edu.school} onChange={e => {
                                    const newEdu = [...data.education]; newEdu[idx].school = e.target.value; onChange({...data, education: newEdu});
                                }} className="input-field font-bold text-lg" />
                                <input placeholder="Degree" value={edu.degree} onChange={e => {
                                    const newEdu = [...data.education]; newEdu[idx].degree = e.target.value; onChange({...data, education: newEdu});
                                }} className="input-field" />
                                <div className="grid grid-cols-2 gap-4">
                                    <input placeholder="Graduation Year" value={edu.year} onChange={e => {
                                        const newEdu = [...data.education]; newEdu[idx].year = e.target.value; onChange({...data, education: newEdu});
                                    }} className="input-field" />
                                    <input placeholder="GPA (Optional)" value={edu.gpa || ''} onChange={e => {
                                        const newEdu = [...data.education]; newEdu[idx].gpa = e.target.value; onChange({...data, education: newEdu});
                                    }} className="input-field" />
                                </div>
                                <textarea placeholder="Relevant Coursework (Optional)" value={edu.coursework || ''} onChange={e => {
                                    const newEdu = [...data.education]; newEdu[idx].coursework = e.target.value; onChange({...data, education: newEdu});
                                }} className="input-field h-24" />
                             </div>
                        </div>
                     ))}
                     <button onClick={() => onChange({...data, education: [...data.education, { id: generateId(), school: '', degree: '', year: '' }]})} className="w-full py-6 border-2 border-dashed border-slate-300 dark:border-neutral-700 rounded-xl text-slate-500 flex justify-center items-center hover:bg-slate-50 dark:hover:bg-neutral-800 hover:border-slate-400 transition-all text-lg font-medium">
                        <Plus className="w-6 h-6 mr-3" /> Add Education
                     </button>
                </div>
             );
        case 5: // Skills
             return (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500 max-w-2xl mx-auto">
                     <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-blue-700 dark:text-blue-300 text-sm mb-2">
                        Tip: List your most relevant technical skills separated by commas.
                     </div>
                     <textarea 
                        value={data.skills} 
                        onChange={e => onChange({...data, skills: e.target.value})} 
                        className="input-field h-64 text-lg leading-relaxed p-6" 
                        placeholder="e.g. JavaScript, TypeScript, React, Node.js, AWS, Docker, Python..."
                    />
                </div>
             );
        default: return null;
    }
  };

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto w-full relative">
        {/* Progress */}
        <div className="mb-8 px-4 sm:px-0">
             <div className="flex justify-between text-xs font-bold uppercase text-slate-400 mb-3 tracking-wider">
                <span>{STEPS[currentStep].title}</span>
                <span>Step {currentStep + 1} / {STEPS.length}</span>
             </div>
             <div className="w-full bg-slate-200 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                <div className="bg-red-600 h-full transition-all duration-500 ease-out" style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}></div>
             </div>
             {currentStep > 0 && <p className="mt-4 text-2xl font-bold text-slate-800 dark:text-white text-center">{STEPS[currentStep].desc}</p>}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-1 custom-scrollbar pb-10">
            {renderStepContent()}
        </div>

        {/* Actions - Sticky Footer */}
        <div className="sticky bottom-0 z-10 py-6 border-t border-slate-200 dark:border-neutral-800 flex justify-between items-center px-4 sm:px-0 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm mt-4">
            {currentStep > 0 ? (
                <button onClick={back} className="px-6 py-3 flex items-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-xl transition-colors font-medium">
                    <ArrowLeft className="w-5 h-5 mr-2" /> Back
                </button>
            ) : <div className="w-20"></div>}

            {currentStep < STEPS.length - 1 ? (
                currentStep > 0 && (
                <button onClick={next} className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-black rounded-xl font-bold flex items-center hover:opacity-90 transition-opacity shadow-lg">
                    Next <ArrowRight className="w-5 h-5 ml-2" />
                </button>
                )
            ) : (
                <button onClick={onComplete} className="px-8 py-3 bg-green-600 text-white rounded-xl font-bold flex items-center hover:bg-green-700 transition-colors shadow-lg shadow-green-900/20">
                    Finish & View Resume <Check className="w-5 h-5 ml-2" />
                </button>
            )}
        </div>
    </div>
  );
};

export default WizardForm;