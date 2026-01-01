import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, TabStopType, TabStopPosition } from "docx";
import FileSaver from "file-saver";
import { ResumeData } from "../types";

export const downloadDocx = async (data: ResumeData) => {
  // Helper to create a section heading
  const createHeading = (text: string) => {
    return new Paragraph({
      text: text.toUpperCase(),
      heading: HeadingLevel.HEADING_2,
      thematicBreak: true, // Adds a bottom border line effectively
      spacing: {
        before: 200,
        after: 100,
      },
    });
  };

  // Helper to parse Markdown string into TextRun[]
  const parseMarkdownToRuns = (text: string): TextRun[] => {
      // Regex splits: Bold (**), Italic (*)
      // Groups: 1=Bold, 2=Italic
      // Note: This is simple and doesn't support nested markdown perfectly, but works for basic usage.
      const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
      
      return parts.map(part => {
          if (part.startsWith('**') && part.endsWith('**')) {
              return new TextRun({
                  text: part.slice(2, -2),
                  bold: true
              });
          } else if (part.startsWith('*') && part.endsWith('*')) {
             return new TextRun({
                 text: part.slice(1, -1),
                 italics: true
             });
          } else {
              return new TextRun({ text: part });
          }
      });
  };

  // Helper to format bullets with Markdown support
  const createBullet = (text: string) => {
    const cleanText = text.replace(/^[•-]\s*/, '');
    return new Paragraph({
      children: parseMarkdownToRuns(cleanText),
      bullet: {
        level: 0,
      },
    });
  };

  // Helper for split lines (Left text ........ Right text)
  const createSplitLine = (left: string, right: string, boldLeft = true) => {
    return new Paragraph({
      tabStops: [
        {
          type: TabStopType.RIGHT,
          position: TabStopPosition.MAX,
        },
      ],
      children: [
        new TextRun({
          text: left,
          bold: boldLeft,
          size: 22, // 11pt
        }),
        new TextRun({
          children: [new TextRun("\t" + right)],
          bold: false,
          italics: true,
          size: 22,
        }),
      ],
    });
  };

  const allChildren = [];

  // Header
  allChildren.push(
    new Paragraph({
      text: data.personalInfo.fullName,
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    })
  );

  const contactParts = [
    data.personalInfo.email,
    data.personalInfo.phone,
    data.personalInfo.location ? `${data.personalInfo.location}${data.personalInfo.openToRelocate ? ' (Open to Relocate)' : ''}` : null,
    data.personalInfo.linkedin,
    data.personalInfo.github,
  ].filter(Boolean).join("  •  ");

  allChildren.push(
    new Paragraph({
      text: contactParts,
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    })
  );

  // Summary
  if (data.personalInfo.summary) {
    allChildren.push(createHeading("Professional Summary"));
    allChildren.push(new Paragraph({ children: parseMarkdownToRuns(data.personalInfo.summary) }));
  }

  // Dynamic Sections
  data.sectionOrder.forEach(sectionId => {
      if (sectionId === 'summary') return; // Handled above

      if (sectionId === 'skills' && data.skills) {
        allChildren.push(createHeading("Technical Skills"));
        allChildren.push(
            new Paragraph({
                children: [
                new TextRun({ text: "Skills: ", bold: true }),
                ...parseMarkdownToRuns(data.skills),
                ],
            })
        );
      }

      if (sectionId === 'experience' && data.experience.length > 0) {
        allChildren.push(createHeading("Experience"));
        data.experience.forEach((exp) => {
            allChildren.push(createSplitLine(exp.company, exp.duration));
            allChildren.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: exp.role,
                      italics: true,
                    }),
                  ],
                  spacing: { after: 50 },
                })
            );
            
            const bullets = exp.description.split('\n').filter(line => line.trim().length > 0);
            bullets.forEach(b => allChildren.push(createBullet(b)));
            
            allChildren.push(new Paragraph({ text: "" })); // Spacer
        });
      }

      if (sectionId === 'projects' && data.projects.length > 0) {
        allChildren.push(createHeading("Projects"));
        data.projects.forEach((proj) => {
            const nameText = proj.technologies ? `${proj.name} | ${proj.technologies}` : proj.name;
            // Note: complex mixed formatting in split line is hard in basic docx helper, simpler to keep title plain text for now or extend helper.
            // For now, let's keep name text simple in the header line.
            allChildren.push(createSplitLine(nameText, proj.link));
            
            const bullets = proj.description.split('\n').filter(line => line.trim().length > 0);
            bullets.forEach(b => allChildren.push(createBullet(b)));
            
            allChildren.push(new Paragraph({ text: "" })); // Spacer
        });
      }

      if (sectionId === 'education' && data.education.length > 0) {
        allChildren.push(createHeading("Education"));
        data.education.forEach((edu) => {
            allChildren.push(createSplitLine(edu.school, edu.year));
            
            const degreeText = edu.gpa ? `${edu.degree} | GPA: ${edu.gpa}` : edu.degree;
            allChildren.push(
                new Paragraph({
                text: degreeText,
                spacing: { after: edu.coursework ? 50 : 100 },
                })
            );

            if (edu.coursework) {
                allChildren.push(
                    new Paragraph({
                        children: [
                            new TextRun({ text: "Relevant Coursework: ", bold: true, italics: true }),
                            ...parseMarkdownToRuns(edu.coursework)
                        ],
                        spacing: { after: 100 }
                    })
                );
            }
        });
      }

      const custom = data.customSections.find(c => c.id === sectionId);
      if (custom && custom.items.length > 0) {
         allChildren.push(createHeading(custom.title));
         custom.items.forEach(item => {
             allChildren.push(createSplitLine(item.title, item.date));
             if (item.subtitle) {
                allChildren.push(new Paragraph({
                    children: [
                        new TextRun({
                            text: item.subtitle,
                            italics: true,
                        })
                    ]
                }));
             }
             const bullets = item.description.split('\n').filter(line => line.trim().length > 0);
             bullets.forEach(b => allChildren.push(createBullet(b)));
         });
      }
  });

  const doc = new Document({
    sections: [
      {
        properties: {
            page: {
                margin: {
                    top: 720, // 0.5 inch
                    right: 720,
                    bottom: 720,
                    left: 720,
                },
            },
        },
        children: allChildren,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const filename = `${(data.personalInfo.fullName || 'Resume').replace(/[^a-z0-9]/gi, '_')}_Resume.docx`;
  FileSaver.saveAs(blob, filename);
};