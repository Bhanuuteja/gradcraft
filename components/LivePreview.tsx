
import React from 'react';
import { ResumeData, ResumeDesign, CustomSection } from '../types';

interface LivePreviewProps {
  data: ResumeData;
  activeDoc?: 'resume' | 'cover-letter';
}

const LivePreview: React.FC<LivePreviewProps> = ({ data, activeDoc = 'resume' }) => {
  const design: ResumeDesign = data.design;
  const spacing = design.spacing || 'normal';
  const fontFamily = design.font === 'sans' ? 'font-sans' : 'font-latex';
  const accentColor = design.accentColor || '#dc2626';

  // Constants for A4 at 96 DPI
  const A4_WIDTH_PX = 816;
  const A4_MIN_HEIGHT_PX = 1154;

  const s = spacing === 'compact' ? {
    padding: 'p-[8mm]',
    sectionMb: 'mb-1.5',
    itemMb: 'mb-1',
    fontSize: 'text-[9pt]',
    headerMb: 'mb-2.5',
  } : {
    padding: 'p-[12mm]',
    sectionMb: 'mb-4',
    itemMb: 'mb-2.5',
    fontSize: 'text-[10pt]',
    headerMb: 'mb-5',
  };

  const parseMarkdown = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) return <strong key={index} className="font-bold">{part.slice(2, -2)}</strong>;
      if (part.startsWith('*') && part.endsWith('*')) return <em key={index}>{part.slice(1, -1)}</em>;
      return part;
    });
  };

  const renderBullets = (text: string) => {
    if (!text) return null;
    return (
      <ul className="list-disc list-outside ml-4 mt-0.5 space-y-0.5">
        {text.split('\n').map((line, i) => {
          const clean = line.replace(/^[•-]\s*/, '').trim();
          if (!clean) return null;
          return <li key={i}>{parseMarkdown(clean)}</li>;
        })}
      </ul>
    );
  };

  const header = (
    <header className={`text-center ${s.headerMb} border-b-2 pb-2.5`} style={{ borderColor: accentColor }}>
      <h1 className="text-4xl font-black mb-1.5" style={{ color: accentColor }}>{data.personalInfo.fullName || 'Your Name'}</h1>
      <div className="flex flex-wrap justify-center gap-x-5 gap-y-0.5 text-[10px] font-bold text-slate-700">
        {data.personalInfo.email && (
          <a href={`mailto:${data.personalInfo.email}`} className="hover:underline transition-all underline-offset-4 decoration-slate-300">
            {data.personalInfo.email}
          </a>
        )}
        {data.personalInfo.phone && (
          <span className="flex items-center gap-5 before:content-['•'] before:text-slate-300">
            <a href={`tel:${data.personalInfo.phone.replace(/\D/g, '')}`} className="hover:underline transition-all underline-offset-4 decoration-slate-300">
              {data.personalInfo.phone}
            </a>
          </span>
        )}
        {data.personalInfo.location && (
          <span className="text-slate-500 flex items-center gap-5 before:content-['•'] before:text-slate-300">
            {data.personalInfo.location}
            {data.personalInfo.openToRelocate && <span className="ml-2 font-black" style={{ color: accentColor }}>(OPEN TO RELOCATION)</span>}
          </span>
        )}
      </div>
      <div className="flex flex-wrap justify-center gap-x-5 text-[9px] font-black text-slate-400 mt-2">
        {data.personalInfo.linkedin && (
          <a href={data.personalInfo.linkedin.startsWith('http') ? data.personalInfo.linkedin : `https://${data.personalInfo.linkedin}`} target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 transition-colors flex items-center">
            LINKEDIN
          </a>
        )}
        {data.personalInfo.github && (
          <a href={data.personalInfo.github.startsWith('http') ? data.personalInfo.github : `https://${data.personalInfo.github}`} target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 transition-colors flex items-center before:content-['•'] before:mr-5 before:text-slate-300">
            GITHUB
          </a>
        )}
        {data.personalInfo.portfolio && (
          <a href={data.personalInfo.portfolio.startsWith('http') ? data.personalInfo.portfolio : `https://${data.personalInfo.portfolio}`} target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 transition-colors flex items-center before:content-['•'] before:mr-5 before:text-slate-300">
            PORTFOLIO
          </a>
        )}
      </div>
    </header>
  );

  if (activeDoc === 'cover-letter') {
    return (
      <div
        id="live-preview"
        className={`bg-white border border-slate-100 ${s.padding} ${fontFamily} ${s.fontSize} leading-relaxed text-slate-800 shrink-0`}
        style={{ width: `${A4_WIDTH_PX}px`, minHeight: `${A4_MIN_HEIGHT_PX}px` }}
      >
        {header}
        <div className="mt-10 space-y-8">
          <p className="text-right font-black text-slate-400 text-[10px] uppercase">{data.coverLetter.date || new Date().toLocaleDateString()}</p>
          <div className="font-bold text-slate-900 leading-tight space-y-1">
            <p className="uppercase text-[11px] text-slate-400 mb-1">To</p>
            <p className="text-lg">{data.coverLetter.recipientName || 'Hiring Manager'}</p>
            <p className="text-[10px] font-medium uppercase text-slate-500">{data.coverLetter.recipientTitle || 'Talent Acquisition'}</p>
            <p>{data.coverLetter.companyName}</p>
          </div>
          <div className="mt-8 text-justify whitespace-pre-wrap leading-relaxed text-slate-700">
            {parseMarkdown(data.coverLetter.content)}
          </div>
          <div className="mt-12">
            <p className="text-[10px] font-bold uppercase text-slate-400 mb-2">Respectfully,</p>
            <p className="font-black text-lg" style={{ color: accentColor }}>{data.personalInfo.fullName}</p>
          </div>
        </div>
      </div>
    );
  }

  const renderSection = (title: string, content: React.ReactNode) => (
    <section className={s.sectionMb}>
      <h2 className="font-black uppercase border-b mb-2 text-[11px]" style={{ color: accentColor, borderColor: '#f1f5f9' }}>{title}</h2>
      {content}
    </section>
  );

  const renderSectionContent = (sectionId: string) => {
    switch (sectionId) {
      case 'summary':
        return data.personalInfo.summary ? renderSection("Professional Summary", <p className="text-justify leading-relaxed">{parseMarkdown(data.personalInfo.summary)}</p>) : null;

      case 'skills':
        return data.skills ? renderSection("Skills", <div className="space-y-1.5">
          {Array.isArray(data.skills) ? data.skills.map((skill, idx) => (
            <div key={idx} className="flex">
              <span className="font-bold whitespace-nowrap min-w-[120px] text-slate-900">{skill.name}:</span>
              <span className="text-slate-700 font-medium">{skill.items}</span>
            </div>
          )) : <p className="text-justify font-medium">{parseMarkdown(data.skills)}</p>}
        </div>) : null;

      case 'experience':
        return data.experience.length > 0 ? renderSection("Experience",
          <div className="space-y-4">
            {data.experience.map(exp => (
              <div key={exp.id} className={s.itemMb}>
                <div className="flex justify-between font-bold text-slate-900 items-baseline">
                  <span className="font-bold text-[11pt]">{exp.company}</span>
                  <span className="text-slate-400 text-[8pt] font-black">{exp.duration}</span>
                </div>
                <div className="italic text-[9pt] font-black text-slate-500 mb-1.5">{exp.role}</div>
                <div className="text-slate-700 leading-relaxed">{renderBullets(exp.description)}</div>
              </div>
            ))}
          </div>
        ) : null;

      case 'projects':
        return data.projects.length > 0 ? renderSection("Projects",
          <div className="space-y-3">
            {data.projects.map(proj => (
              <div key={proj.id} className={s.itemMb}>
                <div className="flex justify-between font-bold">
                  <span className="text-slate-900 text-[11pt] uppercase">{proj.name} | <span className="text-[8pt] font-medium italic text-slate-400 tracking-widest">{proj.technologies}</span></span>
                  {proj.link && (
                    <a href={proj.link.startsWith('http') ? proj.link : `https://${proj.link}`} target="_blank" rel="noopener noreferrer" className="text-[8pt] font-black hover:underline" style={{ color: accentColor }}>
                      [VIEW PROJECT]
                    </a>
                  )}
                </div>
                <div className="text-slate-700 leading-relaxed mt-1">{renderBullets(proj.description)}</div>
              </div>
            ))}
          </div>
        ) : null;

      case 'education':
        return data.education.length > 0 ? renderSection("Education",
          <div className="space-y-3">
            {data.education.map(edu => (
              <div key={edu.id} className="flex justify-between items-start">
                <div className="leading-tight flex-1">
                  <span className="font-bold text-slate-900 text-[11pt] uppercase tracking-tight">{edu.school}</span>
                  <div className="text-[9pt] text-slate-500 font-bold uppercase mt-1">{edu.degree} {edu.gpa && `| GPA: ${edu.gpa}`}</div>
                  {edu.coursework && (
                    <div className="text-[8pt] text-slate-600 mt-1 leading-relaxed">
                      <span className="font-black uppercase tracking-[0.15em] text-[7pt] text-slate-400 mr-2">Core Coursework:</span>
                      <span className="font-black uppercase text-[7pt] text-slate-400 mr-2">Core Coursework:</span>
                      {parseMarkdown(edu.coursework)}
                    </div>
                  )}
                </div>
                <span className="italic text-[8pt] font-black text-slate-400 uppercase ml-4">{edu.year}</span>
              </div>
            ))}
          </div>
        ) : null;

      default:
        // Handle Custom Sections
        const custom = data.customSections.find(c => c.id === sectionId);
        if (custom && custom.items.length > 0) {
          return renderSection(custom.title,
            <div className="space-y-4">
              {custom.items.map(item => (
                <div key={item.id} className={s.itemMb}>
                  <div className="flex justify-between font-bold text-slate-900 items-baseline">
                    <span className="uppercase tracking-tight text-[11pt]">{item.title}</span>
                    <span className="text-slate-400 text-[8pt] font-black">{item.date}</span>
                  </div>
                  {item.subtitle && <div className="italic text-[9pt] font-black text-slate-500 mb-1.5 uppercase">{item.subtitle}</div>}
                  <div className="text-slate-700 leading-relaxed">{renderBullets(item.description)}</div>
                </div>
              ))}
            </div>
          );
        }
        return null;
    }
  };

  return (
    <div
      id="live-preview"
      className={`bg-white border border-slate-100 ${s.padding} ${fontFamily} ${s.fontSize} leading-snug text-slate-900 overflow-hidden shrink-0 shadow-paper`}
      style={{ width: `${A4_WIDTH_PX}px`, minHeight: `${A4_MIN_HEIGHT_PX}px` }}
    >
      {header}
      {/* Map through sectionOrder to support reordering and custom sections */}
      <div className="space-y-1">
        {data.sectionOrder.map(sectionId => (
          <React.Fragment key={sectionId}>
            {renderSectionContent(sectionId)}
          </React.Fragment>
        ))}
        {/* Fallback for custom sections not yet in sectionOrder */}
        {data.customSections
          .filter(cs => !data.sectionOrder.includes(cs.id))
          .map(cs => (
            <React.Fragment key={cs.id}>
              {renderSectionContent(cs.id)}
            </React.Fragment>
          ))
        }
      </div>
    </div>
  );
};

export default LivePreview;
