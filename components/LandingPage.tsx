import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { ArrowRight, CheckCircle, FileText, Sparkles, Target, Zap, Shield, ChevronRight, Star } from 'lucide-react';

interface LandingPageProps {
    onStart: () => void;
    onLogin: () => void;
}

const companies = [
    "Google", "Amazon", "Netflix", "Tesla", "Microsoft", "Uber", "Spotify", "Meta", "Airbnb", "Apple"
];

const LandingPage: React.FC<LandingPageProps> = ({ onStart, onLogin }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: containerRef });

    // Parallax / Spring effects
    const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 };
    const heroY = useSpring(useTransform(scrollYProgress, [0, 0.2], [0, -50]), springConfig);
    const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

    return (
        <div ref={containerRef} className="min-h-screen bg-black text-white overflow-x-hidden font-sans selection:bg-indigo-500/30">

            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-black/50 backdrop-blur-xl border-b border-white/5">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-violet-500 rounded-lg flex items-center justify-center font-bold text-lg">G</div>
                    <span className="font-bold tracking-tight text-xl">GradCraft</span>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={onLogin} className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Sign In</button>
                    <button onClick={onStart} className="bg-white text-black px-5 py-2 rounded-full text-sm font-bold hover:bg-slate-200 transition-colors">Get Started</button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative min-h-[110vh] flex flex-col items-center justify-center pt-32 pb-20 px-4 overflow-hidden">
                {/* Background Gradients */}
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-violet-600/20 blur-[120px] rounded-full" />

                {/* Hero Content */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center z-10 max-w-5xl mx-auto space-y-6"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-indigo-300 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                        <Sparkles className="w-3 h-3" />
                        <span>v2.0 is live: Now with Brutal ATS Scoring</span>
                    </div>

                    <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9]">
                        The <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-400 animate-gradient-x">Unfair Advantage</span><br />
                        for Your Career.
                    </h1>

                    <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        Stop sending black-hole applications. Tailor your resume instantly with AI, check your ATS score, and get hired by top tech companies.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onStart}
                            className="px-8 py-4 bg-white text-black text-lg font-bold rounded-full shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_-10px_rgba(255,255,255,0.5)] transition-all flex items-center gap-2"
                        >
                            Build My Resume <ArrowRight className="w-5 h-5" />
                        </motion.button>
                        <button onClick={onLogin} className="px-8 py-4 text-slate-300 font-medium hover:text-white transition-colors">
                            I already have an account
                        </button>
                    </div>
                </motion.div>

                {/* 3D Tilt Card (Simplified Visual) */}
                <motion.div
                    style={{ y: heroY, opacity }}
                    className="mt-20 w-full max-w-4xl perspective-1000 relative group"
                >
                    {/* Floating Elements */}
                    <motion.div
                        animate={{ y: [-10, 10, -10] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -top-10 -right-10 md:right-0 bg-black/80 backdrop-blur-md border border-white/10 p-4 rounded-xl flex items-center gap-3 z-20 shadow-2xl"
                    >
                        <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center text-green-400"><CheckCircle className="w-6 h-6" /></div>
                        <div>
                            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">ATS Score</p>
                            <p className="text-lg font-black text-white">98/100</p>
                        </div>
                    </motion.div>

                    <motion.div
                        animate={{ y: [10, -10, 10] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                        className="absolute top-40 -left-10 md:-left-20 bg-black/80 backdrop-blur-md border border-white/10 p-4 rounded-xl flex items-center gap-3 z-20 shadow-2xl"
                    >
                        <div className="w-10 h-10 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400"><Sparkles className="w-6 h-6" /></div>
                        <div>
                            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Tailored For</p>
                            <p className="text-lg font-black text-white">Product Designer</p>
                        </div>
                    </motion.div>

                    {/* Main Resume Visual */}
                    <div className="relative bg-slate-900 rounded-2xl border border-white/10 p-2 shadow-2xl transform rotate-x-12 rotate-y-6 md:group-hover:rotate-0 transition-transform duration-700 ease-out">
                        <div className="bg-white rounded-xl overflow-hidden opacity-90 h-[400px] md:h-[600px] relative">
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/10 pointer-events-none" />
                            {/* Mock UI */}
                            <div className="h-full w-full bg-slate-50 p-8 space-y-6">
                                <div className="h-8 w-1/3 bg-slate-200 rounded" />
                                <div className="flex gap-4"><div className="h-4 w-full bg-slate-200 rounded" /><div className="h-4 w-full bg-slate-200 rounded" /></div>
                                <div className="h-64 w-full bg-slate-200 rounded-xl border-2 border-dashed border-slate-300" />
                            </div>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* Infinite Marquee */}
            <section className="py-10 border-y border-white/5 bg-white/5 backdrop-blur-sm overflow-hidden">
                <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-8">Trusted by students at</p>
                <div className="flex w-max gap-16 animate-marquee">
                    {[...companies, ...companies].map((company, i) => (
                        <h3 key={i} className="text-2xl font-black text-white/20 select-none uppercase tracking-tighter">{company}</h3>
                    ))}
                </div>
            </section>

            {/* Bento Grid Features */}
            <section className="py-32 px-4 max-w-7xl mx-auto">
                <div className="text-center mb-20 space-y-4">
                    <h2 className="text-4xl md:text-5xl font-black tracking-tighter">Everything you need to <span className="text-indigo-400">beat the robot.</span></h2>
                    <p className="text-slate-400 max-w-2xl mx-auto">We reverse-engineered the hiring process so you don't have to.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(180px,auto)]">

                    {/* Box 1: AI Tailor (Span 2) */}
                    <motion.div whileHover={{ y: -5 }} className="md:col-span-2 bg-gradient-to-b from-white/10 to-transparent p-1 rounded-3xl border border-white/10">
                        <div className="bg-black/50 h-full w-full rounded-[20px] p-8 flex flex-col md:flex-row items-center gap-8 overflow-hidden relative">
                            <div className="flex-1 space-y-4 z-10">
                                <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center text-white mb-4"><Sparkles /></div>
                                <h3 className="text-2xl font-bold">Smart Tailoring</h3>
                                <p className="text-slate-400">Paste any job description. Our AI rewrites your bullets to match their keywords instantly.</p>
                            </div>
                            <div className="flex-1 w-full relative">
                                <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full" />
                                <div className="relative bg-slate-900 border border-white/10 p-4 rounded-xl text-xs font-mono text-slate-400">
                                    <span className="text-indigo-400">Processing...</span><br />
                                    Generating keywords: [React, TypeScript, Figma]<br />
                                    <span className="text-green-400">Match Score: 95%</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Box 2: Score (Span 1) */}
                    <motion.div whileHover={{ y: -5 }} className="bg-gradient-to-b from-white/10 to-transparent p-1 rounded-3xl border border-white/10">
                        <div className="bg-black/50 h-full w-full rounded-[20px] p-8 flex flex-col justify-between overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-32 bg-red-500/20 blur-3xl rounded-full" />
                            <div className="w-12 h-12 bg-rose-500 rounded-xl flex items-center justify-center text-white mb-4"><Target /></div>
                            <h3 className="text-2xl font-bold">Brutal Scores</h3>
                            <p className="text-slate-400 text-sm mt-2">Get a 0-100 score on your ATS compatibility.</p>
                        </div>
                    </motion.div>

                    {/* Box 3: PDF (Span 1) */}
                    <motion.div whileHover={{ y: -5 }} className="bg-gradient-to-b from-white/10 to-transparent p-1 rounded-3xl border border-white/10">
                        <div className="bg-black/50 h-full w-full rounded-[20px] p-8 flex flex-col justify-between overflow-hidden relative">
                            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white mb-4"><FileText /></div>
                            <h3 className="text-2xl font-bold">Clean PDF</h3>
                            <p className="text-slate-400 text-sm mt-2">ATS-optimized renders. No graphics, no columns, just data.</p>
                        </div>
                    </motion.div>

                    {/* Box 4: CTA (Span 2) */}
                    <motion.div whileHover={{ y: -5 }} className="md:col-span-2 bg-gradient-to-b from-indigo-600 to-violet-600 p-1 rounded-3xl">
                        <div onClick={onStart} className="bg-black/20 hover:bg-white/10 transition-colors cursor-pointer h-full w-full rounded-[20px] p-8 flex items-center justify-between group">
                            <div>
                                <h3 className="text-3xl font-black text-white">Start Building Free</h3>
                                <p className="text-indigo-200">No credit card required.</p>
                            </div>
                            <div className="bg-white/20 p-4 rounded-full group-hover:bg-white text-white group-hover:text-indigo-600 transition-all">
                                <ChevronRight className="w-8 h-8" />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Pricing Section */}
            <section className="py-20 px-4 max-w-5xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-4">Pricing that makes sense.</h2>
                    <p className="text-slate-400">Invest in your career, not subscription fatigue.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    {/* Free Plan */}
                    <motion.div whileHover={{ y: -5 }} className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-xl font-bold">Student</h3>
                                <p className="text-3xl font-black mt-2">$0 <span className="text-sm font-normal text-slate-400">/ forever</span></p>
                            </div>
                            <div className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold uppercase tracking-widest text-slate-300">Basic</div>
                        </div>
                        <ul className="space-y-4 mb-8 text-slate-300">
                            <li className="flex gap-3 text-sm"><CheckCircle className="w-5 h-5 text-indigo-500" /> Unlimited Resumes</li>
                            <li className="flex gap-3 text-sm"><CheckCircle className="w-5 h-5 text-indigo-500" /> Basic PDF Export</li>
                            <li className="flex gap-3 text-sm"><CheckCircle className="w-5 h-5 text-indigo-500" /> Standard Templates</li>
                        </ul>
                        <button onClick={onStart} className="w-full py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all">Get Started Free</button>
                    </motion.div>

                    {/* Pro Plan */}
                    <motion.div whileHover={{ y: -5 }} className="relative bg-black border border-indigo-500/50 rounded-3xl p-8 shadow-[0_0_50px_-10px_rgba(99,102,241,0.2)]">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-500 text-white px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest shadow-lg">Most Popular</div>
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">Pro Career</h3>
                                <p className="text-3xl font-black mt-2 text-white">$12 <span className="text-sm font-normal text-slate-400">/ month</span></p>
                            </div>
                            <div className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-bold uppercase tracking-widest"><Zap className="w-3 h-3 inline mr-1" /> Fast Track</div>
                        </div>
                        <ul className="space-y-4 mb-8 text-slate-300">
                            <li className="flex gap-3 text-sm"><CheckCircle className="w-5 h-5 text-indigo-400" /> <b>Unlimited AI Tailoring</b></li>
                            <li className="flex gap-3 text-sm"><CheckCircle className="w-5 h-5 text-indigo-400" /> <b>Brutal ATS Score</b> Checks</li>
                            <li className="flex gap-3 text-sm"><CheckCircle className="w-5 h-5 text-indigo-400" /> Priority Support</li>
                            <li className="flex gap-3 text-sm"><CheckCircle className="w-5 h-5 text-indigo-400" /> Cover Letter Generator</li>
                        </ul>
                        <button onClick={onStart} className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all">Go Pro</button>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/10 py-20 px-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-8 opacity-50">
                    <div className="w-6 h-6 bg-slate-700 rounded-md" />
                    <span className="font-bold">GradCraft</span>
                </div>
                <p className="text-slate-500 text-sm">© 2025 GradCraft AI. Built for the ambitious.</p>
            </footer>

            {/* Styles for marquee (Tailwind config usually, but injecting raw here for portability) */}
            <style>{`
        @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
        }
        .animate-marquee {
            animation: marquee 30s linear infinite;
        }
      `}</style>
        </div>
    );
};

export default LandingPage;
