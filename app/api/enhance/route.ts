import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are a senior resume coach and ATS specialist. Analyze the resume and return ONLY a valid JSON object — no markdown, no explanation, no code fences.

Use this exact schema:
{
  "ats_score": <integer 0-100>,
  "overall_impression": "<2-3 sentences summarizing the resume quality>",
  "strengths": ["<strength>", "<strength>"],
  "sections": [
    {
      "name": "<e.g. Summary, Experience, Skills, Education>",
      "score": <integer 0-100>,
      "status": "<good|needs_improvement|critical>",
      "issues": ["<specific issue found in the resume>"],
      "suggestions": ["<actionable improvement>"],
      "rewrite_example": "<optional: a rewritten version of a weak line>"
    }
  ],
  "keywords_missing": ["<keyword>"],
  "quick_wins": ["<high-impact change that takes under 5 minutes>"],
  "formatting_notes": ["<formatting or structure tip>"]
}

Rules:
- Analyze every section present in the resume
- Be specific and reference actual text from the resume
- Return ONLY the JSON object, nothing else`;

async function callGroq(resumeText: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY is not set in .env.local');

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Analyze this resume:\n\n${resumeText}` },
      ],
      temperature: 0.3,
      max_tokens: 4096,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    if (res.status === 401) throw new Error('Invalid GROQ_API_KEY. Please check your .env.local file.');
    if (res.status === 429) throw new Error('Groq rate limit hit. Please wait a moment and try again.');
    throw new Error(`Groq API error (${res.status}): ${errText.slice(0, 200)}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

export async function POST(req: NextRequest) {
  try {
    let resumeText = '';
    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;

      if (file) {
        if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
          const buffer = Buffer.from(await file.arrayBuffer());
          try {
            const pdfParse = (await import('pdf-parse')).default;
            const result = await pdfParse(buffer);
            resumeText = result.text;
          } catch {
            return NextResponse.json(
              { error: 'Could not read PDF. Try copying the text manually into the paste tab.' },
              { status: 422 }
            );
          }
        } else {
          resumeText = await file.text();
        }
      }
    } else {
      const body = await req.json().catch(() => ({}));
      resumeText = (body.resumeText as string) || '';
    }

    resumeText = resumeText.trim();
    if (resumeText.length < 50) {
      return NextResponse.json(
        { error: 'Resume text is too short. Please paste your full resume content.' },
        { status: 400 }
      );
    }
    if (resumeText.length > 12000) resumeText = resumeText.slice(0, 12000);

    const raw = await callGroq(resumeText);

    let data;
    try {
      const cleaned = raw.replace(/```json|```/g, '').trim();
      data = JSON.parse(cleaned);
    } catch {
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) {
        data = JSON.parse(match[0]);
      } else {
        console.error('Raw Groq response:', raw);
        return NextResponse.json(
          { error: 'AI returned an unexpected format. Please try again.' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true, data });
  } catch (err: unknown) {
    console.error('Enhancement error:', err);
    const msg = err instanceof Error ? err.message : 'Unexpected server error';
    const status = msg.includes('GROQ_API_KEY') || msg.includes('Invalid GROQ') || msg.includes('401') ? 401 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
