import axiosInstance from '@/utils/axiosInstance';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

interface SettingsState {
    settings: any; // Укажите конкретный тип для settings, если известно
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: SettingsState = {
    settings: null,
    status: 'idle',
    error: null,
};

export const fetchUserSettings = createAsyncThunk('settings/getUserSettings', async (_, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get('/users/getUserSettings');
        return response.data;
    } catch (error: any) {
        return rejectWithValue(error.response.data);
    }
});

export const updateUserSettings = createAsyncThunk('settings/updateUserSettings', async (settings: any, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.put('/users/updateUserSettings', settings);
        return response.data;
    } catch (error: any) {
        return rejectWithValue(error.response.data);
    }
});

const settingsSlice = createSlice({
    name: 'settings',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchUserSettings.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchUserSettings.fulfilled, (state, action: PayloadAction<any>) => {
                state.status = 'succeeded';
                state.settings = action.payload;
            })
            .addCase(fetchUserSettings.rejected, (state, action: PayloadAction<any>) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(updateUserSettings.pending, (state, action: PayloadAction<any>) => {
                state.status = 'loading';
            })
            .addCase(updateUserSettings.fulfilled, (state, action: PayloadAction<any>) => {
                state.settings = action.payload;
            })
            .addCase(updateUserSettings.rejected, (state, action: PayloadAction<any>) => {
                state.status = 'failed';
                state.error = action.payload;
            })
    },
});

export default settingsSlice.reducer;
