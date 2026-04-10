import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { NextResponse } from 'next/server';
import { extractTextFromPDF } from '@/lib/pdf-utils';

export const runtime = 'nodejs';

/**
 * API route to generate 15 interview questions and answers.
 * It takes a CV (PDF) and a job description (text) and uses AI to generate tailored Q&A.
 * 
 * NOTE: Ensure you have your OPENAI_API_KEY set in your .env.local file.
 * The AI SDK will look for it automatically.
 */

export async function GET() {
  return NextResponse.json({ status: 'ok', message: 'API route is reachable.' });
}

export async function POST(req: Request) {
  try {
    console.log('API Request received.');
    
    // Check Content-Type header
    const contentType = req.headers.get('content-type');
    if (!contentType || !contentType.includes('multipart/form-data')) {
       return NextResponse.json(
        { error: 'Invalid content type. Expected multipart/form-data.' },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const cvFile = formData.get('cv') as File | null;
    const jobDescription = formData.get('jobDescription') as string | null;

    if (!cvFile || !jobDescription) {
      return NextResponse.json(
        { error: 'Both CV and job description are required.' },
        { status: 400 }
      );
    }

    // 1. Extract text from the uploaded CV PDF
    const arrayBuffer = await cvFile.arrayBuffer();
    const cvBuffer = Buffer.from(arrayBuffer);
    console.log('CV File received, size:', cvBuffer.length);
    let cvText = '';
    try {
      cvText = await extractTextFromPDF(cvBuffer);
    } catch (parseError: any) {
      console.error('PDF extraction failed in API route:', parseError);
      return NextResponse.json(
        { 
          error: 'Failed to extract text from the PDF file.',
          details: parseError.message || 'Unknown error'
        },
        { status: 500 }
      );
    }
    console.log('CV Text extracted, length:', cvText.length);

    if (!cvText.trim()) {
      return NextResponse.json(
        { error: 'The uploaded PDF file seems to be empty or contains no extractable text.' },
        { status: 400 }
      );
    }

    // 2. Generate 15 interview questions and answers using AI SDK
    console.log('CV Text extracted successfully. Generating questions with OpenAI...');
    
    const { text } = await generateText({
      model: openai('gpt-4o-mini'), // You can change the model here if needed.
      prompt: `
        Analyze the following candidate CV and Job Description.
        Generate 15 realistic and tailored interview questions along with their ideal answers.
        Ensure the questions are specific to how the candidate's experience (from the CV) aligns with the job requirements (from the Job Description).
        
        Candidate CV:
        ${cvText}
        
        Job Description:
        ${jobDescription}
        
        Format the output as a clear list of 15 items, where each item has a Question and an Answer.
        Example format:
        1. **Question:** [Question here]
           **Answer:** [Answer here]
        ...
      `,
    });

    console.log('AI Generation successful.');
    return NextResponse.json({ result: text });
  } catch (error: any) {
    console.error('Error generating questions:', error);
    // Return detailed error message for troubleshooting
    return NextResponse.json(
      { 
        error: 'An error occurred during the generation process.',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
