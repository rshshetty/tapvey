import { NextResponse } from "next/server";

export async function POST(req) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  const { rating, posTags, negTags, notes, isPos } = await req.json();

  if (!rating || (!posTags?.length && !negTags?.length)) {
    return NextResponse.json({ error: "Rating and at least one tag required" }, { status: 400 });
  }

  const mixed = posTags.length > 0 && negTags.length > 0;
  const posHeavy = posTags.length > negTags.length;
  const negHeavy = negTags.length > posTags.length;

  const prompt = `Write a natural, human-sounding restaurant review based only on these inputs:

Rating: ${rating}/5 stars
${posTags.length > 0 ? `Highlights: ${posTags.join(", ")}` : ""}
${negTags.length > 0 ? `Areas to improve: ${negTags.join(", ")}` : ""}
${notes ? `Customer notes: ${notes}` : ""}

Rules:
- 2–3 sentences only
- Sound completely human — not like AI or marketing copy
- Only reference the selected tags. Do not invent any detail.
- No emojis
- ${mixed && posHeavy ? "Mostly positive tone — acknowledge the issue briefly at the end" : ""}
- ${mixed && negHeavy ? "Lead with the main concerns, but acknowledge what worked" : ""}
- ${mixed && !posHeavy && !negHeavy ? "Balanced — give equal weight to positives and negatives" : ""}
- ${!mixed && isPos ? "Positive tone — suitable for public review platforms" : ""}
- ${!mixed && !isPos ? "Constructive, empathetic tone — suitable for private feedback to the restaurant" : ""}
- Output only the review text. No preamble.`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens: 300,
            temperature: 0.8,
          },
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: data.error?.message || "API request failed" },
        { status: res.status }
      );
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return NextResponse.json({ error: "No response generated" }, { status: 500 });
    }

    return NextResponse.json({ text });
  } catch {
    return NextResponse.json({ error: "Failed to connect to AI service" }, { status: 502 });
  }
}
