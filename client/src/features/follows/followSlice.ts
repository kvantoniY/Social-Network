import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosInstance';
import { setUserProfile } from '../auth/authSlice';
import { AppDispatch } from '@/store/store';

interface User {
    id: number;
    username: string;
    email: string;
  }

interface Follower {
  id: number;
  username: string
  image: string;
}

interface FollowsState {
  following: Follower[];
  followers: Follower[];
  followStatus: number;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: FollowsState = {
  following: [],
  followers: [],
  followStatus: 0,
  status: 'idle',
  error: null
};


export const searchFollowers = createAsyncThunk('followers/searchFollowers', async (userId: number) => {
  const response = await axiosInstance.post(`/follows/followers`, { userId });
  return response.data; // Ensure the data is an array of users
});
export const searchFollowing = createAsyncThunk('followers/searchFollowing', async (userId: number) => {
    const response = await axiosInstance.post(`/follows/following`, { userId });
    return response.data; // Ensure the data is an array of users
  });

export const follow = createAsyncThunk('follows/follow', async (userId: number) => {
  const response = await axiosInstance.post(`/follows/${userId}`);
  return response.data;
});
export const unFollow = createAsyncThunk('follows/unFollow', async (userId: number) => {
  const response = await axiosInstance.delete(`/follows/${userId}`);
  return response.data;
});
export const searchCurrentFollower = createAsyncThunk('follows/searchCurrentFollower', async (userId: number) => {
  const response = await axiosInstance.post(`/follows/searchCurrentFollower/${userId}`);
  return response.data;
});

const followsSlice = createSlice({
  name: 'follows',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(searchFollowers.fulfilled, (state, action) => {
        state.followers = action.payload;
        state.status = 'succeeded';
      })
      .addCase(searchFollowers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      })
      .addCase(searchFollowing.fulfilled, (state, action) => {
        state.following = action.payload;
        state.status = 'succeeded';
      })
      .addCase(searchFollowing.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      })
      .addCase(follow.pending, (state) => {
        state.status = 'loading';

      })
      .addCase(follow.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.followers = action.payload;
        console.log(JSON.stringify(action.payload))
        state.followStatus++;
      })
      .addCase(follow.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      })    
      .addCase(unFollow.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(unFollow.fulfilled, (state, action) => {
        const { id } = action.payload;
        state.followers = action.payload;
        state.followStatus--;

      })
      .addCase(unFollow.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      })     
      .addCase(searchCurrentFollower.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(searchCurrentFollower.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.followStatus = action.payload;
      })
      .addCase(searchCurrentFollower.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      })
      
  },
});

export default followsSlice.reducer;
