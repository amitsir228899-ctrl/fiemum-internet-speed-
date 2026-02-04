
import { GoogleGenAI, Type } from "@google/genai";
import { SpeedResult, WifiResult, AIAnalysis, MapMarker } from "../types";

export const analyzeResults = async (result: SpeedResult | WifiResult, type: 'internet' | 'wifi'): Promise<AIAnalysis> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = type === 'internet' 
    ? `Analyze these internet speed test results: Download: ${(result as SpeedResult).download.toFixed(2)} Mbps, Upload: ${(result as SpeedResult).upload.toFixed(2)} Mbps, Ping: ${(result as SpeedResult).ping} ms, Jitter: ${(result as SpeedResult).jitter} ms. Provide a status assessment (excellent, good, average, poor), an explanation of what this speed is capable of (e.g. 4K streaming, gaming), and 3 bullet point recommendations for optimization if needed.`
    : `Analyze these WiFi system metrics: Link Speed: ${(result as WifiResult).linkSpeed} Mbps, Signal Strength: ${(result as WifiResult).signalStrength} dBm, Local Latency: ${(result as WifiResult).localLatency} ms. Provide a status assessment (excellent, good, average, poor), explain how the local network environment (distance, walls, interference) might be affecting these metrics, and provide 3 specific technical WiFi optimization tips (e.g., channel switching, placement).`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          status: { type: Type.STRING, description: 'One of: excellent, good, average, poor' },
          explanation: { type: Type.STRING, description: 'Contextual explanation for the user.' },
          recommendations: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'List of actionable advice.'
          }
        },
        required: ['status', 'explanation', 'recommendations']
      }
    }
  });

  try {
    return JSON.parse(response.text || '{}') as AIAnalysis;
  } catch (e) {
    return {
      status: 'average',
      explanation: 'Analysis unavailable, but your results are recorded.',
      recommendations: ['Check your router settings.', 'Contact your ISP if speeds persist.', 'Ensure no background downloads.']
    };
  }
};

export const analyzeCoverage = async (lat: number, lng: number): Promise<{ explanation: string; markers: MapMarker[] }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Find 3-5 nearby locations with excellent public WiFi or known fiber internet hotspots near coordinates ${lat}, ${lng}. Return a JSON with an explanation of coverage in the area and a list of markers with lat, lng, title, type (hotspot, tower, cafe), and description.`,
    config: {
      tools: [{ googleMaps: {} }],
      toolConfig: {
        retrievalConfig: {
          latLng: { latitude: lat, longitude: lng }
        }
      },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          explanation: { type: Type.STRING },
          markers: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                lat: { type: Type.NUMBER },
                lng: { type: Type.NUMBER },
                title: { type: Type.STRING },
                type: { type: Type.STRING },
                description: { type: Type.STRING }
              }
            }
          }
        }
      }
    }
  });

  try {
    return JSON.parse(response.text || '{}');
  } catch (e) {
    return {
      explanation: "Unable to load precise coverage data. Generally, urban areas nearby have strong 5G and fiber availability.",
      markers: []
    };
  }
};
