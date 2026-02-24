import apiClient from "./client";

export const login = async (username: string, password: string) => {
    try {
        const response = await apiClient.post("/auth/login", {
            username,
            password,
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const register = async (userData: any) => {
    try {
        const response = await apiClient.post("/auth/register", userData);
        return response.data;
    } catch (error) {
        throw error;
    }
};
