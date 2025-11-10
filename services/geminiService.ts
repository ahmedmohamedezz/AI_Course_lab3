import { GoogleGenAI, Modality, FunctionDeclaration, Type, Content } from "@google/genai";
import { ResultData, ChatMessage } from '../types';
import { fileToBase64, readFileAsText } from '../utils/fileUtils';

const apiKey = process.env.API_KEY;
if (!apiKey) {
    throw new Error("API_KEY environment variable not set.");
}
const ai = new GoogleGenAI({ apiKey });

export const generateImage = async (prompt: string): Promise<ResultData> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: prompt }],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                return { type: 'image', content: base64ImageBytes };
            }
        }
        throw new Error("No image was generated. The response may have been blocked.");
    } catch (error) {
        console.error("Image generation failed:", error);
        throw new Error("Failed to generate image. Please check the prompt or API configuration.");
    }
};

export const getVisionResponse = async (prompt: string, imageFile: File): Promise<ResultData> => {
    try {
        const base64Image = await fileToBase64(imageFile);
        const imagePart = {
            inlineData: {
                mimeType: imageFile.type,
                data: base64Image,
            },
        };
        const textPart = { text: prompt };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
        });

        return { type: 'text', content: response.text };
    } catch (error) {
        console.error("Vision analysis failed:", error);
        throw new Error("Failed to analyze image. The file might be corrupted or in an unsupported format.");
    }
};

export const chatWithFile = async (prompt: string, textFile: File): Promise<ResultData> => {
    try {
        const fileContent = await readFileAsText(textFile);
        const fullPrompt = `
CONTEXT from the file "${textFile.name}":
---
${fileContent}
---

Based on the context above, answer the following question:
${prompt}
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt,
        });

        return { type: 'text', content: response.text };
    } catch (error) {
        console.error("Chat with file failed:", error);
        throw new Error("Failed to process the file. Please ensure it's a valid text file.");
    }
};

export const runAgentInteraction = async (prompt: string): Promise<ChatMessage> => {
    const setReminderFunction: FunctionDeclaration = {
        name: 'setReminder',
        parameters: {
            type: Type.OBJECT,
            description: 'Sets a reminder for the user.',
            properties: {
                task: {
                    type: Type.STRING,
                    description: 'The task to be reminded of. e.g., "Call the doctor"',
                },
                datetime: {
                    type: Type.STRING,
                    description: 'The date and time for the reminder in ISO 8601 format. e.g., "2024-08-15T10:00:00"',
                },
            },
            required: ['task', 'datetime'],
        },
    };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{ functionDeclarations: [setReminderFunction] }],
            },
        });

        if (response.functionCalls && response.functionCalls.length > 0) {
            const fc = response.functionCalls[0];
            if (fc.name === 'setReminder') {
                const { task, datetime } = fc.args;
                // In a real app, you would schedule a notification or save this to a database.
                // Here, we just confirm it back to the user.
                const readableDate = new Date(datetime).toLocaleString();
                return { role: 'model', content: `OK! I've set a reminder for you to "${task}" on ${readableDate}.` };
            }
        }
        
        // If no function call, return the text response
        return { role: 'model', content: response.text };

    } catch (error) {
        console.error("Agent interaction failed:", error);
        throw new Error("The agent failed to process your request.");
    }
};


export const chatWithFineTunedModel = async (prompt: string, history: ChatMessage[]): Promise<ChatMessage> => {
    // NOTE: 'models/my-custom-brand-bot-001' is a placeholder. 
    // In a real application, you would replace this with the actual name 
    // of your fine-tuned model provided by Google.
    const fineTunedModelName = 'gemini-2.5-flash'; // Using a base model as a stand-in
    
    // Convert our app's chat history format to the format Gemini expects
    const geminiHistory: Content[] = history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }],
    }));

    try {
        const response = await ai.models.generateContent({
            model: fineTunedModelName,
            contents: [...geminiHistory, { role: 'user', parts: [{text: prompt}]}],
            config: {
                systemInstruction: "You are a friendly, enthusiastic, and helpful brand ambassador for 'Innovate Inc.', a cutting-edge tech company. Always be positive and encouraging.",
            },
        });

        return { role: 'model', content: response.text };
    } catch (error) {
        console.error("Fine-tuned model chat failed:", error);
        throw new Error("Failed to get a response from the custom model.");
    }
};
