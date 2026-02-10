
import React, { useState, useEffect } from 'react';
import { Key, X, ExternalLink, ShieldCheck, AlertCircle, Save, Zap } from 'lucide-react';

interface ApiKeyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (key: string) => void;
    initialKey: string;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onSave, initialKey }) => {
    const [key, setKey] = useState(initialKey);
    const [showKey, setShowKey] = useState(false);

    useEffect(() => {
        setKey(initialKey);
    }, [initialKey, isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white dark:bg-neutral-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-neutral-800 overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-neutral-800 flex justify-between items-center bg-slate-50 dark:bg-neutral-950">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                            <Zap className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-xl text-slate-900 dark:text-white">Unlock Unlimited Edits</h3>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Bring Your Own Key (BYOK)</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-neutral-800 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800/30 flex gap-3">
                        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        <p className="text-sm text-emerald-800 dark:text-emerald-300">
                            Your API key is stored <strong>locally</strong> in your browser. We never see or store it on our servers.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-end">
                            <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Groq API Key</label>
                            <a
                                href="https://console.groq.com/keys"
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] font-bold text-orange-600 hover:underline flex items-center gap-1"
                            >
                                Get Free Key <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                        </div>
                        <div className="relative">
                            <input
                                type={showKey ? "text" : "password"}
                                value={key}
                                onChange={(e) => setKey(e.target.value)}
                                placeholder="gsk_..."
                                className="w-full p-3 pr-12 rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-black focus:ring-2 focus:ring-orange-500 outline-none font-mono text-sm"
                            />
                            <button
                                onClick={() => setShowKey(!showKey)}
                                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                            >
                                {showKey ? <X className="w-4 h-4" /> : <Key className="w-4 h-4" />}
                            </button>
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium">
                            Paste your key here to bypass global rate limits and get your own personal high-speed quota.
                        </p>
                    </div>

                    <div className="bg-slate-50 dark:bg-neutral-950 p-4 rounded-xl border border-slate-100 dark:border-neutral-800 space-y-3">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400">
                            <AlertCircle className="w-3.5 h-3.5" /> Why do I need this?
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                            The free global tier has a daily limit shared by all users. By adding your own free key (which takes 30 seconds), you get your own dedicated 14,400 requests/day limit.
                        </p>
                    </div>
                </div>

                <div className="p-6 bg-slate-50 dark:bg-neutral-950 flex justify-end gap-3 border-t border-slate-100 dark:border-neutral-800">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Cancel</button>
                    <button
                        onClick={() => { onSave(key); onClose(); }}
                        className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-orange-900/20 transition-all active:scale-95"
                    >
                        <Save className="w-4 h-4" /> Save Settings
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ApiKeyModal;
