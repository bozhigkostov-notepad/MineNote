
import { GoogleGenAI, Type } from "@google/genai";
import { AIResponse, Note } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const enchantNote = async (content: string, action: 'summarize' | 'expand' | 'fix'): Promise<AIResponse> => {
  const model = action === 'summarize' ? 'gemini-3-flash-preview' : 'gemini-3-pro-preview';
  
  const systemInstruction = `You are a Minecraft Enchanting Table. Your job is to "enchant" the user's notes.
  - Summarize: Condense the text into brief bullet points.
  - Expand: Add more detail and flourish to the ideas.
  - Fix: Correct grammar and improve clarity.
  Always return the output in JSON format with 'content' and 'suggestedTitle' keys.`;

  const prompt = `Perform the '${action}' action on the following text: "${content}"`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            content: { type: Type.STRING },
            suggestedTitle: { type: Type.STRING },
          },
          required: ["content"]
        }
      }
    });

    return JSON.parse(response.text.trim());
  } catch (error) {
    console.error("Enchanting failed:", error);
    throw error;
  }
};

export const synthesizeNotes = async (notes: Note[]): Promise<AIResponse> => {
  const model = 'gemini-3-pro-preview';
  const systemInstruction = `You are a Master Librarian at a Minecraft Crafting Table. 
  You take several separate notes and combine them into one master document.
  Ensure the result flows well, resolves contradictions, and is well-organized.
  Return a JSON with 'content' and a grand 'suggestedTitle'.`;

  const prompt = `Synthesize the following notes into one cohesive document:\n\n` + 
    notes.map((n, i) => `Note ${i+1} (${n.title}):\n${n.content}`).join('\n\n---\n\n');

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            content: { type: Type.STRING },
            suggestedTitle: { type: Type.STRING },
          },
          required: ["content", "suggestedTitle"]
        }
      }
    });

    return JSON.parse(response.text.trim());
  } catch (error) {
    console.error("Synthesis failed:", error);
    throw error;
  }
};
