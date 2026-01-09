
import React from 'react';
import { ATSScoreResult } from '../types';
import { AlertCircle, CheckCircle, XCircle, Award } from 'lucide-react';

interface ATSScoreCardProps {
    result: ATSScoreResult;
    onClose: () => void;
}

const ATSScoreCard: React.FC<ATSScoreCardProps> = ({ result, onClose }) => {
    // Determine color based on score
    const getColor = (score: number) => {
        if (score >= 90) return 'text-green-500'; // Perfect
        if (score >= 75) return 'text-blue-500'; // Good
        if (score >= 50) return 'text-yellow-500'; // Average
        return 'text-red-500'; // Poor
    };

    const getBgColor = (score: number) => {
        if (score >= 90) return 'bg-green-500';
        if (score >= 75) return 'bg-blue-500';
        if (score >= 50) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const strokeDashoffset = 440 - (440 * result.score) / 100;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row">

                {/* Left Panel: Score and High Level */}
                <div className="w-full md:w-1/3 bg-slate-50 dark:bg-black p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-200 dark:border-neutral-800">
                    <div className="relative w-48 h-48 mb-6">
                        {/* SVG Circle Progress */}
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                            <circle cx="80" cy="80" r="70" fill="none" stroke="#e2e8f0" strokeWidth="12" className="dark:stroke-neutral-800" />
                            <circle
                                cx="80" cy="80" r="70" fill="none"
                                stroke="currentColor" strokeWidth="12"
                                strokeDasharray="440"
                                strokeDashoffset={strokeDashoffset}
                                strokeLinecap="round"
                                className={`${getColor(result.score)} transition-all duration-1000 ease-out`}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className={`text-5xl font-black ${getColor(result.score)}`}>{result.score}</span>
                            <span className="text-xs font-bold uppercase text-slate-400 mt-1">ATS Score</span>
                        </div>
                    </div>

                    <h3 className={`text-xl font-black uppercase tracking-tight mb-2 ${getColor(result.score)}`}>
                        {result.score >= 90 ? "Excellent Match" :
                            result.score >= 75 ? "Strong Candidate" :
                                result.score >= 50 ? "Needs Improvement" : "Weak Match"}
                    </h3>
                    <p className="text-center text-sm text-slate-500 px-4">
                        {result.score >= 75 ? "Your resume is highly optimized for this role." : "You are missing critical keywords and formatting standards."}
                    </p>
                </div>

                {/* Right Panel: Details */}
                <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-black uppercase text-slate-900 dark:text-white flex items-center gap-3">
                            <Award className="w-6 h-6 text-brand-primary" />
                            Detailed Analysis
                        </h2>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-full transition-colors text-slate-500">
                            ✕
                        </button>
                    </div>

                    <div className="space-y-8">
                        {/* Missing Keywords */}
                        {result.missingKeywords.length > 0 && (
                            <div className="animate-in slide-in-from-right-4 duration-500 delay-100">
                                <h4 className="text-sm font-black uppercase text-red-500 mb-3 flex items-center gap-2">
                                    <XCircle className="w-4 h-4" /> Missing Keywords
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {result.missingKeywords.map((kw, i) => (
                                        <span key={i} className="px-3 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-bold rounded-lg border border-red-100 dark:border-red-900/30">
                                            {kw}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Critical Issues */}
                        {result.criticalIssues.length > 0 && (
                            <div className="animate-in slide-in-from-right-4 duration-500 delay-200">
                                <h4 className="text-sm font-black uppercase text-orange-500 mb-3 flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" /> Critical Issues
                                </h4>
                                <ul className="space-y-2">
                                    {result.criticalIssues.map((issue, i) => (
                                        <li key={i} className="text-sm text-slate-600 dark:text-slate-300 flex items-start gap-2">
                                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
                                            {issue}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Positive Signals */}
                        <div className="animate-in slide-in-from-right-4 duration-500 delay-300">
                            <h4 className="text-sm font-black uppercase text-green-600 mb-3 flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" /> What You Did Well
                            </h4>
                            <ul className="space-y-2">
                                {result.positiveSignals.map((signal, i) => (
                                    <li key={i} className="text-sm text-slate-600 dark:text-slate-300 flex items-start gap-2">
                                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                                        {signal}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-neutral-800">
                        <button onClick={onClose} className="w-full py-3 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-black rounded-xl font-bold uppercase tracking-widest transition-all shadow-lg">
                            Close & Fix Issues
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ATSScoreCard;
