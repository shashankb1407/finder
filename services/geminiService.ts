
import { GoogleGenAI, Type } from "@google/genai";
import { MissingPerson } from "../types";

/**
 * Senior Frontend Engineer's Note: 
 * To achieve high-accuracy matching across different photos (e.g., different lighting, age, or angles),
 * we must provide the model with the actual visual data for comparison, not just text descriptions.
 * Gemini-3-Pro-Preview is chosen for advanced forensic multi-image reasoning.
 */
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Uses Gemini to compare a sighting photo against the actual reference images of missing persons.
 */
export async function findFaceMatches(sightingPhotoBase64: string, missingPersons: MissingPerson[]) {
  // Only compare against active missing cases that have reference photos
  const candidates = missingPersons
    .filter(p => p.status !== 'Found' && p.photoBase64)
    .slice(0, 15); // Limit to top 15 candidates for performance and token efficiency

  if (candidates.length === 0) return [];

  const sightingData = sightingPhotoBase64.split(',')[1] || sightingPhotoBase64;

  const parts: any[] = [
    {
      text: `You are a Senior Forensic Biometric Analyst. 
      Your task is to identify if the individual in the "EVIDENCE PHOTO" matches any of the "REFERENCE DATABASE" photos.
      
      EVALUATION CRITERIA:
      1. Ignore transient features: Hair style, facial hair, clothing, glasses, and background.
      2. Focus on permanent markers: Bone structure (jawline, brow ridge), eye shape and spacing (interpupillary distance), nasal structure, and ear morphology.
      3. Account for variation: The evidence photo may have different lighting, resolution, or the person may have aged or changed weight.
      4. Threshold: Only return matches with a confidence score above 0.5.
      
      Output strictly as a JSON array of objects with 'id', 'confidence', and 'reason'.`
    },
    {
      inlineData: {
        mimeType: 'image/jpeg',
        data: sightingData
      }
    },
    {
      text: "--- ABOVE IS THE EVIDENCE PHOTO TO BE IDENTIFIED ---"
    }
  ];

  // Inject reference images into the prompt parts
  candidates.forEach((p) => {
    const refData = p.photoBase64.split(',')[1] || p.photoBase64;
    parts.push({
      inlineData: {
        mimeType: 'image/jpeg',
        data: refData
      }
    });
    parts.push({
      text: `REFERENCE FOR CASE ID: ${p.id} (Identity: ${p.fullName}, Age: ${p.age})`
    });
  });

  try {
    // Upgraded to gemini-3-pro-preview for complex forensic multimodal reasoning
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              confidence: { type: Type.NUMBER, description: "Score from 0 to 1 based on biometric match likelihood." },
              reason: { type: Type.STRING, description: "Technical forensic reasoning for the match." }
            },
            required: ['id', 'confidence', 'reason']
          }
        }
      }
    });

    const jsonStr = response.text || '[]';
    return JSON.parse(jsonStr.trim());
  } catch (e) {
    console.error("Forensic analysis failed", e);
    return [];
  }
}
