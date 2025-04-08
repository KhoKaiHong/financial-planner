import { GoogleGenAI, Type } from "@google/genai";
import { adminAuth } from "~/firebaseAdminConfig";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export type RestaurantReviewBody = {
  name: string;
  types: string[];
  reviews: {
    rating: number;
    text: string;
  }[];
}[];

export type aiRestaurantResponse = {
  name: string;
  restaurantType: string;
  reviewSummary: string;
  foodRecommendation: string;
}[];

export async function POST(request: Request) {
  try {
    const idToken = request.headers.get("Authorization")?.split("Bearer ")[1];
    if (!idToken) {
      return new Response(
        "Unauthorized: Missing or invalid authorization header",
        { status: 401 }
      );
    }

    try {
      await adminAuth.verifyIdToken(idToken);
    } catch (error) {
      return new Response("Unauthorized: Invalid token", { status: 401 });
    }

    const restaurantReviews: RestaurantReviewBody = await request.json();

    if (!restaurantReviews) {
      return new Response("No content provided", { status: 400 });
    }

    const aiResult = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: JSON.stringify(restaurantReviews),
      config: {
        systemInstruction:
          "Based on the restaurants, types and reviews provided, summarise in the format provided. ",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: {
                type: Type.STRING,
                description:
                  "Name of the restaurant, keep it the same as the name supplied.",
                nullable: false,
              },
              restaurantType: {
                type: Type.STRING,
                description:
                  "Type of cuisine or restaurant style based on the types and reviews provided.",
                minLength: "15",
                maxLength: "25",
                nullable: false,
              },
              reviewSummary: {
                type: Type.STRING,
                description:
                  "Short summary based on customer reviews in a sentence.",
                maxLength: "80",
                nullable: false,
              },
              foodRecommendation: {
                type: Type.STRING,
                description: "Recommended dishes based on reviews.",
                maxLength: "50",
                nullable: false,
              },
            },
            required: [
              "name",
              "restaurantType",
              "reviewSummary",
              "foodRecommendation",
            ],
          },
        },
      },
    });

    return new Response(aiResult.text, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("API error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
