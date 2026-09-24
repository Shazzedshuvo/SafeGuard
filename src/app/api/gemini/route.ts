import { NextResponse } from "next/server";

// Fallback priority list of models available for this API key
const FALLBACK_MODELS = [
  "gemini-flash-lite-latest", // Fastest (~900ms), highly available
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-flash-latest",
];

async function callGeminiWithFallback(
  apiKey: string,
  systemInstruction: string,
  userPrompt: string
): Promise<string> {
  let lastError = "";

  for (const model of FALLBACK_MODELS) {
    // Try up to 2 attempts per model (for 503 temporary spikes)
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: systemInstruction }],
            },
            contents: [
              {
                parts: [{ text: userPrompt }],
              },
            ],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 2048,
            },
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
          if (text) {
            return text;
          }
        }

        const errText = await res.text();
        lastError = `[${model} status ${res.status}]: ${errText}`;

        // If 503 (high demand) or 429 (rate limit), pause briefly before retry
        if (res.status === 503 || res.status === 429) {
          await new Promise((resolve) => setTimeout(resolve, 800 * (attempt + 1)));
          continue; // retry this model once
        } else {
          // If 404 or other non-transient error, move to next model immediately
          break;
        }
      } catch (err: unknown) {
        lastError = err instanceof Error ? err.message : String(err);
      }
    }
  }

  throw new Error(`All AI models currently busy. Last response: ${lastError}`);
}

export async function POST(req: Request) {
  try {
    const { action, text, sourceLang, targetLang, websiteUrl, customApiKey, instructions } =
      await req.json();

    const apiKey = customApiKey || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API Key not found. Please provide an API key." },
        { status: 400 }
      );
    }

    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json(
        { error: "Text input cannot be empty." },
        { status: 400 }
      );
    }

    let systemInstruction = "";
    let userPrompt = "";

    if (action === "translate") {
      if (sourceLang === "bn" && targetLang === "en") {
        systemInstruction =
          "You are an expert freelance client communication specialist. " +
          "Translate the provided Bengali/Banglish text into fluent, professional, courteous English suitable for client communication on Fiverr. " +
          "Keep the tone polite, clear, and business-friendly. Do not use filler or chatty commentary. Return ONLY the translated English text.";
        userPrompt = `Translate this message to professional English for a Fiverr client:\n\n${text}`;
      } else {
        // en -> bn
        systemInstruction =
          "You are an expert bilingual English to Bengali translator for freelance developers and designers. " +
          "Translate the provided English client message or requirements into clear, natural, and accurate Bengali so the freelancer understands every detail easily. " +
          "Return ONLY the Bengali translation.";
        userPrompt = `Translate this client message into clear Bengali:\n\n${text}`;
      }
    } else if (action === "format-delivery") {
      const urlPart = websiteUrl && websiteUrl.trim() ? websiteUrl.trim() : "[ website live url ]";
      systemInstruction =
        "You are an elite Fiverr freelance delivery manager. " +
        "The user will provide messy, disorganized, or fragmented work notes / completed tasks ('sms ulta-pulta'). " +
        "You must analyze the tasks completed, extract each distinct task, and format them into clear, professional '- I’ve ...' bullet points. " +
        "You MUST output the result following EXACTLY this structure:\n\n" +
        "Hello there,\n \n" +
        "I hope you and your family are safe and sound!\n \n" +
        "As per your order requirements and message requests, I’ve completed the following tasks:\n\n" +
        "- I’ve [Task 1]\n" +
        "- I’ve [Task 2]\n" +
        "- I’ve [Task 3]\n\n" +
        `Please have a look at: ${urlPart}\n\n` +
        "For some reason, if you have any questions, modifications, or concerns, let me know. I’ll get back to you as soon as possible.\n \n" +
        "Best regards.\n\n" +
        "RULES:\n" +
        "1. Extract all meaningful tasks completed and start each bullet with '- I’ve ' followed by a strong past-tense action verb.\n" +
        "2. Do not omit any crucial detail from the user's messy text.\n" +
        "3. Output ONLY the formatted delivery note, with no extra conversational remarks.";
      userPrompt = `Here is the messy / disorganized work summary to format:\n\n${text}\n\nLive Website URL: ${urlPart}`;
    } else if (action === "format-custom") {
      systemInstruction =
        "You are an expert freelancer message editor. " +
        "Re-organize and rewrite the messy input message according to the custom instruction. " +
        "Make it clean, professional, and well-structured. Output only the rewritten message.";
      userPrompt = `Messy input:\n${text}\n\nInstructions: ${instructions || "Make it well-structured and polite."}`;
    } else {
      return NextResponse.json({ error: "Invalid action." }, { status: 400 });
    }

    const resultText = await callGeminiWithFallback(apiKey, systemInstruction, userPrompt);

    return NextResponse.json({ result: resultText });
  } catch (err: unknown) {
    console.error("API error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to generate AI response. Please try again." },
      { status: 500 }
    );
  }
}
