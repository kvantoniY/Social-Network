// src/features/posts/postsAPI.ts
import axiosInstance from '../../utils/axiosInstance';

export const fetchPostsAPI = async () => {
  const response = await axiosInstance.get('/posts');
  return response.data;
};
export const fetchUserPostsAPI = async (userId: number) => {
  const response = await axiosInstance.get(`/posts/getUserPosts/${userId}`);
  return response.data;
};

export const createPostAPI = async (formData: FormData) => {
  const response = await axiosInstance.post('/posts/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data;
};

export const deletePostAPI = async (postId: number) => {
  const response = await axiosInstance.delete(`/posts/${postId}`);
  return response.data;
};

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
export const fetchCommentsAPI = async (postId: number) => {
  const response = await axiosInstance.get(`/comments/${postId}`);
  return response.data;
};
export const fetchLastCommentAPI = async (postId: number) => {
  const response = await axiosInstance.get(`/comments/fetchLastComment/${postId}`);
  return response.data;
};
export const createCommentAPI = async (postId: number, commentText: string) => {
const response = await axiosInstance.post(`/comments/${postId}`, {commentText});
return response.data;
};

export const deleteCommentAPI = async (postId: number, commentId: number) => {
  const response = await axiosInstance.delete(`/comments/${commentId}?postId=${postId}`);
return response.data;
};