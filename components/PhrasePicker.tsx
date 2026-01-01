import React, { useState } from 'react';
import { PHRASE_CATEGORIES } from '../data/phrases';
import { Search, X, Plus } from 'lucide-react';

interface PhrasePickerProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (phrase: string) => void;
}

const PhrasePicker: React.FC<PhrasePickerProps> = ({ isOpen, onClose, onSelect }) => {
    const [activeCategory, setActiveCategory] = useState<string>(Object.keys(PHRASE_CATEGORIES)[0]);
    const [search, setSearch] = useState('');

    if (!isOpen) return null;

    const categories = Object.keys(PHRASE_CATEGORIES);
    const phrases = (PHRASE_CATEGORIES as any)[activeCategory] || [];
    
    const filteredPhrases = phrases.filter((p: string) => p.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-neutral-900 w-full max-w-2xl rounded-xl shadow-2xl border border-slate-200 dark:border-neutral-800 flex flex-col max-h-[80vh]">
                
                {/* Header */}
                <div className="p-4 border-b border-slate-200 dark:border-neutral-800 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white">Quick-Add Phrases</h3>
                    <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {/* Search */}
                <div className="p-4 border-b border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-950">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                        <input 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search phrases..."
                            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                    </div>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar Categories */}
                    <div className="w-1/3 border-r border-slate-200 dark:border-neutral-800 overflow-y-auto bg-slate-50 dark:bg-neutral-950">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`w-full text-left px-4 py-3 text-sm font-medium border-l-4 transition-all ${
                                    activeCategory === cat 
                                    ? 'bg-white dark:bg-neutral-900 border-red-500 text-red-600 dark:text-red-400' 
                                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-neutral-900'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Phrase List */}
                    <div className="w-2/3 overflow-y-auto p-4 space-y-3 bg-white dark:bg-neutral-900">
                        {filteredPhrases.length > 0 ? filteredPhrases.map((phrase: string, idx: number) => (
                            <div key={idx} className="group p-3 rounded-lg border border-slate-100 dark:border-neutral-800 hover:border-red-200 dark:hover:border-red-900 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all cursor-pointer" onClick={() => onSelect(phrase)}>
                                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-2">{phrase}</p>
                                <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-xs font-bold text-red-600 flex items-center gap-1">
                                        <Plus className="w-3 h-3" /> Add
                                    </span>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-10 text-slate-400 text-sm">
                                No phrases found. Try a different category.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PhrasePicker;