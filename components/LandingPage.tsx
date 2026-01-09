import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { ArrowRight, CheckCircle, FileText, Sparkles, Target, Zap, ChevronRight } from 'lucide-react';

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
        <div ref={containerRef} className="min-h-screen bg-slate-50 text-neutral-900 overflow-x-hidden font-sans selection:bg-neutral-900 selection:text-white">

            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-white/80 backdrop-blur-xl border-b border-neutral-200">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-bold text-lg">G</div>
                    <span className="font-bold tracking-tight text-xl">GradCraft</span>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={onLogin} className="text-sm font-medium text-neutral-500 hover:text-black transition-colors">Sign In</button>
                    <button onClick={onStart} className="bg-black text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-neutral-800 transition-colors shadow-lg shadow-black/20">Get Started</button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative min-h-[110vh] flex flex-col items-center justify-center pt-32 pb-20 px-4 overflow-hidden bg-white">
                {/* Subtle Mesh Grid Background */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

                {/* Hero Content */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center z-10 max-w-5xl mx-auto space-y-8 relative"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-xs font-bold text-neutral-600 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 uppercase tracking-wider">
                        <Sparkles className="w-3 h-3 text-black" />
                        <span>v2.0 : Brutal ATS Scoring Engine</span>
                    </div>

                    <h1 className="text-6xl md:text-9xl font-black tracking-tighter leading-[0.9] text-black">
                        CAREER <br />
                        <span className="text-neutral-400">ARCHITECT.</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-neutral-500 max-w-2xl mx-auto leading-relaxed font-medium">
                        Stop sending generic resumes. Build a portfolio that demands attention with AI tailoring and brutal scoring.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onStart}
                            className="px-10 py-5 bg-black text-white text-lg font-bold rounded-full shadow-2xl shadow-black/30 hover:shadow-black/50 transition-all flex items-center gap-2"
                        >
                            Build Resume <ArrowRight className="w-5 h-5" />
                        </motion.button>
                        <button onClick={onLogin} className="px-8 py-4 text-neutral-500 font-bold hover:text-black transition-colors underline decoration-2 decoration-transparent hover:decoration-black underline-offset-4">
                            I have an account
                        </button>
                    </div>
                </motion.div>

                {/* 3D Tilt Card (Modern Clean) */}
                <motion.div
                    style={{ y: heroY, opacity }}
                    className="mt-24 w-full max-w-4xl perspective-1000 relative group"
                >
                    {/* Floating Elements */}
                    <motion.div
                        animate={{ y: [-10, 10, -10] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -top-10 -right-4 md:-right-10 bg-white border border-neutral-200 p-4 rounded-xl flex items-center gap-3 z-20 shadow-xl shadow-neutral-200/50"
                    >
                        <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white"><CheckCircle className="w-5 h-5" /></div>
                        <div>
                            <p className="text-[10px] text-neutral-400 uppercase font-black tracking-widest">ATS Score</p>
                            <p className="text-xl font-black text-black">98/100</p>
                        </div>
                    </motion.div>

                    <motion.div
                        animate={{ y: [10, -10, 10] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                        className="absolute top-40 -left-6 md:-left-20 bg-white border border-neutral-200 p-4 rounded-xl flex items-center gap-3 z-20 shadow-xl shadow-neutral-200/50"
                    >
                        <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center text-black"><Sparkles className="w-5 h-5" /></div>
                        <div>
                            <p className="text-[10px] text-neutral-400 uppercase font-black tracking-widest">Tailored For</p>
                            <p className="text-xl font-black text-black">Product Designer</p>
                        </div>
                    </motion.div>

                    {/* Main Resume Visual */}
                    <div className="relative bg-white rounded-2xl border border-neutral-200 p-2 shadow-2xl shadow-neutral-200 transform rotate-x-6 rotate-y-3 md:group-hover:rotate-0 transition-transform duration-700 ease-out">
                        <div className="bg-white rounded-xl overflow-hidden h-[400px] md:h-[600px] relative border border-neutral-100">
                            {/* Mock UI */}
                            <div className="h-full w-full bg-white p-10 space-y-8">
                                <div className="h-8 w-1/3 bg-neutral-100 rounded-sm" />
                                <div className="flex gap-4"><div className="h-4 w-full bg-neutral-100 rounded-sm" /><div className="h-4 w-full bg-neutral-100 rounded-sm" /></div>
                                <div className="h-px bg-neutral-100 w-full my-8" />
                                <div className="space-y-4">
                                    <div className="h-4 w-3/4 bg-neutral-100 rounded-sm" />
                                    <div className="h-4 w-5/6 bg-neutral-100 rounded-sm" />
                                    <div className="h-4 w-1/2 bg-neutral-100 rounded-sm" />
                                </div>
                                <div className="space-y-4 mt-8">
                                    <div className="h-6 w-1/4 bg-neutral-200 rounded-sm" />
                                    <div className="h-4 w-full bg-neutral-100 rounded-sm" />
                                    <div className="h-4 w-full bg-neutral-100 rounded-sm" />
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* Infinite Marquee */}
            <section className="py-12 border-y border-neutral-200 bg-neutral-50 overflow-hidden">
                <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-neutral-400 mb-8">Trusted by students at</p>
                <div className="flex w-max gap-20 animate-marquee opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                    {[...companies, ...companies].map((company, i) => (
                        <h3 key={i} className="text-3xl font-black text-neutral-900 select-none uppercase tracking-tighter">{company}</h3>
                    ))}
                </div>
            </section>

            {/* Bento Grid Features */}
            <section className="py-32 px-4 max-w-7xl mx-auto">
                <div className="text-center mb-24 space-y-4">
                    <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-black">BEAT THE <span className="text-neutral-400">ROBOT.</span></h2>
                    <p className="text-neutral-500 text-xl font-medium max-w-2xl mx-auto">We reverse-engineered the hiring process so you don't have to.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(240px,auto)]">

                    {/* Box 1: AI Tailor (Span 2) */}
                    <motion.div whileHover={{ y: -5 }} className="md:col-span-2 bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden relative group">
                        <div className="p-10 flex flex-col md:flex-row items-center gap-10 h-full">
                            <div className="flex-1 space-y-6 z-10">
                                <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center text-black"><Sparkles /></div>
                                <h3 className="text-3xl font-bold tracking-tight">Smart Tailoring</h3>
                                <p className="text-neutral-500 text-lg">Paste any job description. Our AI rewrites your bullets to match keywords instantly.</p>
                            </div>
                            <div className="flex-1 w-full relative">
                                <div className="relative bg-neutral-50 border border-neutral-200 p-6 rounded-xl text-xs font-mono text-neutral-600 shadow-inner">
                                    <span className="text-black font-bold">&gt; Processing...</span><br />
                                    Generating keywords: <span className="bg-neutral-200 px-1 rounded">React</span> <span className="bg-neutral-200 px-1 rounded">TypeScript</span><br />
                                    <span className="text-green-600 font-bold">Match Score: 95%</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Box 2: Score (Span 1) */}
                    <motion.div whileHover={{ y: -5 }} className="bg-white rounded-3xl border border-neutral-200 shadow-sm p-10 flex flex-col justify-between group overflow-hidden">
                        <div className="space-y-6">
                            <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center text-white"><Target /></div>
                            <h3 className="text-3xl font-bold tracking-tight">Brutal Scores</h3>
                        </div>
                        <p className="text-neutral-500">Get a 0-100 score on your ATS compatibility.</p>
                        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-neutral-100 rounded-full group-hover:scale-150 transition-transform duration-500" />
                    </motion.div>

                    {/* Box 3: PDF (Span 1) */}
                    <motion.div whileHover={{ y: -5 }} className="bg-white rounded-3xl border border-neutral-200 shadow-sm p-10 flex flex-col justify-between group overflow-hidden">
                        <div className="space-y-6">
                            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center text-black border border-neutral-200"><FileText /></div>
                            <h3 className="text-3xl font-bold tracking-tight">Clean PDF</h3>
                        </div>
                        <p className="text-neutral-500">ATS-optimized renders. No graphics, no columns, just data.</p>
                    </motion.div>

                    {/* Box 4: CTA (Span 2) */}
                    <motion.div whileHover={{ y: -5 }} className="md:col-span-2 bg-neutral-900 rounded-3xl shadow-xl overflow-hidden relative">
                        <div onClick={onStart} className="cursor-pointer h-full w-full p-10 flex items-center justify-between group relative z-10">
                            <div>
                                <h3 className="text-4xl font-black text-white tracking-tight">Start Building Free.</h3>
                                <p className="text-neutral-400 mt-2">No credit card required.</p>
                            </div>
                            <div className="bg-white p-4 rounded-full text-black group-hover:scale-110 transition-all">
                                <ChevronRight className="w-8 h-8" />
                            </div>
                        </div>
                        {/* Abstract Line Pattern */}
                        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
                    </motion.div>
                </div>
            </section>

            {/* Pricing Section */}
            <section className="py-20 px-4 max-w-5xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">Simple Pricing.</h2>
                    <p className="text-neutral-500">Invest in your career.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    {/* Free Plan */}
                    <motion.div whileHover={{ y: -5 }} className="bg-white border border-neutral-200 rounded-3xl p-10 shadow-sm">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-neutral-900">Student</h3>
                                <p className="text-4xl font-black mt-2 tracking-tight">$0 <span className="text-sm font-normal text-neutral-400">/ forever</span></p>
                            </div>
                            <div className="px-3 py-1 bg-neutral-100 rounded-full text-xs font-bold uppercase tracking-widest text-neutral-600">Basic</div>
                        </div>
                        <ul className="space-y-4 mb-8 text-neutral-600 font-medium">
                            <li className="flex gap-3 text-sm"><CheckCircle className="w-5 h-5 text-black" /> Unlimited Resumes</li>
                            <li className="flex gap-3 text-sm"><CheckCircle className="w-5 h-5 text-black" /> Basic PDF Export</li>
                            <li className="flex gap-3 text-sm"><CheckCircle className="w-5 h-5 text-black" /> Standard Templates</li>
                        </ul>
                        <button onClick={onStart} className="w-full py-4 bg-neutral-100 hover:bg-neutral-200 text-black font-bold rounded-xl transition-all">Get Started Free</button>
                    </motion.div>

                    {/* Pro Plan */}
                    <motion.div whileHover={{ y: -5 }} className="relative bg-black text-white border border-neutral-800 rounded-3xl p-10 shadow-2xl shadow-neutral-900/20">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white text-black px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest shadow-lg border border-neutral-200">Most Popular</div>
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-xl font-bold">Pro Career</h3>
                                <p className="text-4xl font-black mt-2 tracking-tight">$12 <span className="text-sm font-normal text-neutral-500">/ month</span></p>
                            </div>
                            <div className="px-3 py-1 bg-neutral-800 text-white rounded-full text-xs font-bold uppercase tracking-widest"><Zap className="w-3 h-3 inline mr-1" /> Fast Track</div>
                        </div>
                        <ul className="space-y-4 mb-8 text-neutral-300 font-medium">
                            <li className="flex gap-3 text-sm"><CheckCircle className="w-5 h-5 text-white" /> <b>Unlimited AI Tailoring</b></li>
                            <li className="flex gap-3 text-sm"><CheckCircle className="w-5 h-5 text-white" /> <b>Brutal ATS Score</b> Checks</li>
                            <li className="flex gap-3 text-sm"><CheckCircle className="w-5 h-5 text-white" /> Priority Support</li>
                            <li className="flex gap-3 text-sm"><CheckCircle className="w-5 h-5 text-white" /> Cover Letter Generator</li>
                        </ul>
                        <button onClick={onStart} className="w-full py-4 bg-white text-black hover:bg-neutral-200 font-bold rounded-xl shadow-lg transition-all">Go Pro</button>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-neutral-200 py-20 px-4 text-center bg-white">
                <div className="flex items-center justify-center gap-2 mb-8 opacity-50">
                    <div className="w-6 h-6 bg-black rounded-md" />
                    <span className="font-bold">GradCraft</span>
                </div>
                <p className="text-neutral-400 text-sm">© 2025 GradCraft AI. Built for architects of the future.</p>
            </footer>

            {/* Styles for marquee */}
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
