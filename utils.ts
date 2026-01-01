import { ResumeData } from './types';

export const generateId = (): string => Math.random().toString(36).substr(2, 9);

const escapeLatex = (str: string): string => {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/&/g, '\\&')
    .replace(/%/g, '\\%')
    .replace(/\$/g, '\\$')
    .replace(/#/g, '\\#')
    .replace(/_/g, '\\_')
    .replace(/{/g, '\\{')
    .replace(/}/g, '\\}')
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/\^/g, '\\textasciicircum{}');
};

// Converts **text** to \textbf{text} and *text* to \textit{text}
const formatMarkdownToLatex = (str: string): string => {
  let escaped = escapeLatex(str);
  // Replace **...** with \textbf{...}
  escaped = escaped.replace(/\\textasciitilde\{\}\*(.*?)\*\\textasciitilde\{\}/g, '\\textbf{$1}'); // edge case if ~ used
  // We need to be careful about conflicting escapes. 
  // Simplified regex approach:
  // 1. Un-escape the * characters temporarily or handle them carefully.
  // Actually, escapeLatex doesn't escape *. So we are good.

  // Bold: **text**
  escaped = escaped.replace(/\*\*(.*?)\*\*/g, '\\textbf{$1}');

  // Italic: *text* (must be done after bold)
  escaped = escaped.replace(/(?<!\\)\*(.*?)(?<!\\)\*/g, '\\textit{$1}');

  return escaped;
}

const formatBulletsToLatex = (text: string): string => {
  if (!text) return '';
  // Split by newlines, clean up, and wrap in itemize
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length === 0) return '';

  // Check if user already provided dashes or bullets
  const formattedItems = lines.map(line => {
    const cleanLine = line.replace(/^[•-]\s*/, '');
    return `  \\item ${formatMarkdownToLatex(cleanLine)}`;
  }).join('\n');

  return `\\begin{itemize}\n${formattedItems}\n\\end{itemize}`;
};

export const generateLatexSource = (data: ResumeData): string => {

  const generateSectionLatex = (sectionId: string): string => {
    switch (sectionId) {
      case 'summary':
        return ''; // Handled separately

      case 'skills':
        if (!data.skills || data.skills.length === 0) return '';
        const skillItems = Array.isArray(data.skills)
          ? data.skills.map(s => `\\textbf{${escapeLatex(s.name)}}{: ${escapeLatex(s.items)}}`).join(' \\\\ \n')
          : `\\textbf{Skills}{: ${formatMarkdownToLatex(data.skills as string)}}`; // Fallback for old data

        return `
\\section{Technical Skills}
 \\begin{itemize}[leftmargin=0.15in, label={}]
    \\small{\\item{
     ${skillItems}
    }}
 \\end{itemize}
            `;

      case 'experience':
        if (data.experience.length === 0) return '';
        const expItems = data.experience.map(exp =>
          `\\resumeSubheading
                {${escapeLatex(exp.company)}}{${escapeLatex(exp.duration)}}
                {${escapeLatex(exp.role)}}{}
                \\resumeItemListStart
                    ${formatBulletsToLatex(exp.description).replace(/\\begin{itemize}|\\end{itemize}/g, '').replace(/\\item/g, '\\resumeItem')}
                \\resumeItemListEnd`
        ).join('\n');
        return `
\\section{Experience}
  \\resumeSubHeadingListStart
    ${expItems}
  \\resumeSubHeadingListEnd
            `;

      case 'projects':
        if (data.projects.length === 0) return '';
        const projItems = data.projects.map(proj =>
          `\\resumeProjectHeading
                {\\textbf{${escapeLatex(proj.name)}} $|$ \\emph{${formatMarkdownToLatex(proj.technologies)}}}{${escapeLatex(proj.link)}}
                \\resumeItemListStart
                    ${formatBulletsToLatex(proj.description).replace(/\\begin{itemize}|\\end{itemize}/g, '').replace(/\\item/g, '\\resumeItem')}
                \\resumeItemListEnd`
        ).join('\n');
        return `
\\section{Projects}
  \\resumeSubHeadingListStart
    ${projItems}
  \\resumeSubHeadingListEnd
            `;

      case 'education':
        if (data.education.length === 0) return '';
        const eduItems = data.education.map(edu => {
          let content = `\\resumeSubheading
                {${escapeLatex(edu.school)}}{${escapeLatex(edu.year)}}
                {${escapeLatex(edu.degree)} ${edu.gpa ? `| GPA: ${escapeLatex(edu.gpa)}` : ''}}{}`;

          if (edu.coursework) {
            content += `\n\\resumeItem{\\textbf{Relevant Coursework:} ${formatMarkdownToLatex(edu.coursework)}}`;
          }
          return content;
        }).join('\n');
        return `
\\section{Education}
  \\resumeSubHeadingListStart
    ${eduItems}
  \\resumeSubHeadingListEnd
            `;

      default:
        // Custom Section
        const custom = data.customSections.find(c => c.id === sectionId);
        if (custom && custom.items.length > 0) {
          const customItems = custom.items.map(item =>
            `\\resumeSubheading
                    {${escapeLatex(item.title)}}{${escapeLatex(item.date)}}
                    {${escapeLatex(item.subtitle)}}{}
                    \\resumeItemListStart
                        ${formatBulletsToLatex(item.description).replace(/\\begin{itemize}|\\end{itemize}/g, '').replace(/\\item/g, '\\resumeItem')}
                    \\resumeItemListEnd`
          ).join('\n');
          return `
\\section{${escapeLatex(custom.title)}}
  \\resumeSubHeadingListStart
    ${customItems}
  \\resumeSubHeadingListEnd
                 `;
        }
        return '';
    }
  };

  const dynamicSections = data.sectionOrder.map(id => generateSectionLatex(id)).join('\n');

  // Build Location / Contact Line
  const locationStr = data.personalInfo.location
    ? `${escapeLatex(data.personalInfo.location)} ${data.personalInfo.openToRelocate ? '(Open to Relocate)' : ''}`
    : '';

  return `\\documentclass[letterpaper,11pt]{article}

\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{tabularx}

\\pagestyle{fancy}
\\fancyhf{} 
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

\\addtolength{\\oddsidemargin}{-0.5in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1in}
\\addtolength{\\topmargin}{-.5in}
\\addtolength{\\textheight}{1.0in}

\\urlstyle{same}

\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

\\titleformat{\\section}{
  \\vspace{-4pt}\\scshape\\raggedright\\large
}{}{0em}{}[\\color{black}\\titlerule \\vspace{-5pt}]

\\newcommand{\\resumeItem}[1]{
  \\item\\small{
    {#1 \\vspace{-2pt}}
  }
}

\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-1pt}\\item
    \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} & #2 \\\\
      \\textit{\\small#3} & \\textit{\\small #4} \\\\
    \\end{tabular*}\\vspace{-5pt}
}

\\newcommand{\\resumeProjectHeading}[2]{
    \\item
    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\small#1 & #2 \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeSubItem}[2]{\\resumeItem{#1}{#2}\\vspace{-4pt}}

\\renewcommand{\\labelitemi}{$\\vcenter{\\hbox{\\tiny$\\bullet$}}$}
\\renewcommand{\\labelitemii}{$\\vcenter{\\hbox{\\tiny$\\bullet$}}$}

\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0.15in, label={}]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-5pt}}

%-------------------------------------------
%%%%%%  RESUME STARTS HERE  %%%%%%%%%%%%%%%%////////////

\\begin{document}

%----------HEADING-----------------
\\begin{tabular*}{\\textwidth}{l@{\\extracolsep{\\fill}}r}
  \\textbf{\\href{http://linkedin.com/}{\\Large ${escapeLatex(data.personalInfo.fullName)}}} & Email : \\href{mailto:${escapeLatex(data.personalInfo.email)}}{${escapeLatex(data.personalInfo.email)}}\\\\
  \\href{${escapeLatex(data.personalInfo.linkedin)}}{${escapeLatex(data.personalInfo.linkedin)}} & Mobile : ${escapeLatex(data.personalInfo.phone)} \\\\
  \\href{${escapeLatex(data.personalInfo.github)}}{${escapeLatex(data.personalInfo.github)}} & ${locationStr} \\\\
\\end{tabular*}

%-----------SUMMARY-----------------
\\section{Professional Summary}
${formatMarkdownToLatex(data.personalInfo.summary)}

${dynamicSections}

\\end{document}
`;
};