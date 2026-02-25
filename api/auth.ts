import apiClient from "./client";

export const login = async (username: string, password: string) => {
    try {
        const response = await apiClient.post("/auth/login", {
            username,
            password,
        });
        return response.data;
    } catch (error: any) {
        return error.response?.data || { message: "Network error occurred." };
    }
};

export const register = async (userData: any) => {
    try {
        const response = await apiClient.post("/auth/register", userData);
        return response.data;
    } catch (error: any) {
        return error.response?.data || { message: "Network error occurred." };
    }
};

export const getProfile = async () => {
    try {
        const response = await apiClient.get("/auth/profile");
        if (response.status !== 200) return null;
        return response.data.user;
    } catch (error: any) {
        return null;
    }
};
