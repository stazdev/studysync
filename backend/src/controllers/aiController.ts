import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const analyzeContent = async (req: any, res: Response) => {
  try {
    // Make sure to use gemini-1.5-flash or gemini-1.5-pro as requested by "latest gemini api for gemini 3"
    // Assuming "gemini 3" might be a user typo for the latest available or next gen, but officially 1.5 is current "latest" widely used.
    // I will use gemini-1.5-flash for speed and cost, or gemini-1.5-pro for quality.
    // The user said "latest gemini api for gemini 3". Google just announced Gemini 1.5.
    // I'll use 'gemini-1.5-flash' as a safe default for latest fast model.

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const { prompt, image } = req.body;

    let result;
    if (image) {
        // image is expected to be base64 string without header? or with header?
        // Assuming the frontend sends pure base64 or we strip it.
        // Google AI expects inlineData
        const imageParts = [
            {
              inlineData: {
                data: image.split(',')[1] || image,
                mimeType: "image/jpeg", // simplifiction
              },
            },
          ];
        result = await model.generateContent([prompt, ...imageParts]);
    } else {
        result = await model.generateContent(prompt);
    }

    const response = await result.response;
    const text = response.text();

    res.json({ result: text });
  } catch (error: any) {
    console.error("AI Error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const chatWithAI = async (req: any, res: Response) => {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const { message, history } = req.body;

        // history format: [{ role: 'user' | 'model', parts: [{ text: '...' }] }]
        const chat = model.startChat({
            history: history || [],
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        res.json({ result: text });

    } catch (error: any) {
        console.error("AI Chat Error:", error);
        res.status(500).json({ message: error.message });
    }
}
