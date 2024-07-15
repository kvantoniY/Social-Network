import axiosInstance from "@/utils/axiosInstance";

export const fetchLikesAPI = async (postId: number) => {
    const response = await axiosInstance.get(`/likes/${postId}`);
    return response.data;
  };
export const createLikeAPI = async (postId: number) => {
  const response = await axiosInstance.post(`/likes/${postId}`);
  return response.data;
};

export const deleteLikeAPI = async (postId: number) => {
  const response = await axiosInstance.delete(`/likes/${postId}`);
  return response.data;
};