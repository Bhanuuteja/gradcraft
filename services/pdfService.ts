import * as pdfjsLib from 'pdfjs-dist';

// In some ESM environments (like esm.sh), the module is exported as 'default'.
const pdfjs: any = (pdfjsLib as any).default || pdfjsLib;

const WORKER_URL = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

let workerSetupPromise: Promise<void> | null = null;

const setupWorker = () => {
  if (workerSetupPromise) return workerSetupPromise;

  workerSetupPromise = (async () => {
    if (pdfjs.GlobalWorkerOptions.workerSrc) return;
    try {
        const response = await fetch(WORKER_URL);
        if (!response.ok) throw new Error('Failed to fetch PDF worker');
        const script = await response.text();
        const blob = new Blob([script], { type: 'text/javascript' });
        pdfjs.GlobalWorkerOptions.workerSrc = URL.createObjectURL(blob);
    } catch (error) {
        console.warn("Falling back to direct worker URL due to Blob fetch error:", error);
        pdfjs.GlobalWorkerOptions.workerSrc = WORKER_URL;
    }
  })();
  return workerSetupPromise;
};

interface TextItem {
  str: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export const extractTextFromPdf = async (file: File): Promise<string> => {
  await setupWorker();

  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjs.getDocument({ 
        data: arrayBuffer,
        useWorkerFetch: false,
        isEvalSupported: false,
        useSystemFonts: true
    });
    
    const pdf = await loadingTask.promise;
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const items = textContent.items as any[];

      // 1. Map to cleaner objects
      const textItems: TextItem[] = items.map(item => ({
        str: item.str,
        x: item.transform[4],
        y: item.transform[5],
        w: item.width,
        h: item.height
      })).filter(item => item.str.trim().length > 0);

      // 2. Group by Line (Y-axis clustering)
      // We assume items within ~4px vertical difference are on the same line
      const lines: TextItem[][] = [];
      const Y_TOLERANCE = 5;

      // Sort by Y descending first to process top-to-bottom
      textItems.sort((a, b) => b.y - a.y);

      for (const item of textItems) {
        let placed = false;
        for (const line of lines) {
           // Check if this item fits in an existing line bucket
           const avgY = line.reduce((sum, i) => sum + i.y, 0) / line.length;
           if (Math.abs(item.y - avgY) < Y_TOLERANCE) {
             line.push(item);
             placed = true;
             break;
           }
        }
        if (!placed) {
          lines.push([item]);
        }
      }

      // 3. Sort Lines by Y (Top to Bottom)
      lines.sort((a, b) => {
         const yA = a[0].y;
         const yB = b[0].y;
         return yB - yA;
      });

      // 4. Sort Items within Lines by X (Left to Right) and Join
      const pageString = lines.map(line => {
        line.sort((a, b) => a.x - b.x);
        
        // Intelligent joining: detect wide gaps (tabs/columns) vs small gaps (spaces)
        let lineStr = '';
        let lastXEnd = -1;

        for (const item of line) {
          if (lastXEnd !== -1) {
             const gap = item.x - lastXEnd;
             if (gap > 10) { 
               // Large gap, likely a visual separator or column
               lineStr += '   '; 
             } else if (gap > 1 || !lineStr.endsWith(' ')) { 
               // Standard word spacing
               lineStr += ' '; 
             }
          }
          lineStr += item.str;
          lastXEnd = item.x + item.w;
        }
        return lineStr.trim();
      }).join('\n');
      
      fullText += pageString + '\n\n';
    }
    
    return fullText;
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    let msg = "Failed to extract text from PDF.";
    if (error instanceof Error) {
        if (error.message.includes("fake worker") || error.message.includes("Worker")) {
             msg += " The PDF engine failed to initialize. Please refresh the page.";
        }
    }
    throw new Error(msg);
  }
};