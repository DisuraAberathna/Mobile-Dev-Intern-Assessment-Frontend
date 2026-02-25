import apiClient from "./client";

export const login = async (username: string, password: string) => {
    try {
        const response = await apiClient.post("/auth/login", {
            username,
            password,
        });
        return response.data;
    } catch (error: any) {
        console.error("Login API Error:", error.response?.data || error.message);
        return error.response?.data || null;
    }
};

export const register = async (userData: any) => {
    try {
        const response = await apiClient.post("/auth/register", userData);
        return response.data;
    } catch (error: any) {
        console.error("Register API Error:", error.response?.data || error.message);
        return error.response?.data || null;
    }
};

export const getProfile = async () => {
    try {
        const response = await apiClient.get("/auth/profile");
        return response.data.user;
    } catch (error: any) {
        console.error("Get Profile API Error:", error.response?.data || error.message);
        return null;
    }
};
