import { GoogleGenAI } from "@google/genai";
import { PromptStyle } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

function createSystemInstruction(style: PromptStyle): string {
    let styleDescription = '';
    switch (style) {
        case PromptStyle.CREATIVE:
            styleDescription = 'You are a creative muse, skilled in crafting evocative and imaginative prompts. Your prompts should inspire artistic and unconventional outputs. Use vivid language and sensory details.';
            break;
        case PromptStyle.TECHNICAL:
            styleDescription = 'You are a technical expert, specializing in precise and unambiguous instructions. Your prompts should be structured, clear, and include all necessary constraints and requirements for technical tasks like code generation or data analysis.';
            break;
        case PromptStyle.DETAILED:
        default:
            styleDescription = 'You are an expert prompt engineer. Your goal is to create highly detailed, specific, and well-structured prompts. The prompts should provide extensive context, define the persona, specify the format, and guide the AI to a comprehensive and high-quality response.';
            break;
    }
    return `${styleDescription} Your task is to expand the user's simple idea into a full-fledged prompt based on your persona. Respond ONLY with the generated prompt, without any introductory text, explanation, or conversational filler.`;
}


export async function generatePrompt(idea: string, style: PromptStyle): Promise<string> {
    try {
        const systemInstruction = createSystemInstruction(style);
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: idea,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.8,
                topP: 0.9,
            },
        });
        
        return response.text.trim();

    } catch (error) {
        console.error("Error generating prompt with Gemini API:", error);
        if (error instanceof Error) {
            // More specific error handling could be added here
            if (error.message.includes('API key not valid')) {
                 throw new Error("The provided API key is invalid. Please check your environment configuration.");
            }
        }
        throw new Error("Failed to generate prompt. Please try again later.");
    }
}

export async function generateImage(prompt: string, aspectRatio: string): Promise<string> {
    if (!prompt.trim()) {
        throw new Error("Image prompt cannot be empty.");
    }

    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/jpeg',
              aspectRatio: aspectRatio,
            },
        });

        if (!response.generatedImages || response.generatedImages.length === 0) {
            throw new Error("The model did not generate an image. Try a different prompt.");
        }
        
        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        return `data:image/jpeg;base64,${base64ImageBytes}`;

    } catch (error) {
        console.error("Error generating image with Gemini API:", error);
        if (error instanceof Error) {
            if (error.message.includes('API key not valid')) {
                 throw new Error("The provided API key is invalid. Please check your environment configuration.");
            }
             if (error.message.includes('prompt was blocked')) {
                throw new Error("The prompt was blocked for safety reasons. Please modify your prompt and try again.");
            }
        }
        throw new Error("Failed to generate image. The service may be temporarily unavailable.");
    }
}
