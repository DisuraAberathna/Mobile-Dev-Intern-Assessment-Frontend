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
        return response.data.courses || [];
    } catch (error) {
        console.error("Fetch all courses error:", error);
        return [];
    }
};

export const getCourseById = async (id: string): Promise<Course | null> => {
    try {
        const response = await client.get(`/course/${id}`);
        return response.data.course;
    } catch (error) {
        console.error(`Fetch course ${id} error:`, error);
        return null;
    }
};

export const enrollInCourse = async (id: string): Promise<Course | null> => {
    try {
        const response = await client.post(`/course/${id}/enroll`);
        return response.data.course;
    } catch (error) {
        console.error(`Enroll course ${id} error:`, error);
        return null;
    }
};

export const getEnrolledCourses = async (): Promise<Course[]> => {
    try {
        const response = await client.get("/course/my-enrolled");
        return response.data.enrolledCourses || [];
    } catch (error) {
        console.error("Fetch enrolled courses error:", error);
        return [];
    }
};
