import apiClient from "./client";
import { Course } from "./course";

export const getAiRecommendations = async (prompt: string): Promise<any> => {
    const response = await apiClient.post("/gemini/recommend", { prompt });
    return response.data;
};

