import { Mistral } from "@mistralai/mistralai";
import { config } from "dotenv";

config();

const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

export const askMistral = async (systemPrompt, userMessage) => {
  const response = await client.chat.complete({
    model: "mistral-small-latest",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    maxTokens: 1024,
  });

  const content = response.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("No response from AI");
  }

  if (typeof content === "string") return content;
  return content.map((block) => block.text).join("\n\n");
};

export default { askMistral };
