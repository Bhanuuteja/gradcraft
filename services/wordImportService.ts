import mammoth from 'mammoth';

export const extractTextFromDocx = async (file: File): Promise<string> => {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        return result.value;
    } catch (error) {
        console.error("DOCX Extract Error", error);
        throw new Error("Could not extract text from Word document. Please ensure it is a valid .docx file.");
    }
};