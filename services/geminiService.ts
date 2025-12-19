import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ItineraryDay, PackingCategory, Phrase, FoodItem } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const MODEL_NAME = "gemini-3-flash-preview";

// Helper to parse JSON from Markdown code blocks if necessary
const parseResponse = (text: string): any => {
  try {
    return JSON.parse(text);
  } catch (e) {
    const match = text.match(/```json\n([\s\S]*?)\n```/);
    if (match && match[1]) {
      return JSON.parse(match[1]);
    }
    throw new Error("Failed to parse JSON response");
  }
};

// --- Itinerary Generation ---

const itinerarySchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      day: { type: Type.INTEGER },
      theme: { type: Type.STRING },
      activities: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            time: { type: Type.STRING },
            activity: { type: Type.STRING },
            description: { type: Type.STRING },
            location: { type: Type.STRING },
          },
          required: ["time", "activity", "description", "location"]
        }
      }
    },
    required: ["day", "theme", "activities"]
  }
};

export const generateItinerary = async (destination: string, days: number, budget: string, interests: string): Promise<ItineraryDay[]> => {
  const prompt = `請為我規劃一個 ${days} 天的 ${destination} 旅遊行程。
  預算等級：${budget}。
  興趣偏好：${interests}。
  請使用繁體中文（台灣用語）回覆。
  Return a valid JSON array matching the schema.`;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: itinerarySchema,
    }
  });

  return parseResponse(response.text);
};

// --- Packing List Generation ---

const packingSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      category: { type: Type.STRING },
      items: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    },
    required: ["category", "items"]
  }
};

export const generatePackingList = async (destination: string, season: string, tripType: string, duration: number): Promise<PackingCategory[]> => {
  const prompt = `請為我建立一份前往 ${destination} 的打包清單。
  季節：${season}。
  旅遊類型：${tripType}。
  天數：${duration} 天。
  請將物品分類（例如：衣物、電子產品、盥洗用品等）。
  請使用繁體中文（台灣用語）回覆。`;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: packingSchema,
    }
  });

  return parseResponse(response.text);
};

// --- Phrasebook Generation ---

const phraseSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      original: { type: Type.STRING, description: "The phrase in the local language script" },
      pronunciation: { type: Type.STRING, description: "Phonetic pronunciation" },
      translation: { type: Type.STRING, description: "Chinese translation" },
      usageContext: { type: Type.STRING, description: "When to use this phrase (in Chinese)" }
    },
    required: ["original", "pronunciation", "translation", "usageContext"]
  }
};

export const generatePhrases = async (country: string, language?: string): Promise<Phrase[]> => {
  const langText = language ? `說 ${language}` : `當地語言`;
  const prompt = `請列出 10 句前往 ${country} 旅遊的必備實用短句（${langText}）。
  包含問候、問路、點餐和緊急狀況。
  請使用繁體中文（台灣用語）作為翻譯和情境說明。`;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: phraseSchema,
    }
  });

  return parseResponse(response.text);
};

// --- Food Recommendations ---

const foodSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING },
      description: { type: Type.STRING, description: "Description in Traditional Chinese" },
      priceRange: { type: Type.STRING, description: "Price range in local currency or general terms" },
      bestPlaceToTry: { type: Type.STRING, description: "Type of establishment (e.g., Street Stall, Fine Dining) in Traditional Chinese" }
    },
    required: ["name", "description", "priceRange", "bestPlaceToTry"]
  }
};

export const generateFoodRecs = async (location: string, cuisineType: string): Promise<FoodItem[]> => {
  const prompt = `請推薦 5 道 ${location} 的必吃美食或料理。
  重點關注：${cuisineType || "當地道地"} 料理。
  請使用繁體中文（台灣用語）撰寫描述和推薦地點類型。`;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: foodSchema,
    }
  });

  return parseResponse(response.text);
};
