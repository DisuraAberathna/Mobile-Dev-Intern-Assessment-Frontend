import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const getBaseUrl = () => {
    return process.env.EXPO_PUBLIC_API_URL;
};

const apiClient = axios.create({
    baseURL: getBaseUrl(),
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
    validateStatus: () => true,
});

apiClient.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem("userToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        return Promise.resolve(error.response || {
            status: 500,
            data: { message: error.message || "Network error occurred." },
        });
    }
);

export default apiClient;
