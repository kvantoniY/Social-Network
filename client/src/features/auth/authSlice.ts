import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosInstance';
import { AppDispatch } from '@/store/store';
import axios from 'axios';

interface AuthState {
  user: {
    id: number;
    username: string;
    email: string;
    image: string;
  } | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  token: string | null;
}

const initialState: AuthState = {
  user: null,
  status: 'idle',
  error: null,
  token: null
};


export const login = createAsyncThunk(
  'auth/login',
  async (formData: FormData) => {
    const response = await axiosInstance.post('/auth/login', formData);
    return response.data;
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (formData: FormData) => {
    const response = await axiosInstance.post('/auth/register', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
);
export const fetchUserProfile = createAsyncThunk(
  'users/fetchProfile',
  async () => {
    const response = await axiosInstance.get(`/users/search`);
    return response.data;
  }
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async ({ id, oldPassword, newPassword }: { id: number; oldPassword: string; newPassword: string }) => {
    const response = await axiosInstance.post(`/auth/changePassword`, {
      id,
      password: oldPassword,
      newPassword,
    });
    return response.data;
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('token');
    },
    setToken: (state, action) => {
        state.token = action.payload;
        console.log(action.payload)
    },
    setUserProfile: (state, action) => {
        state.user = action.payload.user;
      },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
        console.log(action.payload)
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('user', JSON.stringify(action.payload.user));

      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      })
      .addCase(register.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      })
      .addCase(fetchUserProfile.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
        console.log("Good")
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
        console.log("Failed")
      })
      .addCase(changePassword.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.error = null;
        localStorage.setItem('token', action.payload);
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;

      });
  },
});


export const { logout, setToken,setUserProfile } = authSlice.actions;
// Экспорт селектора
export const selectAuthState = (state: any) => state.auth;

export default authSlice.reducer;
