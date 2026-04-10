const pdf = require('pdf-parse');

/**
 * Extracts text content from a PDF buffer.
 * @param buffer - The PDF file as a buffer.
 * @returns Extracted text
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const data = await pdf(buffer);
    return data.text;
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error('Failed to extract text from PDF.');
  }
}
