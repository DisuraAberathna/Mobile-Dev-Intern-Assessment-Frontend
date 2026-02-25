import apiClient from "./client";

export const login = async (username: string, password: string) => {
    const response = await apiClient.post("/auth/login", {
        username,
        password,
    });
    return response.data;
};

export const register = async (userData: any) => {
    const response = await apiClient.post("/auth/register", userData);
    return response.data;
};

export const getProfile = async () => {
    const response = await apiClient.get("/auth/profile");
    if (response.status !== 200) return null;
    return response.data.user;
};
