import React, { useState } from 'react';
import { Sparkles, X, Check, ArrowRight, Loader2, Briefcase } from 'lucide-react';

interface JobOptimizerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onOptimize: (jd: string) => Promise<void>;
    isOptimizing: boolean;
}

const JobOptimizerModal: React.FC<JobOptimizerModalProps> = ({ isOpen, onClose, onOptimize, isOptimizing }) => {
    const [jd, setJd] = useState('');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-neutral-900 w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 dark:border-neutral-800 flex flex-col max-h-[90vh] overflow-hidden">
                
                {/* Header */}
                <div className="p-6 border-b border-slate-100 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-950/50 flex justify-between items-start">
                    <div>
                        <h3 className="font-bold text-xl text-slate-900 dark:text-white flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-purple-600" />
                            Target Job Optimization
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Paste the job description below. AI will rewrite your summary and bullet points to match the keywords.
                        </p>
                    </div>
                    <button onClick={onClose} disabled={isOptimizing} className="p-2 hover:bg-slate-200 dark:hover:bg-neutral-800 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 flex-1 overflow-y-auto">
                    <label className="text-xs font-bold uppercase text-slate-500 mb-2 block tracking-wider">Job Description</label>
                    <textarea 
                        value={jd}
                        onChange={(e) => setJd(e.target.value)}
                        placeholder="Paste the full job description here (Responsibilities, Requirements, etc.)..."
                        className="w-full h-64 p-4 rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-black focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none text-sm leading-relaxed"
                    />
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-950/50 flex justify-between items-center">
                    <button 
                        onClick={onClose} 
                        disabled={isOptimizing}
                        className="text-slate-500 font-medium hover:text-slate-900 dark:hover:text-white px-4"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={() => onOptimize(jd)}
                        disabled={!jd.trim() || isOptimizing}
                        className={`
                            px-6 py-3 rounded-xl font-bold text-white flex items-center gap-2 shadow-lg transition-all
                            ${!jd.trim() || isOptimizing ? 'bg-slate-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 shadow-purple-900/20 hover:scale-105'}
                        `}
                    >
                        {isOptimizing ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" /> Optimizing...
                            </>
                        ) : (
                            <>
                                <Briefcase className="w-5 h-5" /> Tailor Resume
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default JobOptimizerModal;