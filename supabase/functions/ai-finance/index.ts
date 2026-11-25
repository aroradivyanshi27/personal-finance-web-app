// Edge function for OpenAI API communication.
// The OPENAI_API_KEY environment variable is set on the Supabase project.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface FinanceContext {
  transactions: Array<{
    type: string;
    amount: number;
    category: string;
    description: string;
    date: string;
    paymentMethod: string;
  }>;
  budgets: Array<{ category: string; limit: number }>;
  goals: Array<{
    name: string;
    targetAmount: number;
    currentAmount: number;
    targetDate: string;
  }>;
  currency: string;
}

type AIRequest =
  | { action: "chat"; messages: ChatMessage[]; context: FinanceContext }
  | { action: "analyze"; context: FinanceContext }
  | { action: "suggestions"; context: FinanceContext };

const SYSTEM_PROMPT = `You are Paise Kahan Gaye's AI Finance Assistant, a helpful personal finance advisor for Indian users. All amounts are in Indian Rupees (₹).

Your role:
- Answer questions about budgeting, expenses, saving money, and personal finance
- Provide practical, actionable advice tailored to the user's actual spending data
- Be concise, friendly, and specific — reference their real numbers when relevant
- Use Indian financial context (UPI, INR, Indian expense categories)
- If the user's transaction data is empty or sparse, give general advice but note that you'd give better recommendations with more data

Format your responses in clean markdown with short paragraphs and bullet points where helpful. Keep responses focused and under 200 words unless the user asks for detail.`;

const ANALYSIS_PROMPT = `You are a financial analyst reviewing a user's expense data. Analyze the provided transaction data and produce a spending analysis summary.

Your response MUST be a JSON object with this exact structure:
{
  "summary": "2-3 sentence overview of their spending this month",
  "topCategories": [
    { "category": "Category Name", "amount": 1234, "percentage": 25, "insight": "One sentence about this category" }
  ],
  "trends": ["Observation 1", "Observation 2", "Observation 3"],
  "warnings": ["Warning 1 (if any)"],
  "positiveNotes": ["Something they're doing well"]
}

Only include fields that have content. If there's not enough data, still return the JSON with empty arrays and a summary explaining the limitation. Amounts are in INR (₹).`;

const SUGGESTIONS_PROMPT = `You are a savings advisor. Based on the user's actual expense data, generate personalized saving recommendations.

Your response MUST be a JSON object with this exact structure:
{
  "recommendations": [
    {
      "title": "Short title",
      "description": "2-3 sentence explanation",
      "potentialSavings": 1234,
      "category": "Related expense category",
      "priority": "high" | "medium" | "low"
    }
  ],
  "estimatedMonthlySavings": 1234,
  "summary": "One sentence summary of the opportunity"
}

Base recommendations on their actual spending patterns. potentialSavings and estimatedMonthlySavings are in INR (₹). If data is insufficient, return empty recommendations with a summary explaining why.`;

function buildContextString(context: FinanceContext): string {
  const txns = context.transactions.slice(0, 60);
  const txStr = txns
    .map(
      (t) =>
        `${t.date} | ${t.type} | ₹${t.amount} | ${t.category} | ${t.description} | ${t.paymentMethod}`
    )
    .join("\n");

  const budgetStr = context.budgets
    .map((b) => `${b.category}: ₹${b.limit}/month`)
    .join("\n");

  const goalStr = context.goals
    .map(
      (g) =>
        `${g.name}: ₹${g.currentAmount}/₹${g.targetAmount} by ${g.targetDate}`
    )
    .join("\n");

  return `USER'S FINANCIAL DATA (currency: ${context.currency}):
Transactions (most recent first, max 60):
${txStr || "No transactions yet"}

Budgets:
${budgetStr || "No budgets set"}

Savings Goals:
${goalStr || "No goals set"}`;
}

async function callOpenAI(
  prompt: string,
  context: FinanceContext,
  userMessages: ChatMessage[] | null,
  jsonMode: boolean
) {
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) {
    throw new Error("OpenAI API key is not configured. Set OPENAI_API_KEY environment variable.");
  }

  const contextStr = buildContextString(context);

  const input: Array<Record<string, unknown>> = [
    { role: "developer", content: prompt },
    { role: "developer", content: `Here is the user's current financial data:\n\n${contextStr}` },
  ];

  if (userMessages) {
    for (const m of userMessages) {
      input.push({ role: m.role, content: m.content });
    }
  } else {
    input.push({ role: "user", content: jsonMode ? "Please analyze the data and respond." : "Please help me with my finances." });
  }

  const body: Record<string, unknown> = {
    model: "gpt-4.1-mini",
    input,
  };

  if (jsonMode) {
    body.text = { format: { type: "json_object" } };
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const outputText = data.output_text ?? data.output?.[0]?.content?.[0]?.text ?? "";

  if (!outputText) {
    throw new Error("OpenAI returned an empty response.");
  }

  return outputText;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as AIRequest;
    const { action, context } = body;

    if (!action || !context) {
      return new Response(
        JSON.stringify({ error: "Missing 'action' or 'context' in request body." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let result: string;

    if (action === "chat") {
      if (!body.messages || !Array.isArray(body.messages)) {
        return new Response(
          JSON.stringify({ error: "Missing 'messages' array for chat action." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      result = await callOpenAI(SYSTEM_PROMPT, context, body.messages, false);
    } else if (action === "analyze") {
      result = await callOpenAI(ANALYSIS_PROMPT, context, null, true);
    } else if (action === "suggestions") {
      result = await callOpenAI(SUGGESTIONS_PROMPT, context, null, true);
    } else {
      return new Response(
        JSON.stringify({ error: `Unknown action: ${action}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "An unexpected error occurred.";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
