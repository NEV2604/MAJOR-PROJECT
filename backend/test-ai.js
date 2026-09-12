import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

try {
  const response = await ai.models.generateContent({
    model: "gemini-3.7-flash",
    contents: "Say hello to CAPIVORA in one short sentence.",
  });

  console.log("GEMINI RESPONSE:");
  console.log(response.text);
} catch (error) {
  console.error("GEMINI ERROR:");
  console.error(error);
}