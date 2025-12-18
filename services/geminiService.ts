
import { GoogleGenAI, Type } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateStudyRoadmap = async (syllabus: string, examDate: string, samplePaperText?: string) => {
  const ai = getAI();
  
  const samplePaperContext = samplePaperText 
    ? `\n\nI have also provided a SAMPLE PAPER/PAST QUESTIONS for reference. Please analyze the style, difficulty, and recurring topics in these questions to prioritize the roadmap accordingly:\n${samplePaperText}`
    : "";

  const prompt = `
    As an expert academic advisor, create a structured, day-by-day study roadmap for the following syllabus:
    
    SYLLABUS:
    ${syllabus}
    
    EXAM DATE: ${examDate}
    TODAY'S DATE: ${new Date().toLocaleDateString()}
    ${samplePaperContext}
    
    Instructions:
    1. Organize the schedule by days.
    2. Provide a short summary of the plan.
    3. Return a list of specific tasks/topics for each day until the exam date.
    4. Ensure the tasks are actionable and realistic.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            tasks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  day: { type: Type.INTEGER },
                  label: { type: Type.STRING },
                  description: { type: Type.STRING }
                },
                required: ["id", "day", "label", "description"]
              }
            }
          },
          required: ["title", "summary", "tasks"]
        }
      }
    });
    
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Error generating roadmap:", error);
    throw error;
  }
};

export const generateSubjectImage = async (subjectTitle: string): Promise<string | undefined> => {
  const ai = getAI();
  const prompt = `A clean, professional, and artistic 3D illustration or icon representing the academic subject: "${subjectTitle}". Minimalist style, vibrant colors, educational theme, high quality.`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return undefined;
  } catch (error) {
    console.error("Error generating subject image:", error);
    return undefined;
  }
};

export const generateQuiz = async (topic: string, referenceText?: string) => {
  const ai = getAI();
  
  const referencePrompt = referenceText 
    ? `Use the following reference material (past papers/notes) to influence the difficulty and style of the questions: \n\n REFERENCE MATERIAL:\n${referenceText}`
    : "";

  const prompt = `
    Create a quiz with 5 multiple-choice questions about "${topic}".
    ${referencePrompt}
    Ensure the questions are challenging and relevant.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.INTEGER },
              question: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              correctAnswer: { 
                type: Type.INTEGER,
                description: "0-indexed index of the correct option"
              }
            },
            required: ["id", "question", "options", "correctAnswer"]
          }
        }
      }
    });
    
    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("Error generating quiz:", error);
    throw error;
  }
};
