const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_MODEL = "gemini-1.5-flash";
const GEMINI_BASE_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export type AIMode = "create" | "edit" | "summarize" | "qa";

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text: string }>;
    };
  }>;
}

export async function generateContent(
  prompt: string,
  context?: string
): Promise<string> {
  const fullPrompt = context
    ? `السياق:\n${context}\n\nالطلب:\n${prompt}`
    : prompt;

  const response = await fetch(`${GEMINI_BASE_URL}?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: fullPrompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4096,
      },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini API error: ${err}`);
  }

  const data: GeminiResponse = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

export function buildDocumentPrompt(userPrompt: string): string {
  return `أنت مساعد كتابة متخصص باللغة العربية. مهمتك إنشاء وثيقة احترافية كاملة.

طلب المستخدم: ${userPrompt}

يرجى إنشاء الوثيقة بالتنسيق التالي:
- استخدم عناوين واضحة (##)
- استخدم نقاط والقوائم عند الحاجة
- الكتابة باللغة العربية الفصحى
- المحتوى مفصل ومفيد
- أضف مقدمة وخاتمة

ابدأ مباشرة بالوثيقة دون مقدمات:`;
}

export function buildSummaryPrompt(text: string): string {
  return `لخّص النص التالي باللغة العربية بشكل واضح ومختصر مع الحفاظ على النقاط الرئيسية:

${text}

الملخص:`;
}

export function buildEditPrompt(originalText: string, instruction: string): string {
  return `قم بتعديل النص التالي وفقاً للتعليمات المحددة:

النص الأصلي:
${originalText}

تعليمات التعديل:
${instruction}

النص المعدّل (باللغة العربية):`;
}

export function buildQAPrompt(text: string, question: string): string {
  return `بناءً على النص التالي، أجب على السؤال بشكل دقيق ومفصل باللغة العربية:

النص:
${text}

السؤال: ${question}

الإجابة:`;
}
