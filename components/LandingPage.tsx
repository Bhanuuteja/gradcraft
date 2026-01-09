import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckSquare, FileText, Sparkles, Layout, AlignLeft, Star } from 'lucide-react';

interface LandingPageProps {
    onStart: () => void;
    onLogin: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart, onLogin }) => {
    return (
        <div className="min-h-screen bg-white text-neutral-900 font-sans selection:bg-neutral-200 selection:text-black">

            {/* Navigation - Notion Style */}
            <nav className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-white/95 backdrop-blur-sm border-b border-neutral-200">
                <div className="flex items-center gap-2 transition-opacity hover:opacity-70 cursor-pointer">
                    <div className="w-8 h-8 bg-neutral-900 rounded-[6px] flex items-center justify-center text-white text-sm font-bold">G</div>
                    <span className="font-serif font-bold text-xl tracking-tight text-neutral-900">GradCraft</span>
                </div>
                <div className="flex items-center gap-6">
                    <button onClick={onLogin} className="text-sm font-medium text-neutral-600 hover:text-black transition-colors">Log in</button>
                    <button onClick={onStart} className="bg-neutral-900 text-white px-4 py-1.5 rounded-md text-sm font-medium hover:bg-neutral-700 transition-colors">Get Started</button>
                </div>
            </nav>

            {/* Main Content Container */}
            <div className="max-w-4xl mx-auto pt-32 pb-20 px-6 space-y-24">

                {/* Hero Section - Document Title Style */}
                <section className="space-y-6 text-center md:text-left">

                    <h1 className="font-serif text-5xl md:text-7xl font-bold leading-[1.1] tracking-tight text-neutral-900">
                        The thoughtful way to <br /> build your resume.
                    </h1>

                    <p className="text-xl md:text-2xl text-neutral-600 max-w-2xl leading-relaxed font-light">
                        GradCraft replaces chaotic formatting with structure. <br />
                        Write clearly. Score higher. Get hired.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 pt-6">
                        <button onClick={onStart} className="group flex items-center gap-2 bg-neutral-900 text-white px-6 py-3 rounded-md font-medium hover:bg-neutral-800 transition-all">
                            Start Writing <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button onClick={onStart} className="flex items-center gap-2 px-6 py-3 rounded-md font-medium text-neutral-600 hover:bg-neutral-50 transition-colors border border-neutral-200">
                            View Templates
                        </button>
                    </div>
                </section>

                {/* Feature List - Notion Block Style */}
                <section className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-6 pl-1">Features</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Block 1 */}
                        <div className="p-6 rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors group cursor-default">
                            <div className="w-8 h-8 rounded bg-neutral-100 flex items-center justify-center mb-4 text-neutral-700 group-hover:bg-white group-hover:shadow-sm transition-all">
                                <AlignLeft className="w-4 h-4" />
                            </div>
                            <h4 className="font-serif text-lg font-bold mb-2">Structure First</h4>
                            <p className="text-neutral-500 text-sm leading-relaxed">
                                Forget about moving pixels. We handle the layout, padding, and typography so you can focus on the content.
                            </p>
                        </div>

                        {/* Block 2 */}
                        <div className="p-6 rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors group cursor-default">
                            <div className="w-8 h-8 rounded bg-neutral-100 flex items-center justify-center mb-4 text-neutral-700 group-hover:bg-white group-hover:shadow-sm transition-all">
                                <Sparkles className="w-4 h-4" />
                            </div>
                            <h4 className="font-serif text-lg font-bold mb-2">AI Refinement</h4>
                            <p className="text-neutral-500 text-sm leading-relaxed">
                                Highlight any bullet point and ask our AI to improve clarity, fix grammar, or tailor it to a specific job description.
                            </p>
                        </div>

                        {/* Block 3 */}
                        <div className="p-6 rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors group cursor-default">
                            <div className="w-8 h-8 rounded bg-neutral-100 flex items-center justify-center mb-4 text-neutral-700 group-hover:bg-white group-hover:shadow-sm transition-all">
                                <CheckSquare className="w-4 h-4" />
                            </div>
                            <h4 className="font-serif text-lg font-bold mb-2">ATS Scoring</h4>
                            <p className="text-neutral-500 text-sm leading-relaxed">
                                Get a brutally honest score (0-100) based on real parser logic. Fix red flags before you apply.
                            </p>
                        </div>

                        {/* Block 4 */}
                        <div className="p-6 rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors group cursor-default">
                            <div className="w-8 h-8 rounded bg-neutral-100 flex items-center justify-center mb-4 text-neutral-700 group-hover:bg-white group-hover:shadow-sm transition-all">
                                <FileText className="w-4 h-4" />
                            </div>
                            <h4 className="font-serif text-lg font-bold mb-2">Clean PDF</h4>
                            <p className="text-neutral-500 text-sm leading-relaxed">
                                Export perfectly accessible, single-column PDFs that robots can read and humans admire.
                            </p>
                        </div>

                        {/* Block 5: Dashboard (Full Width) */}
                        <div className="md:col-span-2 p-6 rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors group cursor-default">
                            <div className="w-8 h-8 rounded bg-neutral-100 flex items-center justify-center mb-4 text-neutral-700 group-hover:bg-white group-hover:shadow-sm transition-all">
                                <Layout className="w-4 h-4" />
                            </div>
                            <h4 className="font-serif text-lg font-bold mb-2">Dashboard</h4>
                            <p className="text-neutral-500 text-sm leading-relaxed max-w-2xl">
                                Stop using spreadsheets. Track every application status, link specific resume versions to job descriptions, and see your interview progress in one clean view.
                            </p>
                        </div>
                    </div>
                </section>

                <hr className="border-neutral-200" />

                {/* Testimonials - New Section */}
                <section className="space-y-6">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-6 pl-1">Wall of Love</h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-6 bg-neutral-50 rounded-lg border border-neutral-100">
                            <div className="flex gap-1 mb-4 text-black"><Star className="w-3 h-3 fill-black" /><Star className="w-3 h-3 fill-black" /><Star className="w-3 h-3 fill-black" /><Star className="w-3 h-3 fill-black" /><Star className="w-3 h-3 fill-black" /></div>
                            <p className="text-sm text-neutral-600 mb-4 leading-relaxed">"Refused to pay for a resume builder. Found GradCraft. It's cleaner than my paid Notion templates."</p>
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-neutral-200"></div>
                                <span className="text-xs font-bold text-neutral-900">Alex R. <span className="text-neutral-400 font-normal">@ Stanford</span></span>
                            </div>
                        </div>

                        <div className="p-6 bg-neutral-50 rounded-lg border border-neutral-100">
                            <div className="flex gap-1 mb-4 text-black"><Star className="w-3 h-3 fill-black" /><Star className="w-3 h-3 fill-black" /><Star className="w-3 h-3 fill-black" /><Star className="w-3 h-3 fill-black" /><Star className="w-3 h-3 fill-black" /></div>
                            <p className="text-sm text-neutral-600 mb-4 leading-relaxed">"The ATS scorer is brutal but necessary. I went from 0 callbacks to 3 interviews in a week."</p>
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-neutral-200"></div>
                                <span className="text-xs font-bold text-neutral-900">Sarah C. <span className="text-neutral-400 font-normal">@ Berkeley</span></span>
                            </div>
                        </div>

                        <div className="p-6 bg-neutral-50 rounded-lg border border-neutral-100">
                            <div className="flex gap-1 mb-4 text-black"><Star className="w-3 h-3 fill-black" /><Star className="w-3 h-3 fill-black" /><Star className="w-3 h-3 fill-black" /><Star className="w-3 h-3 fill-black" /><Star className="w-3 h-3 fill-black" /></div>
                            <p className="text-sm text-neutral-600 mb-4 leading-relaxed">"Finally, a tool that just formats the text without adding weird graphics that break parsers."</p>
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-neutral-200"></div>
                                <span className="text-xs font-bold text-neutral-900">James W. <span className="text-neutral-400 font-normal">@ MIT</span></span>
                            </div>
                        </div>
                    </div>
                </section>

                <hr className="border-neutral-200" />

                {/* Callout Section - Quote style */}
                <section className="bg-neutral-50 border-l-4 border-neutral-900 p-8 rounded-r-lg">
                    <h2 className="font-serif text-2xl font-bold mb-4">Why we built this</h2>
                    <p className="text-neutral-700 leading-relaxed max-w-prose">
                        "Most resume builders are designed to sell you templates that look pretty but fail in ATS systems.
                        We built GradCraft to be the anti-template tool. It forces you to write better content within a proven structure."
                    </p>
                </section>

            </div>

            {/* Minimal Footer */}
            <footer className="border-t border-neutral-200 py-12 text-center text-sm text-neutral-400 font-mono space-y-4">
                <p>GradCraft &middot; Crafted with intention.</p>
            </footer>

        </div>
    );
};

export default LandingPage;
