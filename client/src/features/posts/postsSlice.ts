import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchPostsAPI, createPostAPI, fetchUserPostsAPI, deletePostAPI, createLikeAPI, deleteLikeAPI, fetchLikesAPI, createCommentAPI, deleteCommentAPI, fetchCommentsAPI, fetchLastCommentAPI, createLikeCommentAPI, deleteLikeCommentAPI } from './postsAPI';

import { Post, User, Comment, Like } from '../../types/types';

interface PostsState {
  posts: Post[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: PostsState = {
  posts: [],
  status: 'idle',
  error: null,
};

// Posts
// Поиск всех постов
export const fetchPosts = createAsyncThunk('posts/fetchPosts', async (currentUserId: number) => {
  return await fetchPostsAPI(currentUserId);
});
// Поиск постов определенного пользователя
export const fetchUserPosts = createAsyncThunk('posts/fetchUserPosts', async (userId: number) => {
  return await fetchUserPostsAPI(userId);
});
// Создание поста
export const createPost = createAsyncThunk('posts/createPost', async (formData: FormData) => {
  return await createPostAPI(formData);
});
// Удаление поста
export const deletePost = createAsyncThunk('posts/deletePost', async (postId: number) => {
  return await deletePostAPI(postId);
});

// Likes
// Создание лайка
export const createLike = createAsyncThunk('posts/createLike', async (postId: number) => {
  const response = await createLikeAPI(postId);
  return response
});
// Удаление лайка
export const deleteLike = createAsyncThunk('posts/deleteLike', async (postId: number) => {
  const response = await deleteLikeAPI(postId);
  return response
});

// Comments
// Создание коммента
export const createComment = createAsyncThunk('posts/createComment', async ({ postId, commentText }: { postId: number; commentText: string }) => {
  const response = await createCommentAPI(postId, commentText);
  return response
});
// Удаление коммента
export const deleteComment = createAsyncThunk('posts/deleteComment', async ({ postId, commentId }: { postId: number; commentId: number }) => {
  const response = await deleteCommentAPI(postId, commentId);
  return response
});
// Создание лайка
export const createLikeComment = createAsyncThunk('posts/createLikeComment', async (commentId: number) => {
  const response = await createLikeCommentAPI(commentId);
  return response
});
// Удаление лайка
export const deleteLikeComment = createAsyncThunk('posts/deleteLikeComment', async (commentId: number) => {
  const response = await deleteLikeCommentAPI(commentId);
  return response
});


const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
    // Поиск постов
      .addCase(fetchPosts.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.posts = action.payload;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      })

     // Поиск постов пользователя
      .addCase(fetchUserPosts.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUserPosts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.posts = action.payload;
      })
      .addCase(fetchUserPosts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      })

      // Создание поста
      .addCase(createPost.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.posts.unshift(action.payload);
      })
      .addCase(createPost.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      })
      
      // Удаление поста
      .addCase(deletePost.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.posts = state.posts.filter(post => post.id !== action.payload.id);
      })
      .addCase(deletePost.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      })

      // Создание лайка
      .addCase(createLike.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createLike.fulfilled, (state, action: any) => {
        state.status = 'succeeded';
        const { postId, like } = action.payload;
          const post = state.posts.find(post => post.id == postId);
        if (post) {
          post.Likes.push(like)
          post.likeStatus = true;
        } 
      })
      .addCase(createLike.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      })

      // Удаление лайка
      .addCase(deleteLike.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteLike.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const { postId, userId } = action.payload; 
        const post = state.posts.find(post => post.id == postId);
        if (post) {
          post.Likes = post.Likes.filter(like => like.userId !== userId);
          post.likeStatus = false;
        }
      })
      .addCase(deleteLike.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      })

      // Создание коммента
      .addCase(createComment.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createComment.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const { postId, comment } = action.payload;
          const post = state.posts.find(post => post.id == postId);
        if (post) {
          post.Comments.push(comment)
        } 
      })
      .addCase(createComment.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      })

      // Удаление коммента
      .addCase(deleteComment.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const commentId = action.payload.comment.id; 
        const { postId } = action.payload;
        const post = state.posts.find(post => post.id == postId);
        if (post) {
          post.Comments = post.Comments.filter(comment => comment.id !== commentId);
        };
      })
      .addCase(deleteComment.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      })

      // Создание лайка
      .addCase(createLikeComment.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createLikeComment.fulfilled, (state, action: any) => {
        state.status = 'succeeded';
        const { commentId, postId, like } = action.payload;
          const post = state.posts.find(post => post.id == postId);
          const comment = post?.Comments.find(comment => comment.id == commentId)
          console.log(comment)
        if (post && comment) {
          console.log("Before pushing like:", comment.LikeComs, comment.likeStatus);
          comment.LikeComs.push(like)
          comment.likeStatus = true;
          console.log("After pushing like:", comment.LikeComs, comment.likeStatus);
        } 
      })
      .addCase(createLikeComment.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      })

      // Удаление лайка
      .addCase(deleteLikeComment.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteLikeComment.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const { commentId, postId, userId } = action.payload; 
        const post = state.posts.find(post => post.id == postId);
        const comment = post?.Comments.find(comment => comment.id == commentId)

        if (post && comment) {
          comment.LikeComs = comment.LikeComs.filter(like => like.userId !== userId);
          comment.likeStatus = false;
        }
      })
      .addCase(deleteLikeComment.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      })
  },
});

export default postsSlice.reducer;
