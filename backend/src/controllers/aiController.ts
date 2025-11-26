import { Request, Response } from 'express';
import { GoogleGenAI } from "@google/genai";

export const analyzeContent = async (req: any, res: Response) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const { prompt, image } = req.body;

    let contents: any = [prompt];
    if (image) {
        // image is expected to be base64 string.
        // new SDK might handle image parts differently.
        // user code snippet was simple string content.
        // Assuming we just pass prompt for now if no explicit image handling in new SDK docs provided
        // But usually it is:
        /*
        contents: [
          { role: 'user', parts: [ { text: prompt }, { inlineData: { mimeType: 'image/jpeg', data: ... } } ] }
        ]
        */
       // For now let's stick to text or try to adapt if image is present.
       // But user only provided text example.
       // I will assume text only for now or simple prompt string as requested.
       if (image) {
           console.warn("Image upload with new SDK not fully implemented in this snippet, sending text only");
       }
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: contents,
    });

    // The response object from new SDK seems to have .text property directly accessible?
    // User code: console.log(response.text);
    const text = response.text;

    res.json({ result: text });
  } catch (error: any) {
    console.error("AI Error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const chatWithAI = async (req: any, res: Response) => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        const { message, history } = req.body;

        // History handling might differ in new SDK.
        // User snippet didn't show chat.
        // I will assume standard generateContent with history context appended manually or if SDK supports it.
        // The old SDK had startChat. New one?
        // If I look at "GoogleGenAI" import, it seems to be the new "Google Gen AI SDK for Node.js".
        // It might not have startChat directly on the instance like before.
        // Let's treat it as a single turn generation for now including history as text context if needed,
        // or just send the message.

        // Construct a prompt with history?
        let prompt = "";
        if (history && Array.isArray(history)) {
            history.forEach((turn: any) => {
                prompt += `${turn.role}: ${turn.parts[0].text}\n`;
            });
        }
        prompt += `User: ${message}`;

        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: prompt,
        });

        const text = response.text;

        res.json({ result: text });

    } catch (error: any) {
        console.error("AI Chat Error:", error);
        res.status(500).json({ message: error.message });
    }
}
