import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { NextResponse } from 'next/server';
import { extractTextFromPDF } from '@/lib/pdf-utils';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
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

    const arrayBuffer = await cvFile.arrayBuffer();
    const cvBuffer = Buffer.from(arrayBuffer);

    let cvText = '';
    try {
      cvText = await extractTextFromPDF(cvBuffer);
    } catch (parseError: any) {
      return NextResponse.json(
        { error: 'Failed to extract text from the PDF file.', details: parseError.message },
        { status: 500 }
      );
    }

    if (!cvText.trim()) {
      return NextResponse.json(
        { error: 'The uploaded PDF appears to be empty or contains no extractable text.' },
        { status: 400 }
      );
    }

    const { text } = await generateText({
      model: openai('gpt-4o-mini'),
      prompt: `You are an expert recruiter, ATS (Applicant Tracking System), and career coach.

Analyse the following CV against the job description and return ONLY a valid JSON object. No markdown, no explanation outside the JSON.

CV:
${cvText}

Job Description:
${jobDescription}

Return this exact JSON structure:
{
  "ats_score": number (0-100),
  "score_breakdown": {
    "keywords_match": number (0-100),
    "experience_relevance": number (0-100),
    "formatting": number (0-100),
    "impact_strength": number (0-100)
  },
  "summary": "Short 1-2 sentence explanation of overall CV quality",
  "missing_keywords": ["keyword1", "keyword2", "keyword3"],
  "keyword_suggestions": [
    {
      "keyword": "string",
      "why_it_matters": "string",
      "suggestion": "string"
    }
  ],
  "weak_bullet_points": [
    {
      "original": "string",
      "improved": "string"
    }
  ],
  "impact_issues": ["string"],
  "tailoring_gaps": [
    {
      "requirement": "string",
      "issue": "string",
      "fix": "string"
    }
  ],
  "top_improvements": ["string"],
  "ready_for_interview_score": number (0-100)
}

Rules:
- Be realistic and slightly strict with scores. Do NOT inflate them.
- Use simple, clear English. No jargon.
- Limit each list to 5 items max unless critical.
- Do NOT invent experience the candidate doesn't have.
- Return ONLY the JSON object. Nothing else.`,
    });

    let parsed;
    try {
      const cleaned = text.replace(/```json|```/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      return NextResponse.json(
        { error: 'Failed to parse AI response. Please try again.', raw: text },
        { status: 500 }
      );
    }

    return NextResponse.json({ result: parsed });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'An error occurred during analysis.', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
