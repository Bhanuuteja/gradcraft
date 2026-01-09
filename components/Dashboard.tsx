
import React, { useEffect, useState } from 'react';
import { User, SavedResume, Application, ApplicationStatus, ResumeData } from '../types';
import { getUserResumes, deleteResume, getApplications, saveApplication, updateApplicationStatus, saveResume, logout, deleteApplication, supabase } from '../services/supabase';
import { tailorResume, calculateATSScore } from '../services/groqService';
import TailorReviewDialog from './TailorReviewDialog';
import ATSScoreCard from './ATSScoreCard';
import { ATSScoreResult } from '../types';


import { FileText, Plus, Trash2, Clock, Sparkles, Building2, Briefcase, Calendar, CheckCircle2, ChevronRight, Loader2, Target, Search, ExternalLink, LogOut, LayoutGrid, ListTodo, Award, Plug } from 'lucide-react';

interface DashboardProps {
    user: User;
    onEdit: (resume: SavedResume) => void;
    onNew: () => void;
    onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onEdit, onNew, onLogout }) => {
    const [resumes, setResumes] = useState<SavedResume[]>([]);
    const [apps, setApps] = useState<Application[]>([]);
    const [activeView, setActiveView] = useState<'overview' | 'tracker'>('overview');

    // Tailor State
    const [isTailorOpen, setIsTailorOpen] = useState(false);
    const [selectedBaseresume, setSelectedBaseResume] = useState<SavedResume | null>(null);
    const [tailorForm, setTailorForm] = useState({ title: '', company: '', jd: '' });
    const [isTailoring, setIsTailoring] = useState(false);
    const [reviewData, setReviewData] = useState<{ original: ResumeData, result: { optionA: ResumeData, optionB: ResumeData, critique: string } } | null>(null);

    // ATS Check State
    const [atsResult, setAtsResult] = useState<ATSScoreResult | null>(null);
    const [isScoring, setIsScoring] = useState(false);
    const [isAtsModalOpen, setIsAtsModalOpen] = useState(false);
    const [atsForm, setAtsForm] = useState({ jd: '' });

    useEffect(() => {
        refresh();
    }, [user]);

    const refresh = async () => {
        try {
            const r = await getUserResumes(user.id);
            setResumes(r);
            const a = await getApplications(user.id);
            setApps(a);
        } catch (error) {
            console.error(error);
        }
    };

    const handleLogout = () => {
        logout();
        onLogout();
    };

    const handleDeleteResume = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!confirm("Delete this resume?")) return;
        await deleteResume(id);
        refresh();
    };

    const handleDeleteApp = async (id: string) => {
        if (!confirm("Delete this application?")) return;
        await deleteApplication(id);
        refresh();
    };

    const handleUpdateStatus = async (appId: string, status: ApplicationStatus) => {
        await updateApplicationStatus(appId, status);
        refresh();
    };

    const handleRunTailor = async () => {
        if (!selectedBaseresume || !tailorForm.jd) return;
        setIsTailoring(true);
        try {
            const tailoredResult = await tailorResume(selectedBaseresume.data, tailorForm.jd);
            // Open Review Dialog
            setReviewData({
                original: selectedBaseresume.data,
                result: tailoredResult
            });
            setIsTailorOpen(false); // Close input modal
        } catch (e: any) {
            console.error(e);
            alert(`Failed to tailor resume: ${e.message || e}`);
        } finally {
            setIsTailoring(false);
        }
    };

    // New Handler for the Global ATS Check Modal
    const handleRunAtsCheck = async () => {
        if (!selectedBaseresume || !atsForm.jd) return;
        setIsScoring(true);
        try {
            const result = await calculateATSScore(selectedBaseresume.data, atsForm.jd);
            setAtsResult(result);
            setIsAtsModalOpen(false);
        } catch (error: any) {
            alert('Scoring failed: ' + error.message);
        } finally {
            setIsScoring(false);
        }
    };

    // Keep the individual card handler for quick access
    const handleCheckScoreCard = async (e: React.MouseEvent, resume: SavedResume) => {
        e.stopPropagation();
        setSelectedBaseResume(resume);
        setIsAtsModalOpen(true);
    };

    const handleReviewSelect = async (selectedData: ResumeData, variantLabel: string) => {
        if (!user || !selectedBaseresume) return;

        try {
            const newName = `${tailorForm.title || variantLabel} @ ${tailorForm.company || 'New Job'}`;
            const savedResume = await saveResume(user.id, selectedData, undefined, newName);

            if (tailorForm.company && tailorForm.title) {
                await saveApplication({
                    userId: user.id,
                    resumeId: savedResume.id,
                    company: tailorForm.company,
                    role: tailorForm.title,
                    status: 'Applied',
                    appliedDate: Date.now(),
                    jd: tailorForm.jd
                });
            }

            await refresh();
            setReviewData(null);
            setTailorForm({ title: '', company: '', jd: '' });
        } catch (error) {
            console.error("Failed to save selection:", error);
            alert("Failed to save resume selection.");
        }
    };



    const stats = {
        total: apps.length,
        interviewing: apps.filter(a => a.status === 'Interviewing').length,
        offers: apps.filter(a => a.status === 'Offer').length,
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans transition-colors">
            {/* Nav Bar */}
            <nav className="bg-white border-b border-neutral-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-black rounded-[6px] flex items-center justify-center text-white text-xs font-bold">G</div>
                        <span className="font-serif font-bold text-xl tracking-tight text-neutral-900">GradCraft</span>
                    </div>
                    <div className="hidden md:flex items-center gap-1 bg-neutral-100 p-1 rounded-xl">
                        <button onClick={() => setActiveView('overview')} className={`px-4 py-2 rounded-lg text-[10px] font-black tracking-widest transition-all ${activeView === 'overview' ? 'bg-white shadow-sm text-black' : 'text-neutral-500'}`}>OVERVIEW</button>
                        <button onClick={() => setActiveView('tracker')} className={`px-4 py-2 rounded-lg text-[10px] font-black tracking-widest transition-all ${activeView === 'tracker' ? 'bg-white shadow-sm text-black' : 'text-neutral-500'}`}>APPLICATIONS</button>
                    </div>
                </div>

                <div className="flex items-center gap-4">

                    <div className="text-right hidden sm:block">
                        <p className="text-xs font-black text-neutral-900 leading-none uppercase tracking-tighter">{user.name}</p>
                        <p className="text-[10px] text-neutral-400 font-medium tracking-tight">{user.email}</p>
                    </div>
                    <button onClick={handleLogout} className="p-2.5 hover:bg-neutral-100 text-neutral-400 hover:text-black rounded-xl transition-all" title="Logout">
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </nav >

            <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-10">
                {/* Hero / CTA */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-neutral-900 uppercase italic">My Dashboard</h1>
                        <p className="text-neutral-500 font-medium text-xs mt-0.5">Manage your resumes and job applications.</p>
                    </div>
                    <div className="flex flex-wrap sm:flex-nowrap gap-2 w-full md:w-auto">
                        <button onClick={() => { setSelectedBaseResume(resumes[0] || null); setIsTailorOpen(true); }} className="flex-1 md:flex-none bg-black text-white border-2 border-black px-5 py-2.5 rounded-xl font-bold uppercase tracking-wide text-xs transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-black/20 hover:bg-neutral-800">
                            <Sparkles className="w-4 h-4" /> AI Tailor
                        </button>
                        <button onClick={() => { setSelectedBaseResume(resumes[0] || null); setIsAtsModalOpen(true); }} className="flex-1 md:flex-none bg-white text-black border-2 border-black px-5 py-2.5 rounded-xl font-bold uppercase tracking-wide text-xs transition-all flex items-center justify-center gap-2 active:scale-95 hover:bg-neutral-50">
                            <Target className="w-4 h-4" /> Check Score
                        </button>
                        <button onClick={onNew} className="flex-1 md:flex-none bg-white border-2 border-neutral-200 px-5 py-2.5 rounded-xl font-bold uppercase tracking-wide text-xs transition-all flex items-center justify-center gap-2 active:scale-95 hover:border-black hover:text-black text-neutral-500">
                            <Plus className="w-4 h-4" /> New Resume
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-900 font-bold text-lg">{stats.total}</div>
                        <div><p className="text-[10px] font-bold uppercase text-neutral-400 tracking-wider">Active Apps</p><p className="text-sm font-bold text-neutral-900">Applied</p></div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-lg">{stats.interviewing}</div>
                        <div><p className="text-[10px] font-bold uppercase text-neutral-400 tracking-wider">In Progress</p><p className="text-sm font-bold text-neutral-900">Interviews</p></div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600 font-bold text-lg">{stats.offers}</div>
                        <div><p className="text-[10px] font-bold uppercase text-neutral-400 tracking-wider">Success Rate</p><p className="text-sm font-bold text-neutral-900">Offers</p></div>
                    </div>
                </div>

                {activeView === 'overview' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        {/* My Resumes (Main Section) */}
                        <div className="lg:col-span-2 space-y-6">
                            <h2 className="text-2xl font-black uppercase tracking-tight text-neutral-900">My Resumes</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {resumes.map(resume => (
                                    <div key={resume.id} onClick={() => onEdit(resume)} className="group bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer relative overflow-hidden active:scale-[0.99]">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-black opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-400 group-hover:text-black transition-colors"><FileText className="w-4 h-4" /></div>
                                            <div className="flex gap-1">
                                                <button onClick={(e) => handleDeleteResume(e, resume.id)} className="p-1.5 text-neutral-300 hover:text-red-600 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                                            </div>
                                        </div>
                                        <h3 className="font-bold text-neutral-900 leading-tight mb-1 truncate text-sm">{resume.name}</h3>
                                        <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5"><Clock className="w-3 h-3" /> {new Date(resume.lastModified).toLocaleDateString()}</p>
                                    </div>
                                ))}
                                {resumes.length === 0 && (
                                    <div className="col-span-full p-12 border-2 border-dashed border-neutral-200 rounded-2xl text-center text-neutral-400 font-bold uppercase text-[10px] tracking-widest">No Resumes Found</div>
                                )}
                            </div>
                        </div>

                        {/* Recent History (Sidebar) */}
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h2 className="text-lg font-bold uppercase tracking-tight text-neutral-900">Application History</h2>
                                <button onClick={() => setActiveView('tracker')} className="text-neutral-900 font-black text-[10px] uppercase tracking-widest hover:underline">View All</button>
                            </div>
                            <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
                                {apps.slice(0, 5).map(app => (
                                    <div key={app.id} className="p-5 border-b border-neutral-100 last:border-0 hover:bg-neutral-50 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="font-bold text-neutral-900 leading-tight uppercase text-xs">{app.role}</h4>
                                                <p className="text-[10px] text-neutral-500 font-black uppercase tracking-tighter mt-0.5">{app.company}</p>
                                            </div>
                                            <span className={`text-[9px] font-black uppercase py-1 px-2 rounded-full ${app.status === 'Offer' ? 'bg-green-100 text-green-700' :
                                                app.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                                    app.status === 'Interviewing' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-neutral-100 text-neutral-700'
                                                }`}>{app.status}</span>
                                        </div>
                                        <div className="flex justify-between items-center mt-3">
                                            <span className="text-[9px] text-neutral-400 font-medium">{new Date(app.appliedDate).toLocaleDateString()}</span>
                                            <button onClick={() => { const r = resumes.find(x => x.id === app.resumeId); if (r) onEdit(r); }} className="text-[10px] font-bold text-neutral-900 hover:underline flex items-center gap-1">View Resume <ExternalLink className="w-3 h-3" /></button>
                                        </div>
                                    </div>
                                ))}
                                {apps.length === 0 && <div className="p-8 text-center text-neutral-400 font-black uppercase tracking-widest text-xs italic">No History.</div>}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl border border-neutral-200 overflow-hidden shadow-sm animate-in fade-in duration-500">
                        <table className="w-full text-left">
                            <thead className="bg-neutral-50 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 border-b border-neutral-200">
                                <tr>
                                    <th className="px-8 py-6">Role & Company</th>
                                    <th className="px-8 py-6">Status</th>
                                    <th className="px-8 py-6">Applied Date</th>
                                    <th className="px-8 py-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {apps.map(app => (
                                    <tr key={app.id} className="group hover:bg-neutral-50 transition-all">
                                        <td className="px-8 py-6">
                                            <div className="font-black text-neutral-900 uppercase text-sm">{app.role}</div>
                                            <div className="text-[10px] text-neutral-500 font-black uppercase tracking-tight mt-0.5">{app.company}</div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <select
                                                value={app.status}
                                                onChange={(e) => handleUpdateStatus(app.id, e.target.value as ApplicationStatus)}
                                                className={`text-[9px] font-black uppercase py-2 px-4 rounded-full border-none focus:ring-0 cursor-pointer ${app.status === 'Offer' ? 'bg-green-100 text-green-700' :
                                                    app.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                                        app.status === 'Interviewing' ? 'bg-blue-100 text-blue-700' :
                                                            'bg-neutral-100 text-neutral-700'
                                                    }`}
                                            >
                                                <option value="Applied">Applied</option>
                                                <option value="Interviewing">Interviewing</option>
                                                <option value="Rejected">Rejected</option>
                                                <option value="Offer">Offer</option>
                                            </select>
                                        </td>
                                        <td className="px-8 py-6 text-xs text-neutral-500 font-black uppercase tracking-widest">{new Date(app.appliedDate).toLocaleDateString()}</td>
                                        <td className="px-8 py-6 text-right">
                                            <button onClick={() => { const r = resumes.find(x => x.id === app.resumeId); if (r) onEdit(r); }} className="p-3 text-neutral-400 hover:text-black transition-all"><ExternalLink className="w-5 h-5" /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Loading Overlay */}
            {
                isScoring && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-white/80 backdrop-blur-sm">
                        <div className="bg-white p-8 rounded-2xl flex flex-col items-center shadow-2xl border border-neutral-200">
                            <Loader2 className="w-10 h-10 animate-spin text-black mb-4" />
                            <h3 className="font-bold text-lg text-neutral-900">Analyzing Resume...</h3>
                            <p className="text-neutral-500 text-sm">Please wait while the ATS engine grades your resume.</p>
                        </div>
                    </div>
                )
            }

            {/* ATS Score Modal */}
            {atsResult && <ATSScoreCard result={atsResult} onClose={() => setAtsResult(null)} />}

            {/* ATS Check Input Modal */}
            {
                isAtsModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-neutral-200 flex flex-col max-h-[90vh]">
                            <div className="p-6 md:p-8 border-b border-neutral-100 flex justify-between items-center bg-neutral-50">
                                <div>
                                    <h3 className="text-xl font-black uppercase tracking-tight text-neutral-900">Check ATS Score</h3>
                                    <p className="text-xs text-neutral-500 font-bold uppercase tracking-wide mt-1">Select a resume and paste the job description to get a grade.</p>
                                </div>
                                <button onClick={() => setIsAtsModalOpen(false)} className="p-2 hover:bg-neutral-200 rounded-full transition-colors"><div className="w-5 h-5 flex items-center justify-center font-bold">✕</div></button>
                            </div>
                            <div className="p-6 md:p-8 space-y-6 overflow-y-auto">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest px-1">Resume to Check</label>
                                    <select
                                        className="w-full p-4 bg-neutral-50 border border-neutral-200 rounded-xl font-bold text-sm focus:ring-2 focus:ring-black/10 outline-none transition-all appearance-none"
                                        value={selectedBaseresume?.id || ''}
                                        onChange={(e) => setSelectedBaseResume(resumes.find(r => r.id === e.target.value) || null)}
                                    >
                                        {resumes.map(r => (
                                            <option key={r.id} value={r.id}>{r.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest px-1">Job Description</label>
                                    <textarea
                                        placeholder="Paste the Job Description here..."
                                        value={atsForm.jd}
                                        onChange={e => setAtsForm({ jd: e.target.value })}
                                        className="w-full p-4 bg-neutral-50 border border-neutral-200 rounded-xl font-medium text-sm h-64 resize-none focus:ring-2 focus:ring-black/10 outline-none transition-all custom-scrollbar leading-relaxed"
                                    />
                                </div>
                            </div>
                            <div className="p-6 md:p-8 border-t border-neutral-100 bg-neutral-50 flex justify-end gap-3">
                                <button onClick={() => setIsAtsModalOpen(false)} className="px-6 py-3 font-bold uppercase tracking-widest text-xs text-neutral-400 hover:text-neutral-600 transition-colors">Cancel</button>
                                <button onClick={handleRunAtsCheck} disabled={isScoring || !atsForm.jd || !selectedBaseresume} className="bg-black hover:bg-neutral-800 text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-black/20 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                                    {isScoring ? <><Loader2 className="w-4 h-4 animate-spin" /> Scoring...</> : <><Target className="w-4 h-4" /> Check Score</>}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Tailor Modal */}
            {
                isTailorOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-neutral-200 flex flex-col max-h-[90vh]">
                            <div className="p-6 md:p-8 border-b border-neutral-100 flex justify-between items-center bg-neutral-50">
                                <div>
                                    <h3 className="text-xl font-black uppercase tracking-tight text-neutral-900">New Application</h3>
                                    <p className="text-xs text-neutral-500 font-bold uppercase tracking-wide mt-1">Tailor resume for a specific role</p>
                                </div>
                                <button onClick={() => setIsTailorOpen(false)} className="p-2 hover:bg-neutral-200 rounded-full transition-colors"><div className="w-5 h-5 flex items-center justify-center font-bold">✕</div></button>
                            </div>
                            <div className="p-6 md:p-8 space-y-6 overflow-y-auto">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest px-1">Base Resume</label>
                                    <select
                                        className="w-full p-4 bg-neutral-50 border border-neutral-200 rounded-xl font-bold text-sm focus:ring-2 focus:ring-black/10 outline-none transition-all appearance-none"
                                        value={selectedBaseresume?.id || ''}
                                        onChange={(e) => setSelectedBaseResume(resumes.find(r => r.id === e.target.value) || null)}
                                    >
                                        {resumes.map(r => (
                                            <option key={r.id} value={r.id}>{r.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest px-1">Target Company</label>
                                        <input placeholder="Ex. Google, Tesla..." value={tailorForm.company} onChange={e => setTailorForm({ ...tailorForm, company: e.target.value })} className="w-full p-4 bg-neutral-50 border border-neutral-200 rounded-xl font-bold text-sm focus:ring-2 focus:ring-black/10 outline-none transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest px-1">Job Title</label>
                                        <input placeholder="Ex. Product Designer" value={tailorForm.title} onChange={e => setTailorForm({ ...tailorForm, title: e.target.value })} className="w-full p-4 bg-neutral-50 border border-neutral-200 rounded-xl font-bold text-sm focus:ring-2 focus:ring-black/10 outline-none transition-all" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest px-1">Job Description (JD)</label>
                                    <textarea placeholder="Paste the full job description here..." value={tailorForm.jd} onChange={e => setTailorForm({ ...tailorForm, jd: e.target.value })} className="w-full p-4 bg-neutral-50 border border-neutral-200 rounded-xl font-medium text-sm h-64 resize-none focus:ring-2 focus:ring-black/10 outline-none transition-all custom-scrollbar leading-relaxed" />
                                </div>
                            </div>
                            <div className="p-6 md:p-8 border-t border-neutral-100 bg-neutral-50 flex justify-end gap-3">
                                <button onClick={() => setIsTailorOpen(false)} className="px-6 py-3 font-bold uppercase tracking-widest text-xs text-neutral-400 hover:text-neutral-600 transition-colors">Cancel</button>
                                <button onClick={handleRunTailor} disabled={isTailoring || !tailorForm.jd} className="bg-black hover:bg-neutral-800 text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-black/20 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                                    {isTailoring ? <><Loader2 className="w-4 h-4 animate-spin" /> Optimizing...</> : <><Sparkles className="w-4 h-4" /> Create Tailored Resume</>}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* AI Review Modal */}
            {
                reviewData && (
                    <TailorReviewDialog
                        original={reviewData.original}
                        options={reviewData.result}
                        onSelect={handleReviewSelect}
                        onCancel={() => setReviewData(null)}
                    />
                )
            }
        </div >
    );
};

export default Dashboard;
