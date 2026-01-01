
import React, { useRef } from 'react';
import { Bold, Italic, List, Type } from 'lucide-react';

interface RichTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    value: string;
    onChangeValue: (value: string) => void;
}

const RichTextarea: React.FC<RichTextareaProps> = ({ value, onChangeValue, className, ...props }) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const insertFormat = (format: 'bold' | 'italic' | 'list') => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const selection = text.substring(start, end);

        let newText = '';
        let cursorOffset = 0;

        if (format === 'bold') {
            newText = text.substring(0, start) + `**${selection || 'text'}**` + text.substring(end);
            cursorOffset = selection ? 4 : 2;
        } else if (format === 'italic') {
            newText = text.substring(0, start) + `*${selection || 'text'}*` + text.substring(end);
            cursorOffset = selection ? 2 : 1;
        } else if (format === 'list') {
            if (selection.includes('\n') || selection) {
                const list = selection.split('\n').map(l => `• ${l.replace(/^[•-]\s*/, '')}`).join('\n');
                newText = text.substring(0, start) + list + text.substring(end);
                cursorOffset = list.length;
            } else {
                newText = text.substring(0, start) + `• ` + text.substring(end);
                cursorOffset = 2;
            }
        }

        onChangeValue(newText);

        setTimeout(() => {
            if (textareaRef.current) {
                textareaRef.current.focus();
                if (!selection) {
                    const newPos = start + (format === 'list' ? 2 : (format === 'bold' ? 2 : 1));
                    textareaRef.current.setSelectionRange(newPos, newPos);
                } else {
                    textareaRef.current.setSelectionRange(start + cursorOffset, start + cursorOffset);
                }
            }
        }, 0);
    };

    return (
        <div className="flex flex-col border-4 border-slate-100 dark:border-neutral-800 rounded-[2rem] overflow-hidden focus-within:border-brand-red transition-all bg-white dark:bg-neutral-900 shadow-sm">
            {/* Toolbar */}
            <div className="flex items-center gap-2 px-4 md:px-6 py-3 md:py-4 bg-slate-50 dark:bg-neutral-800/80 border-b-2 border-slate-50 dark:border-neutral-800">
                <button
                    type="button"
                    onClick={() => insertFormat('bold')}
                    className="p-2 md:p-3 hover:bg-white dark:hover:bg-neutral-700 rounded-xl text-slate-600 dark:text-slate-300 transition-all active:scale-90"
                    title="Bold (**text**)"
                >
                    <Bold className="w-4 h-4 md:w-5 md:h-5" />
                </button>
                <button
                    type="button"
                    onClick={() => insertFormat('italic')}
                    className="p-2 md:p-3 hover:bg-white dark:hover:bg-neutral-700 rounded-xl text-slate-600 dark:text-slate-300 transition-all active:scale-90"
                    title="Italic (*text*)"
                >
                    <Italic className="w-4 h-4 md:w-5 md:h-5" />
                </button>
                <div className="w-px h-6 bg-slate-200 dark:bg-neutral-700 mx-2"></div>
                <button
                    type="button"
                    onClick={() => insertFormat('list')}
                    className="p-2 md:p-3 hover:bg-white dark:hover:bg-neutral-700 rounded-xl text-slate-600 dark:text-slate-300 transition-all active:scale-90"
                    title="Bullet List"
                >
                    <List className="w-4 h-4 md:w-5 md:h-5" />
                </button>
                <div className="flex-1"></div>

            </div>

            {/* Text Area */}
            <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChangeValue(e.target.value)}
                className={`w-full p-6 md:p-8 bg-transparent border-none focus:ring-0 resize-y min-h-[150px] text-base text-slate-700 dark:text-white placeholder-slate-400 font-medium leading-relaxed ${className}`}
                style={{ outline: 'none' }}
                {...props}
            />
        </div>
    );
};

export default RichTextarea;
