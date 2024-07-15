import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosInstance';
import { selectAuthState, setUserProfile } from '../auth/authSlice';
import { AppDispatch } from '@/store/store';

interface User {
  id: number;
  username: string;
  email: string;
  image: string;
  about: string;
}

interface UsersState {
  friends: User[];
  user: User | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: UsersState = {
  friends: [],
  user: null,
  status: 'idle',
  error: null,
};

export const fetchUser = createAsyncThunk('users/fetchUser', async (userId: number) => {
  const response = await axiosInstance.get(`/users/${userId}`);
  return response.data;
});
export const fetchUserByUsername = createAsyncThunk('users/fetchUserByUsername', async (username: string) => {
  const response = await axiosInstance.post(`/users/`, { username });
  return response.data;
});

export const searchUsers = createAsyncThunk('users/searchUsers', async (username: string) => {
  const response = await axiosInstance.post(`/follows/search`, { username });
  return response.data; // Ensure the data is an array of users
});

export const editUser = createAsyncThunk('users/editUser', async (about: string) => {
  const response = await axiosInstance.put('/users/', { about })
  return response.data; // Ensure the data is an array of users
});

export const editUserAvatar = createAsyncThunk('users/editUserAvatar', async (formData: FormData) => {
  const response = await axiosInstance.put('/users/editUserAvatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data; // Ensure the data is an array of users
});

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.status = 'succeeded';
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      })
      .addCase(editUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(editUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if (state.user !== null) {
          state.user.about = action.payload;
        }
      })
      .addCase(editUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      })
      .addCase(editUserAvatar.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(editUserAvatar.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if (state.user !== null) {
          state.user.image = action.payload;
        }
      })
      .addCase(editUserAvatar.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      })
  },
});

export default usersSlice.reducer;
