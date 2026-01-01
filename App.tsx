
import React, { useState, useEffect, useRef } from 'react';
import ResumeForm from './components/ResumeForm';
import LivePreview from './components/LivePreview';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import { ResumeData, User } from './types';
import { getCurrentUser, saveResume, supabase } from './services/supabase';
import { downloadDocx } from './services/docxService';
import { ArrowLeft, Save, Sparkles, FileDown, Moon, Sun, Layout, Eye, Edit3, Menu, X } from 'lucide-react';

const initialData: ResumeData = {
  personalInfo: {
    fullName: '', email: '', phone: '', location: '', openToRelocate: false,
    linkedin: '', github: '', portfolio: '', summary: ''
  },
  skills: [{ name: 'Technical Skills', items: '' }],
  experience: [],
  projects: [],
  education: [],
  customSections: [],
  sectionOrder: ['summary', 'skills', 'experience', 'projects', 'education'],
  design: { template: 'professional', font: 'sans', accentColor: '#2563eb', spacing: 'normal' },
  coverLetter: {
    recipientName: '', recipientTitle: '', companyName: '', companyAddress: '',
    date: new Date().toLocaleDateString(), content: ''
  }
};

type ViewState = 'LANDING' | 'LOGIN' | 'SIGNUP' | 'DASHBOARD' | 'EDITOR' | 'FORGOT_PASSWORD' | 'UPDATE_PASSWORD';

function App() {
  const [view, setView] = useState<ViewState>('LANDING');
  // Capture recovery mode immediately before Supabase strips the URL
  const [isRecoveryMode] = useState(() => window.location.hash.includes('type=recovery') || window.location.search.includes('mode=reset'));
  const [user, setUser] = useState<User | null>(null);
  const [isDbReady, setIsDbReady] = useState(false);
  const [resumeData, setResumeData] = useState<ResumeData>(initialData);
  const [currentResumeId, setCurrentResumeId] = useState<string | null>(null);
  const [resumeName, setResumeName] = useState<string>('My Professional Resume');
  const [activeDoc, setActiveDoc] = useState<'resume' | 'cover-letter'>('resume');
  const [darkMode, setDarkMode] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
  const [mobileMode, setMobileMode] = useState<'edit' | 'preview'>('edit');
  const [previewScale, setPreviewScale] = useState(1);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Check active session on load
    getCurrentUser().then(u => {
      setIsDbReady(true);
      if (u) {
        if (isRecoveryMode) {
          window.history.pushState(null, '', '/reset-password');
          setUser(u);
          setView('UPDATE_PASSWORD');
        } else {
          setUser(u);
          setView('DASHBOARD');
        }
      }
    });

    // 2. Listen for auth changes (Magic Links, Password Resets)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {

      if (event === 'SIGNED_OUT') {
        // Reset app state completely
        window.location.href = '/';
        return;
      }

      // If we are in strictly captured recovery mode, ignore other signals (except logout)
      if (event === 'PASSWORD_RECOVERY' || isRecoveryMode) {
        window.history.pushState(null, '', '/reset-password');
        setView('UPDATE_PASSWORD');
      } else if (event === 'SIGNED_IN') {
        setTimeout(async () => {
          const u = await getCurrentUser();
          if (u) {
            setUser(u);
            // Respect the mode
            if (isRecoveryMode) {
              setView('UPDATE_PASSWORD');
            } else {
              setView(v => v === 'UPDATE_PASSWORD' ? 'UPDATE_PASSWORD' : 'DASHBOARD');
            }
          }
        }, 100);
      }
    });

    return () => subscription.unsubscribe();
  }, [isRecoveryMode]);

  // Responsive scaling for the A4 preview - Optimized for big screens
  useEffect(() => {
    const handleResize = () => {
      if (previewContainerRef.current) {
        const containerWidth = previewContainerRef.current.offsetWidth;
        const containerHeight = previewContainerRef.current.offsetHeight;

        // Use a standard pixel width for A4 at 96DPI (approx 794px-816px)
        const a4BaseWidth = 816;
        const padding = 64; // Horizontal padding in the container

        // Calculate scale to fit width, but also check height to avoid vertical clipping
        const scaleW = (containerWidth - padding) / a4BaseWidth;

        // For "big screens", we allow it to scale up, but let's cap it at 1.5 for readability
        // For smaller screens, it will scale down as needed
        setPreviewScale(Math.min(scaleW, 1.5));
      }
    };
    window.addEventListener('resize', handleResize);
    // Extra delay for transition completion
    const timer = setTimeout(handleResize, 100);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, [view, mobileMode]);

  const notify = (type: 'success' | 'error', msg: string) => {
    setStatus({ type, msg });
    setTimeout(() => setStatus(null), 3000);
  };

  const handleSave = async () => {
    if (!user) { setView('LOGIN'); return; }
    try {
      const saved = await saveResume(user.id, resumeData, currentResumeId || undefined, resumeName);
      setCurrentResumeId(saved.id);
      notify('success', 'Saved');
    } catch (e: any) { notify('error', 'Sync Failed: ' + e.message); }
  };

  const handleDownloadPdf = () => {
    const element = document.getElementById('live-preview');
    if (!element) return;

    notify('success', 'Preparing Print View...');

    // 1. Get the HTML content
    const content = element.outerHTML;

    // 2. Open a new window
    const printWindow = window.open('', '_blank', 'width=900,height=1200');
    if (!printWindow) {
      notify('error', 'Pop-up blocked! Allow pop-ups to print.');
      return;
    }

    // 3. Write the document structure
    printWindow.document.write('<html><head>');
    printWindow.document.write('<title>' + resumeName + '</title>');

    // 4. Copy ALL styles from the main window (Tailwind, Fonts, etc.)
    const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'));
    styles.forEach(style => {
      printWindow.document.write(style.outerHTML);
    });

    // 5. Add custom print Styles and Scaling script
    printWindow.document.write(`
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
            @media print {
                @page { size: A4 portrait; margin: 0; }
                body { -webkit-print-color-adjust: exact; margin: 0; padding: 0; }
            }
            body { 
                background: white; 
                margin: 0; 
                padding: 0; 
                font-family: 'Poppins', sans-serif;
                display: flex;
                justify-content: center;
                align-items: flex-start;
                height: 100vh;
                overflow: hidden; /* STRICTLY 1 PAGE */
            }
            #print-container {
                width: 210mm;
                /* No min-height to avoid forcing it open */
                position: relative;
                transform-origin: top center;
            }
            ::-webkit-scrollbar { display: none; }
        </style>
    `);

    printWindow.document.write('</head><body>');
    printWindow.document.write('<div id="print-container">' + content + '</div>');

    // 6. Auto-Scaling Script inside the new window
    printWindow.document.write(`
        <script>
            window.onload = () => {
                const container = document.getElementById('print-container');
                const content = container.firstElementChild;
                
                setTimeout(() => {
                    if(content) {
                        // Reset styles that might force it to be "Page+1" size
                        content.style.transform = 'none';
                        content.style.width = '100%';
                        content.style.minHeight = '0'; // Remove the forced 1154px A4 min-height
                        content.style.height = 'auto'; 
                        content.style.border = 'none';
                        content.style.boxShadow = 'none';
                        content.style.margin = '0';
                        
                        const contentHeight = container.scrollHeight;
                        const a4HeightPx = 1123; // Approx 297mm @ 96dpi
                        // Safety buffer for printer margins
                        const availableHeight = a4HeightPx - 60; 
                        
                        // Only scale if the ACTUAL TEXT (not the container) is too tall
                        if (contentHeight > availableHeight) {
                            const scale = availableHeight / contentHeight;
                            container.style.transform = 'scale(' + scale + ')';
                        }
                    }
                    window.print();
                }, 500);
            };
        </script>
    `);

    printWindow.document.write('</body></html>');
    printWindow.document.close();
  };

  if (!isDbReady) return <div className="h-screen bg-black flex items-center justify-center"><div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className={`${darkMode ? 'dark' : ''} h-screen overflow-hidden flex flex-col transition-colors duration-300`}>
      {status && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] animate-in fade-in slide-in-from-top-5">
          <div className={`px-6 py-3 rounded-2xl shadow-2xl text-xs font-black border tracking-widest uppercase ${status.type === 'error' ? 'bg-brand-primary text-white border-brand-accent' : 'bg-slate-900 text-white border-slate-700'}`}>
            {status.msg}
          </div>
        </div>
      )}

      {view === 'LANDING' && (
        <div className="flex-1 bg-white dark:bg-black flex flex-col items-center justify-center p-6 text-center overflow-y-auto font-sans">
          <div className="w-full max-w-[260px] md:max-w-[320px] mb-8 hover:scale-105 transition-transform duration-300">
            <img src="/logo.png" alt="GradCraft" className="w-full h-auto drop-shadow-2xl" />
          </div>
          <p className="text-sm md:text-base text-slate-500 mb-8 max-w-md font-medium leading-relaxed">Build a professional resume for your student career in minutes. Simple, fast, and ATS-ready.</p>
          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
            <button onClick={() => setView('SIGNUP')} className="btn-brand flex-1 py-3 text-sm uppercase tracking-widest font-bold">Get Started</button>
            <button onClick={() => setView('LOGIN')} className="flex-1 py-3 border-2 border-slate-200 dark:border-neutral-800 rounded-xl font-black text-sm hover:bg-slate-50 dark:hover:bg-neutral-900 transition-all dark:text-white uppercase tracking-widest">Sign In</button>
          </div>
        </div>
      )}

      {(view === 'LOGIN' || view === 'SIGNUP' || view === 'FORGOT_PASSWORD' || view === 'UPDATE_PASSWORD') && (
        <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-black">
          <Auth
            view={view as any}
            onSwitch={(v) => setView(v)}
            onLogin={(u) => { setUser(u); setView('DASHBOARD'); }}
          />
        </div>
      )}

      {view === 'DASHBOARD' && user && (
        <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-black">
          <Dashboard
            user={user}
            onLogout={() => { setUser(null); setView('LANDING'); }}
            onNew={() => { setResumeData(initialData); setResumeName('My Professional Resume'); setView('EDITOR'); }}
            onEdit={(r) => {
              // Legacy Migration: Ensure new fields (sectionOrder, design props) exist
              const fusedData = {
                ...initialData,
                ...r.data,
                design: { ...initialData.design, ...(r.data.design || {}) },
                sectionOrder: r.data.sectionOrder || initialData.sectionOrder
              };
              setResumeData(fusedData);
              setResumeName(r.name);
              setCurrentResumeId(r.id);
              setView('EDITOR');
            }}
          />
        </div>
      )}

      {view === 'EDITOR' && (
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-100 dark:bg-black font-sans transition-colors duration-300">
          <nav className="bg-white dark:bg-neutral-950 border-b border-slate-200 dark:border-neutral-900 px-4 md:px-6 py-4 flex flex-col sm:flex-row gap-4 justify-between items-center no-print shrink-0 z-50">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <button onClick={() => setView('DASHBOARD')} className="p-3 hover:bg-slate-100 dark:hover:bg-neutral-900 rounded-xl transition-all border border-slate-200 dark:border-neutral-800 text-slate-400"><ArrowLeft className="w-5 h-5" /></button>
              <div className="flex-1 truncate">
                <input value={resumeName} onChange={e => setResumeName(e.target.value)} className="bg-transparent font-black text-lg md:text-xl outline-none p-0 w-full truncate border-b-2 border-transparent focus:border-brand-primary transition-all dark:text-white" />
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4 w-full sm:w-auto justify-between sm:justify-end">
              <div className="flex bg-slate-100 dark:bg-neutral-900 p-1 rounded-xl shrink-0">
                <button onClick={() => setActiveDoc('resume')} className={`px-3 md:px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeDoc === 'resume' ? 'bg-white dark:bg-neutral-700 shadow-sm text-brand-primary' : 'text-slate-500'}`}>Resume</button>
                <button onClick={() => setActiveDoc('cover-letter')} className={`px-3 md:px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeDoc === 'cover-letter' ? 'bg-white dark:bg-neutral-700 shadow-sm text-brand-primary' : 'text-slate-500'}`}>Letter</button>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={handleDownloadPdf} className="btn-brand !py-2.5 !px-3 md:!px-5 text-[10px] md:text-sm uppercase tracking-widest">PDF</button>
                <button onClick={handleSave} className="p-2.5 bg-slate-900 dark:bg-white text-white dark:text-black rounded-xl font-black uppercase tracking-[0.1em] text-[10px] hover:bg-brand-primary hover:text-white transition-all shadow-lg px-3 md:px-4">Save</button>
              </div>
            </div>
          </nav>

          <main className="flex-1 flex overflow-hidden relative">
            {/* Form Container */}
            <div className={`flex-1 overflow-hidden flex flex-col border-r border-slate-200 dark:border-neutral-900 bg-white dark:bg-black transition-all duration-300 ${mobileMode === 'preview' ? 'hidden xl:flex' : 'flex'}`}>
              <ResumeForm data={resumeData} onChange={setResumeData} activeDoc={activeDoc} />
            </div>

            {/* Preview Container - Scalable & Centered */}
            <div
              ref={previewContainerRef}
              className={`flex-1 xl:flex-[0.8] 2xl:flex-1 bg-slate-100 dark:bg-neutral-900 overflow-y-auto p-4 md:p-8 xl:p-12 flex flex-col items-center custom-scrollbar transition-all duration-300 ${mobileMode === 'edit' ? 'hidden xl:flex' : 'flex'}`}
            >
              <div
                className="shadow-[0_60px_120px_-30px_rgba(0,0,0,0.15)] h-fit origin-top transition-transform duration-300 mb-16"
                style={{
                  transform: `scale(${previewScale})`,
                  // Ensure the scaled box takes up the correct amount of space to prevent clipping
                  width: `${816}px`,
                }}
              >
                <LivePreview data={resumeData} activeDoc={activeDoc} />
              </div>
            </div>

            {/* Mobile Navigation Toggle */}
            <div className="xl:hidden fixed bottom-6 left-1/2 -translate-x-1/2 flex bg-slate-900/90 dark:bg-neutral-900/90 backdrop-blur-xl rounded-3xl p-2 shadow-2xl border border-white/10 z-[100]">
              <button
                onClick={() => setMobileMode('edit')}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${mobileMode === 'edit' ? 'bg-brand-primary text-white' : 'text-slate-400'}`}
              >
                <Edit3 className="w-4 h-4" /> Edit
              </button>
              <button
                onClick={() => setMobileMode('preview')}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${mobileMode === 'preview' ? 'bg-brand-primary text-white' : 'text-slate-400'}`}
              >
                <Eye className="w-4 h-4" /> Preview
              </button>
            </div>
          </main>
        </div>
      )}
    </div>
  );
}

export default App;
