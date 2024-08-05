import axiosInstance from "@/utils/axiosInstance";

export const fetchUserAPI = async (userId: number) => {
    const response = await axiosInstance.get(`/users/${userId}`);
    return response.data;
  };
export const CheckBlackListAPI = async (userId: number) => {
  const response = await axiosInstance.get(`/users/checkBlackList/${userId}`)
  return response.data;
}
export const AddBlackListAPI = async (userId: number) => {
  const response = await axiosInstance.post(`/users/addBlackList/${userId}`)
  return response.data;
}
export const DeleteBlackListAPI = async (userId: number) => {
  const response = await axiosInstance.delete(`/users/deleteBlackList/${userId}`)
  return response.data;
}