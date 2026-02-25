import client from "./client";

export interface Course {
    _id: string;
    title: string;
    description: string;
    content: string;
    instructor: {
        _id: string;
        name: string;
    };
    enrolledStudents: any[];
    createdAt: string;
    updatedAt: string;
}

export const getAllCourses = async (): Promise<Course[]> => {
    try {
        const response = await client.get("/course");
        if (response.status !== 200) return [];
        return response.data.courses || [];
    } catch (error) {
        return [];
    }
};

export const getCourseById = async (id: string): Promise<Course | null> => {
    try {
        const response = await client.get(`/course/${id}`);
        if (response.status !== 200) return null;
        return response.data.course;
    } catch (error) {
        return null;
    }
};

export const enrollInCourse = async (id: string): Promise<any> => {
    try {
        const response = await client.post(`/course/${id}/enroll`);
        return response.data;
    } catch (error) {
        return null;
    }
};

export const getEnrolledCourses = async (): Promise<Course[]> => {
    try {
        const response = await client.get("/course/my-enrolled");
        if (response.status !== 200) return [];
        return response.data.enrolledCourses || [];
    } catch (error) {
        return [];
    }
};
