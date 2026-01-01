
import React, { useEffect, useState } from 'react';
import { User, SavedResume, Application, ApplicationStatus, ResumeData } from '../types';
import { getUserResumes, deleteResume, getApplications, saveApplication, updateApplicationStatus, saveResume, logout, deleteApplication } from '../services/supabase';
import { tailorResume } from '../services/groqService';
import TailorReviewDialog from './TailorReviewDialog';


import { FileText, Plus, Trash2, Clock, Sparkles, Building2, Briefcase, Calendar, CheckCircle2, ChevronRight, Loader2, Target, Search, ExternalLink, LogOut, LayoutGrid, ListTodo } from 'lucide-react';

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

    const handleReviewSelect = async (selectedData: ResumeData, variantLabel: string) => {
        if (!user || !selectedBaseresume) return;

        try {
            const newName = `${tailorForm.title || variantLabel} @ ${tailorForm.company || 'New Job'}`;

            // 1. Save new resume
            const savedResume = await saveResume(user.id, selectedData, undefined, newName);

            // 2. Auto-create application entry
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
            setReviewData(null); // Close review dialog
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
        <div className="min-h-screen bg-slate-50 dark:bg-black font-sans transition-colors">
            {/* Nav Bar */}
            <nav className="bg-white dark:bg-neutral-900 border-b border-slate-200 dark:border-neutral-800 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2">
                        <img src="/logo.png" alt="GradCraft" className="h-14 md:h-16 w-auto drop-shadow-sm transition-all" />
                    </div>
                    <div className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-neutral-800 p-1 rounded-xl">
                        <button onClick={() => setActiveView('overview')} className={`px-4 py-2 rounded-lg text-[10px] font-black tracking-widest transition-all ${activeView === 'overview' ? 'bg-white dark:bg-neutral-700 shadow-sm text-brand-primary' : 'text-slate-500'}`}>OVERVIEW</button>
                        <button onClick={() => setActiveView('tracker')} className={`px-4 py-2 rounded-lg text-[10px] font-black tracking-widest transition-all ${activeView === 'tracker' ? 'bg-white dark:bg-neutral-700 shadow-sm text-brand-primary' : 'text-slate-500'}`}>APPLICATIONS</button>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                        <p className="text-xs font-black text-slate-900 dark:text-white leading-none uppercase tracking-tighter">{user.name}</p>
                        <p className="text-[10px] text-slate-400 font-medium tracking-tight">{user.email}</p>
                    </div>
                    <button onClick={handleLogout} className="p-2.5 hover:bg-red-50 text-slate-400 hover:text-brand-primary rounded-xl transition-all" title="Logout">
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-10">
                {/* Hero / CTA */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase italic">My Dashboard</h1>
                        <p className="text-slate-500 font-medium text-xs mt-0.5">Manage your resumes and job applications.</p>
                    </div>
                    <div className="flex flex-wrap sm:flex-nowrap gap-2 w-full md:w-auto">

                        <button onClick={() => { setSelectedBaseResume(resumes[0] || null); setIsTailorOpen(true); }} className="flex-1 md:flex-none bg-brand-primary text-white border-2 border-brand-primary px-5 py-2.5 rounded-xl font-bold uppercase tracking-wide text-xs transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-brand-primary/20 hover:bg-brand-accent">
                            <Sparkles className="w-4 h-4" /> AI Tailor
                        </button>
                        <button onClick={onNew} className="flex-1 md:flex-none bg-white dark:bg-neutral-800 border-2 border-slate-200 dark:border-neutral-800 px-5 py-2.5 rounded-xl font-bold uppercase tracking-wide text-xs transition-all flex items-center justify-center gap-2 active:scale-95">
                            <Plus className="w-4 h-4" /> New Resume
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-sm flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-neutral-800 flex items-center justify-center text-slate-900 dark:text-white font-bold text-lg">{stats.total}</div>
                        <div><p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Active Apps</p><p className="text-sm font-bold">Applied</p></div>
                    </div>
                    <div className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-sm flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold text-lg">{stats.interviewing}</div>
                        <div><p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">In Progress</p><p className="text-sm font-bold">Interviews</p></div>
                    </div>
                    <div className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-sm flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 font-bold text-lg">{stats.offers}</div>
                        <div><p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Success Rate</p><p className="text-sm font-bold">Offers</p></div>
                    </div>
                </div>

                {activeView === 'overview' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        {/* My Resumes (Main Section) */}
                        <div className="lg:col-span-2 space-y-6">
                            <h2 className="text-2xl font-black uppercase tracking-tight">My Resumes</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {resumes.map(resume => (
                                    <div key={resume.id} onClick={() => onEdit(resume)} className="group bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-brand-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-neutral-800 flex items-center justify-center text-slate-400 group-hover:text-brand-primary transition-colors"><FileText className="w-4 h-4" /></div>
                                            <div className="flex gap-1">
                                                <button onClick={(e) => handleDeleteResume(e, resume.id)} className="p-1.5 text-slate-300 hover:text-red-500 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                                            </div>
                                        </div>
                                        <h3 className="font-bold text-slate-900 dark:text-white leading-tight mb-1 truncate text-sm">{resume.name}</h3>
                                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5"><Clock className="w-3 h-3" /> {new Date(resume.lastModified).toLocaleDateString()}</p>
                                    </div>
                                ))}
                                {resumes.length === 0 && (
                                    <div className="col-span-full p-12 border-2 border-dashed border-slate-200 dark:border-neutral-800 rounded-2xl text-center text-slate-400 font-bold uppercase text-[10px] tracking-widest">No Resumes Found</div>
                                )}
                            </div>
                        </div>

                        {/* Recent History (Sidebar) */}
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h2 className="text-lg font-bold uppercase tracking-tight">Application History</h2>
                                <button onClick={() => setActiveView('tracker')} className="text-brand-primary font-black text-[10px] uppercase tracking-widest hover:underline">View All</button>
                            </div>
                            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 overflow-hidden shadow-sm">
                                {apps.slice(0, 5).map(app => (
                                    <div key={app.id} className="p-5 border-b border-slate-100 dark:border-neutral-800 last:border-0 hover:bg-slate-50 dark:hover:bg-neutral-800/50 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="font-bold text-slate-900 dark:text-white leading-tight uppercase text-xs">{app.role}</h4>
                                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-tighter mt-0.5">{app.company}</p>
                                            </div>
                                            <span className={`text-[9px] font-black uppercase py-1 px-2 rounded-full ${app.status === 'Offer' ? 'bg-emerald-100 text-emerald-700' :
                                                app.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                                    app.status === 'Interviewing' ? 'bg-indigo-100 text-indigo-700' :
                                                        'bg-slate-100 text-slate-700'
                                                }`}>{app.status}</span>
                                        </div>
                                        <div className="flex justify-between items-center mt-3">
                                            <span className="text-[9px] text-slate-400 font-medium">{new Date(app.appliedDate).toLocaleDateString()}</span>
                                            <button onClick={() => { const r = resumes.find(x => x.id === app.resumeId); if (r) onEdit(r); }} className="text-[10px] font-bold text-brand-primary hover:underline flex items-center gap-1">View Resume <ExternalLink className="w-3 h-3" /></button>
                                        </div>
                                    </div>
                                ))}
                                {apps.length === 0 && <div className="p-8 text-center text-slate-400 font-black uppercase tracking-widest text-xs italic">No History.</div>}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-slate-200 dark:border-neutral-800 overflow-hidden shadow-sm animate-in fade-in duration-500">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 dark:bg-neutral-950 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-200 dark:border-neutral-800">
                                <tr>
                                    <th className="px-8 py-6">Role & Company</th>
                                    <th className="px-8 py-6">Status</th>
                                    <th className="px-8 py-6">Applied Date</th>
                                    <th className="px-8 py-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-neutral-800">
                                {apps.map(app => (
                                    <tr key={app.id} className="group hover:bg-slate-50 dark:hover:bg-neutral-800/50 transition-all">
                                        <td className="px-8 py-6">
                                            <div className="font-black text-slate-900 dark:text-white uppercase text-sm">{app.role}</div>
                                            <div className="text-[10px] text-slate-500 font-black uppercase tracking-tight mt-0.5">{app.company}</div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <select
                                                value={app.status}
                                                onChange={(e) => handleUpdateStatus(app.id, e.target.value as ApplicationStatus)}
                                                className={`text-[9px] font-black uppercase py-2 px-4 rounded-full border-none focus:ring-0 cursor-pointer ${app.status === 'Offer' ? 'bg-emerald-100 text-emerald-700' :
                                                    app.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                                        app.status === 'Interviewing' ? 'bg-indigo-100 text-indigo-700' :
                                                            'bg-slate-100 text-slate-700'
                                                    }`}
                                            >
                                                <option value="Applied">Applied</option>
                                                <option value="Interviewing">Interviewing</option>
                                                <option value="Rejected">Rejected</option>
                                                <option value="Offer">Offer</option>
                                            </select>
                                        </td>
                                        <td className="px-8 py-6 text-xs text-slate-500 font-black uppercase tracking-widest">{new Date(app.appliedDate).toLocaleDateString()}</td>
                                        <td className="px-8 py-6 text-right">
                                            <button onClick={() => { const r = resumes.find(x => x.id === app.resumeId); if (r) onEdit(r); }} className="p-3 text-slate-400 hover:text-brand-primary transition-all"><ExternalLink className="w-5 h-5" /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>





            {/* Tailor Modal */}
            {isTailorOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-neutral-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-neutral-800 flex flex-col max-h-[90vh]">
                        <div className="p-6 md:p-8 border-b border-slate-100 dark:border-neutral-800 flex justify-between items-center bg-slate-50 dark:bg-neutral-950">
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">New Application</h3>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-wide mt-1">Tailor resume for a specific role</p>
                            </div>
                            <button onClick={() => setIsTailorOpen(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-neutral-800 rounded-full transition-colors"><div className="w-5 h-5 flex items-center justify-center font-bold">✕</div></button>
                        </div>
                        <div className="p-6 md:p-8 space-y-6 overflow-y-auto">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Base Resume</label>
                                <select
                                    className="w-full p-4 bg-slate-50 dark:bg-black border border-slate-200 dark:border-neutral-800 rounded-xl font-bold text-sm focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all appearance-none"
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
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Target Company</label>
                                    <input placeholder="Ex. Google, Tesla..." value={tailorForm.company} onChange={e => setTailorForm({ ...tailorForm, company: e.target.value })} className="w-full p-4 bg-slate-50 dark:bg-black border border-slate-200 dark:border-neutral-800 rounded-xl font-bold text-sm focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Job Title</label>
                                    <input placeholder="Ex. Product Designer" value={tailorForm.title} onChange={e => setTailorForm({ ...tailorForm, title: e.target.value })} className="w-full p-4 bg-slate-50 dark:bg-black border border-slate-200 dark:border-neutral-800 rounded-xl font-bold text-sm focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Job Description (JD)</label>
                                <textarea placeholder="Paste the full job description here..." value={tailorForm.jd} onChange={e => setTailorForm({ ...tailorForm, jd: e.target.value })} className="w-full p-4 bg-slate-50 dark:bg-black border border-slate-200 dark:border-neutral-800 rounded-xl font-medium text-sm h-64 resize-none focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all custom-scrollbar leading-relaxed" />
                            </div>
                        </div>
                        <div className="p-6 md:p-8 border-t border-slate-100 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-950 flex justify-end gap-3">
                            <button onClick={() => setIsTailorOpen(false)} className="px-6 py-3 font-bold uppercase tracking-widest text-xs text-slate-400 hover:text-slate-600 transition-colors">Cancel</button>
                            <button onClick={handleRunTailor} disabled={isTailoring || !tailorForm.jd} className="bg-brand-primary hover:bg-brand-accent text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-brand-primary/20 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                                {isTailoring ? <><Loader2 className="w-4 h-4 animate-spin" /> Optimizing...</> : <><Sparkles className="w-4 h-4" /> Create Tailored Resume</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* AI Review Modal */}
            {reviewData && (
                <TailorReviewDialog
                    original={reviewData.original}
                    options={reviewData.result}
                    onSelect={handleReviewSelect}
                    onCancel={() => setReviewData(null)}
                />
            )}
        </div >
    );
};

export default Dashboard;
