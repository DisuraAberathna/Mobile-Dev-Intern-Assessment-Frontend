import apiClient from "./client";
import { Course } from "./course";

export const getAiRecommendations = async (prompt: string): Promise<any> => {
    return await apiClient.post("/gemini/recommend", { prompt });
};

