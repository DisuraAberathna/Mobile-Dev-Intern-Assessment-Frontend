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
    const response = await client.get("/course");
    if (response.status !== 200) return [];
    return response.data.courses || [];
};

export const getCourseById = async (id: string): Promise<Course | null> => {
    const response = await client.get(`/course/${id}`);
    if (response.status !== 200) return null;
    return response.data.course;
};

export const enrollInCourse = async (id: string): Promise<any> => {
    const response = await client.post(`/course/${id}/enroll`);
    return response.data;
};

export const getEnrolledCourses = async (): Promise<Course[]> => {
    const response = await client.get("/course/my-enrolled");
    if (response.status !== 200) return [];
    return response.data.enrolledCourses || [];
};

export const getInstructorCourses = async (): Promise<Course[]> => {
    const response = await client.get("/course/instructor/my-courses");
    if (response.status !== 200) return [];
    return response.data.courses || [];
};

export const createCourse = async (courseData: {
    title: string;
    description: string;
    content: string;
}): Promise<any> => {
    const response = await client.post("/course", courseData);
    return response.data;
};

export const updateCourse = async (id: string, courseData: {
    title: string;
    description: string;
    content: string;
}): Promise<any> => {
    const response = await client.put(`/course/${id}`, courseData);
    return response.data;
};

export const deleteCourse = async (id: string): Promise<any> => {
    const response = await client.delete(`/course/${id}`);
    return response.data;
};
