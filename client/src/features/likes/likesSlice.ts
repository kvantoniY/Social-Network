// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import { createLikeAPI, deleteLikeAPI, fetchLikesAPI } from './likesAPI';
// import { updatePostLikes } from '../posts/postsSlice';

// interface Like {
//   id: number;
//   postId: string;
//   userId: number;
// }

// interface LikesState {
//   likes: Like[];
//   status: 'idle' | 'loading' | 'succeeded' | 'failed';
//   error: string | null;
// }

// const initialState: LikesState = {
//   likes: [],
//   status: 'idle',
//   error: null,
// };

// export const fetchLikes = createAsyncThunk('likes/fetchLikes', async (postId: number, { dispatch }) => {
//   const response = await fetchLikesAPI(postId);
//   dispatch(updatePostLikes({ postId, like: response.likes }));
//   return response
// });

// export const createLike = createAsyncThunk('likes/createLike', async (postId: number, { dispatch }) => {
//   const response = await createLikeAPI(postId);
//   dispatch(updatePostLikes({ postId, like: response }));
//   return response;
// });

// export const deleteLike = createAsyncThunk('likes/deleteLike', async (postId: number, { dispatch }) => {
//   const response = await deleteLikeAPI(postId);
//   dispatch(updatePostLikes({ postId, like: null }));
//   return response;
// });

// const likesSlice = createSlice({
//   name: 'likes',
//   initialState,
//   reducers: {},
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchLikes.pending, (state) => {
//         state.status = 'loading';
//       })
//       .addCase(fetchLikes.fulfilled, (state, action) => {
//         state.status = 'succeeded';
//         state.likes = action.payload.likes;
//       })
//       .addCase(fetchLikes.rejected, (state, action) => {
//         state.status = 'failed';
//         state.error = action.error.message || null;
//       })
//       .addCase(createLike.pending, (state) => {
//         state.status = 'loading';
//       })
//       .addCase(createLike.fulfilled, (state, action) => {
//         state.status = 'succeeded';
//         state.likes.push(action.payload);
//       })
//       .addCase(createLike.rejected, (state, action) => {
//         state.status = 'failed';
//         state.error = action.error.message || null;
//       })
//       .addCase(deleteLike.pending, (state) => {
//         state.status = 'loading';
//       })
//       .addCase(deleteLike.fulfilled, (state, action) => {
//         state.status = 'succeeded';
//         state.likes = state.likes.filter(like => like.id !== action.payload.id);
//       })
//       .addCase(deleteLike.rejected, (state, action) => {
//         state.status = 'failed';
//         state.error = action.error.message || null;
//       });
//   },
// });

// export default likesSlice.reducer;
