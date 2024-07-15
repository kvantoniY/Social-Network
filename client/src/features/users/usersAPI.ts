import axiosInstance from "@/utils/axiosInstance";

export const fetchUserAPI = async (userId: number) => {
    const response = await axiosInstance.get(`/users/${userId}`);
    return response.data;
  };