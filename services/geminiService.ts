
import { GoogleGenAI, Type } from "@google/genai";

export const getAIPalette = async (prompt: string): Promise<string[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate a professional 5-color palette based on this description: "${prompt}". Return ONLY the hex codes in a JSON array.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          palette: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "An array of 5 hex color strings."
          },
          themeName: { type: Type.STRING }
        },
        required: ["palette"]
      }
    }
  });

  try {
    const data = JSON.parse(response.text);
    return data.palette;
  } catch (error) {
    console.error("Failed to parse AI response", error);
    return [];
  }
};
