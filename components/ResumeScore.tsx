import React, { useState, useEffect } from 'react';
import { ResumeData } from '../types';
import { calculateScore, ScoreFeedback } from '../services/scoringService';
import { CheckCircle2, AlertCircle, X, Activity } from 'lucide-react';

interface ResumeScoreProps {
    data: ResumeData;
}

const ResumeScore: React.FC<ResumeScoreProps> = ({ data }) => {
    const [result, setResult] = useState<ScoreFeedback>({ score: 0, items: [] });
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const res = calculateScore(data);
        setResult(res);
    }, [data]);

    const getColor = (score: number) => {
        if (score >= 80) return 'text-emerald-400';
        if (score >= 50) return 'text-yellow-400';
        return 'text-red-400';
    };

    return (
        <div className="relative font-sans">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 bg-slate-800/50 hover:bg-slate-700/50 pl-2 pr-4 py-1.5 rounded-full border border-slate-700 hover:border-slate-600 transition-all group shadow-sm"
            >
                {/* Progress Circle */}
                <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        {/* Background Circle */}
                        <path
                            className="text-slate-700"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                        />
                        {/* Progress Circle (Circumference ~100 for easy percentage) */}
                        <path
                            className={`${getColor(result.score)} transition-all duration-1000 ease-out`}
                            strokeDasharray={`${result.score}, 100`}
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                        />
                    </svg>
                    <span className="absolute text-[10px] font-bold text-white">{result.score}</span>
                </div>

                {/* Text Label */}
                <div className="hidden md:flex flex-col items-start justify-center">
                    <span className="text-[9px] text-slate-400 uppercase font-bold tracking-widest leading-none mb-0.5 whitespace-nowrap">ATS Score</span>
                    <span className="text-xs font-semibold text-white leading-none group-hover:text-emerald-400 transition-colors whitespace-nowrap">View Report</span>
                </div>
            </button>

            {/* Popover */}
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsOpen(false)}></div>
                    <div className="absolute top-14 right-0 z-50 w-80 bg-white dark:bg-neutral-900 rounded-xl shadow-2xl border border-slate-200 dark:border-neutral-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                        <div className="p-4 border-b border-slate-200 dark:border-neutral-800 flex justify-between items-center bg-slate-50 dark:bg-neutral-950">
                            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                <Activity className="w-4 h-4 text-slate-500" />
                                Score Analysis
                            </h3>
                            <button onClick={() => setIsOpen(false)} className="hover:bg-slate-200 dark:hover:bg-neutral-800 p-1 rounded transition-colors"><X className="w-4 h-4 text-slate-500" /></button>
                        </div>
                        
                        <div className="p-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            <div className="flex flex-col items-center justify-center mb-6 py-4 bg-slate-50 dark:bg-neutral-950/50 rounded-xl border border-slate-100 dark:border-neutral-800">
                                <div className={`text-5xl font-extrabold ${getColor(result.score)} mb-1`}>{result.score}</div>
                                <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Total Score</div>
                            </div>

                            <div className="space-y-3">
                                {result.items.map((item, idx) => (
                                    <div key={idx} className="flex gap-3 items-start p-2 hover:bg-slate-50 dark:hover:bg-neutral-800/50 rounded-lg transition-colors">
                                        <div className="mt-0.5 shrink-0">
                                            {item.passed ? (
                                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                            ) : (
                                                <AlertCircle className="w-5 h-5 text-red-500" />
                                            )}
                                        </div>
                                        <div>
                                            <p className={`text-sm font-semibold ${item.passed ? 'text-slate-700 dark:text-slate-300' : 'text-red-600 dark:text-red-400'}`}>
                                                {item.label}
                                            </p>
                                            {!item.passed && (
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{item.fix}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <div className="p-3 bg-slate-50 dark:bg-neutral-950 border-t border-slate-200 dark:border-neutral-800 text-center">
                            <p className="text-[10px] text-slate-400">Optimization based on common ATS patterns.</p>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ResumeScore;