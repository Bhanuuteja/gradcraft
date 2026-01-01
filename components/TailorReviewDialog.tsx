
import React, { useState } from 'react';
import { ResumeData } from '../types';
import LivePreview from './LivePreview';
import { Check, X, ArrowRight, Sparkles, MessageSquare, Send, AlertTriangle, RefreshCw } from 'lucide-react';
import { refineResume } from '../services/groqService';

interface TailorReviewDialogProps {
    original: ResumeData;
    options: {
        optionA: ResumeData;
        optionB: ResumeData;
        critique: string;
    };
    onSelect: (selected: ResumeData, label: string) => void;
    onCancel: () => void;
}

const TailorReviewDialog: React.FC<TailorReviewDialogProps> = ({ original, options, onSelect, onCancel }) => {
    // We keep local state for the options because they can be REFINED by the user
    // "A" and "B" are the starting points. "Custom" captures refinements.
    const [currentData, setCurrentData] = useState<ResumeData>(options.optionA);
    const [activeTab, setActiveTab] = useState<'A' | 'B'>('A');
    const [view, setView] = useState<'resume' | 'cover-letter'>('resume');
    const [chatInput, setChatInput] = useState('');
    const [isRefining, setIsRefining] = useState(false);
    const [feedback, setFeedback] = useState<string | null>(null);

    // Switch handler
    const handleSwitch = (tab: 'A' | 'B') => {
        setActiveTab(tab);
        // Resort to original option if switching (losing unsaved chat refinements? Maybe okay for now)
        setCurrentData(tab === 'A' ? options.optionA : options.optionB);
        setFeedback(null); // Clear previous chat feedback confirm
    };

    const handleRefine = async () => {
        if (!chatInput.trim()) return;
        setIsRefining(true);
        try {
            const refined = await refineResume(currentData, chatInput);
            setCurrentData(refined); // Update the preview immediately
            setChatInput('');
            setFeedback("Applied your feedback! ✨");
            setTimeout(() => setFeedback(null), 3000);
        } catch (error) {
            console.error(error);
            alert("Failed to refine: " + error);
        } finally {
            setIsRefining(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-neutral-900 w-full max-w-7xl h-[95vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-neutral-800">

                {/* Header */}
                <div className="p-4 border-b border-slate-100 dark:border-neutral-800 flex justify-between items-center bg-slate-50 dark:bg-neutral-950 shrink-0">
                    <div>
                        <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800 dark:text-white">
                            <Sparkles className="w-5 h-5 text-brand-primary" />
                            Resume Workshop
                        </h2>
                        <p className="text-xs text-slate-500 font-medium mt-1">Review the AI's critique and refine the result.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => onSelect(currentData, activeTab === 'A' ? 'Tailored (Conservative)' : 'Tailored (Bold)')}
                            className="px-6 py-2 bg-brand-primary hover:bg-brand-accent text-white rounded-lg font-bold shadow-lg shadow-blue-900/20 flex items-center gap-2 transition-all active:scale-[0.98] text-xs uppercase tracking-wider"
                        >
                            Review & Save <ArrowRight className="w-4 h-4" />
                        </button>
                        <button onClick={onCancel} className="p-2 hover:bg-slate-200 dark:hover:bg-neutral-800 rounded-lg transition-colors">
                            <X className="w-5 h-5 text-slate-400" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 flex min-h-0">

                    {/* Sidebar: Critique & Chat */}
                    <div className="w-96 border-r border-slate-100 dark:border-neutral-800 flex flex-col bg-white dark:bg-neutral-900 overflow-hidden shrink-0">

                        <div className="p-6 overflow-y-auto flex-1 space-y-6">
                            {/* Version Toggles */}
                            <div className="flex bg-slate-100 dark:bg-neutral-800 p-1 rounded-xl">
                                <button onClick={() => handleSwitch('A')} className={`flex-1 py-2 text-xs font-black uppercase tracking-wide rounded-lg transition-all ${activeTab === 'A' ? 'bg-white dark:bg-neutral-700 shadow-sm text-brand-primary' : 'text-slate-500'}`}>Variant A</button>
                                <button onClick={() => handleSwitch('B')} className={`flex-1 py-2 text-xs font-black uppercase tracking-wide rounded-lg transition-all ${activeTab === 'B' ? 'bg-white dark:bg-neutral-700 shadow-sm text-brand-primary' : 'text-slate-500'}`}>Variant B</button>
                            </div>

                            {/* Brutal Critique */}
                            <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 p-4 rounded-xl">
                                <div className="flex items-center gap-2 mb-2 text-red-600 dark:text-red-400">
                                    <AlertTriangle className="w-4 h-4" />
                                    <span className="text-xs font-black uppercase tracking-wider">The Roast</span>
                                </div>
                                <div className="text-xs text-red-800 dark:text-red-200 leading-relaxed font-medium whitespace-pre-wrap">
                                    {options.critique}
                                </div>
                            </div>

                            {/* Description */}
                            <div className="p-4 bg-slate-50 dark:bg-neutral-800/50 rounded-xl border border-slate-100 dark:border-neutral-800">
                                <span className="text-xs font-black uppercase tracking-widest text-slate-400 block mb-1">
                                    {activeTab === 'A' ? 'Selected: Conservative Match' : 'Selected: Bold & Action-Oriented'}
                                </span>
                                <p className="text-[11px] text-slate-500 leading-relaxed">
                                    {activeTab === 'A'
                                        ? "Focused on safe, ATS-friendly phrasing. Prioritizes keyword matches over style."
                                        : "Uses aggressive, executive-level language. Highlights impact and leadership."}
                                </p>
                            </div>
                        </div>

                        {/* Chat Interface */}
                        <div className="p-4 border-t border-slate-100 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-950">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 block flex items-center gap-2">
                                <MessageSquare className="w-3 h-3" /> Refine with AI
                            </label>
                            <div className="relative">
                                <textarea
                                    value={chatInput}
                                    onChange={e => setChatInput(e.target.value)}
                                    placeholder="Ex: 'Make the summary more arrogant', 'Add more metrics', 'Fix the typo in skills'..."
                                    className="w-full p-3 pr-10 text-sm bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl focus:ring-2 focus:ring-brand-primary outline-none resize-none h-24 custom-scrollbar"
                                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleRefine(); } }}
                                />
                                <button
                                    onClick={handleRefine}
                                    disabled={isRefining || !chatInput.trim()}
                                    className="absolute bottom-3 right-3 p-1.5 bg-brand-primary text-white rounded-lg hover:bg-brand-accent disabled:opacity-50 transition-all"
                                >
                                    {isRefining ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                </button>
                            </div>
                            {feedback && <p className="text-[10px] text-green-600 font-bold mt-2 animate-in fade-in">{feedback}</p>}
                        </div>

                    </div>

                    {/* Preview Area */}
                    <div className="flex-1 bg-slate-100 dark:bg-black p-8 overflow-y-auto flex flex-col items-center justify-start custom-scrollbar relative">

                        {/* View Toggle */}
                        <div className="sticky top-0 z-10 bg-white dark:bg-neutral-800 p-1 rounded-full shadow-lg border border-slate-200 dark:border-neutral-700 mb-6 flex gap-1">
                            <button
                                onClick={() => setView('resume')}
                                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${view === 'resume' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-neutral-700'}`}
                            >
                                Resume
                            </button>
                            <button
                                onClick={() => setView('cover-letter')}
                                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${view === 'cover-letter' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-neutral-700'}`}
                            >
                                Cover Letter
                            </button>
                        </div>

                        <div className="scale-[0.85] origin-top shadow-2xl transition-all duration-300 ease-in-out">
                            <LivePreview data={currentData} activeDoc={view} />
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default TailorReviewDialog;
