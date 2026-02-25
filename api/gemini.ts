import apiClient from "./client";
import { Course } from "./course";

export const getAiRecommendations = async (prompt: string): Promise<Course[]> => {
    try {
        const response = await apiClient.post("/gemini/recommend", { prompt });
        return response.data.recommendations || [];
    } catch (error) {
        console.error("AI Recommendation Error:", error);
        return [];
    }
};
