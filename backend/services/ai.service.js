const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const getGroqResponse = async (messages, options = {}) => {
  const response = await groq.chat.completions.create({
    model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
    messages,
    temperature: options.temperature || 0.7,
    max_tokens: options.maxTokens || 2000,
  });

  return response.choices[0].message.content;
};

const callAI = async (messages, options = {}) => {
  try {
    return await getGroqResponse(messages, options);
  } catch (error) {
    console.error("Groq AI error:", error.message);
    throw new Error(`AI service error: ${error.message}`);
  }
};

// ─── Notes Generation ─────────────────────────────────────────
const generateNotes = async (text, noteType = "concise") => {
  const prompts = {
    concise: `You are an expert study assistant. Generate concise, well-structured study notes from the following text.
Format the notes with clear headings, bullet points, and key terms highlighted with **bold**.
Focus on the most important concepts, definitions, and key points.
Use markdown formatting.`,

    detailed: `You are an expert academic assistant. Generate comprehensive, detailed study notes from the following text.
Include all important concepts, explanations, examples, and relationships between ideas.
Use clear headings (##), subheadings (###), bullet points, and number lists where appropriate.
Highlight important terms with **bold** and add brief explanations.
Format everything in clean markdown.`,

    summary: `You are an expert study assistant. Create a concise executive summary of the following text.
Include:
1. **Main Topic**: One sentence overview
2. **Key Points**: 5-7 bullet points of the most critical information
3. **Important Terms**: Brief glossary of key terms
4. **Takeaways**: 3-5 actionable insights or main lessons
Use clean markdown formatting.`,
  };

  const truncatedText = text.slice(0, 12000);

  const messages = [
    { role: "system", content: prompts[noteType] },
    {
      role: "user",
      content: `Please generate ${noteType} notes from this content:\n\n${truncatedText}`,
    },
  ];

  return callAI(messages, { maxTokens: 2500, temperature: 0.5 });
};

// ─── Quiz Generation ─────────────────────────────────────────
const generateQuiz = async (text, questionCount = 10) => {
  const truncatedText = text.slice(0, 10000);

  const messages = [
    {
      role: "system",
      content: `You are an expert quiz creator. Generate exactly ${questionCount} multiple choice questions from the provided text.
Return ONLY a valid JSON array with this exact structure, no other text:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Brief explanation of why this answer is correct"
  }
]
Rules:
- correctAnswer is the INDEX (0-3) of the correct option
- Each question must have exactly 4 options
- Questions should test understanding, not just memorization
- Vary difficulty: include easy, medium, and hard questions
- Explanations should be 1-2 sentences.`,
    },
    {
      role: "user",
      content: `Create ${questionCount} MCQ questions from this content:\n\n${truncatedText}`,
    },
  ];

  const response = await callAI(messages, {
    maxTokens: 4000,
    temperature: 0.6,
  });

  const cleaned = response
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();

  let questions;
  try {
    questions = JSON.parse(cleaned);
  } catch (e) {
    throw new Error("Failed to parse quiz response from AI. Please try again.");
  }

  if (!Array.isArray(questions)) {
    throw new Error("Invalid quiz format from AI");
  }

  return questions.slice(0, questionCount).map((q) => ({
    question: q.question,
    options: q.options,
    correctAnswer: Number(q.correctAnswer),
    explanation: q.explanation || "",
  }));
};

// ─── Chat With PDF ─────────────────────────────────────────
const chatWithPDF = async (question, pdfText, chatHistory = []) => {
  const truncatedText = pdfText.slice(0, 10000);

  const historyMessages = chatHistory.slice(-6).map((msg) => ({
    role: msg.role,
    content: msg.content,
  }));

  const messages = [
    {
      role: "system",
      content: `You are a helpful study assistant. Answer questions ONLY based on the provided document content.
If the answer is not found in the document, clearly state: "I couldn't find information about that in this document."
Be concise, accurate, and helpful. Reference specific parts of the document when possible.
Document Content:
---
${truncatedText}
---`,
    },
    ...historyMessages,
    { role: "user", content: question },
  ];

  return callAI(messages, { maxTokens: 1000, temperature: 0.4 });
};

module.exports = {
  callAI,
  generateNotes,
  generateQuiz,
  chatWithPDF,
};