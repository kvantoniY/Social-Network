// src/features/posts/postsAPI.ts
import axiosInstance from '../../utils/axiosInstance';
import { User, UserBlackList, Post } from '@/types/types';
export const fetchPostsAPI = async (currentUserId: number): Promise<Post[]> => {
  try {
    // Получаем посты
    const response = await axiosInstance.get<Post[]>('/posts');
    // Получаем черный список
    const blackListResponse = await axiosInstance.get<UserBlackList[]>('/users/allBlackList');
    const blackList = blackListResponse.data;

    // Извлекаем идентификаторы заблокированных пользователей и тех, кто нас заблокировал
    const blackListedUserIds = blackList
      .filter(user => user.userId === currentUserId || user.blUserId === currentUserId)
      .map(user => user.userId === currentUserId ? user.blUserId : user.userId);

    // Фильтруем посты, исключая те, которые принадлежат заблокированным пользователям или тем, кто нас заблокировал
    const filteredPosts = response.data.filter((post: Post) => !blackListedUserIds.includes(post.userId));

    console.log(blackListResponse);
    return filteredPosts;
  } catch (error) {
    console.error('Error fetching posts or black list:', error);
    throw error;
  }
};
export const fetchUserPostsAPI = async (userId: number) => {
  const response = await axiosInstance.get(`/posts/getUserPosts/${userId}`);
  return response.data;
};
export const fetchPostAPI = async (postId: number) => {
  const response = await axiosInstance.get(`/posts/${postId}`);
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

export const fetchLikesCommentAPI = async (commentId: number) => {
  const response = await axiosInstance.get(`/comments/likeComment/${commentId}`);
  return response.data;
};
export const createLikeCommentAPI = async (commentId: number) => {
const response = await axiosInstance.post(`/comments/likeComment/${commentId}`);
return response.data;
};

export const deleteLikeCommentAPI = async (commentId: number) => {
const response = await axiosInstance.delete(`/comments/likeComment/${commentId}`);
return response.data;
};