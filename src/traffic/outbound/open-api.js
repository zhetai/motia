import "dotenv/config";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function runChatCompletion(messages, options = {}) {
  const response = await client.chat.completions.create({
    model: options.model || "gpt-3.5-turbo",
    messages,
    max_tokens: options.max_tokens || 600,
    temperature: options.temperature ?? 0,
  });

  return response;
}
