import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosInstance';
import { User } from '../../types/types'

interface Dialog {
  id: number;
  userId1: number;
  userId2: number;
  unreadCount: number;
  User1: User;
  User2: User;
}

interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  createdAt: string;
  read: boolean;
  Sender: User;
  Receiver: User;
}


interface DialogsState {
  dialogs: Dialog[];
  messages: Message[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: DialogsState = {
  dialogs: [],
  messages: [],
  status: 'idle',
  error: null
};

export const fetchDialogs = createAsyncThunk('dialogs/fetchDialogs', async () => {
  const response = await axiosInstance.get('/messages/dialogs');
  return response.data;
});

export const fetchMessages = createAsyncThunk('dialogs/fetchMessages', async (userId: number) => {
  const response = await axiosInstance.get(`/messages/${userId}`);
  return response.data;
});

export const sendMessage = createAsyncThunk('dialogs/sendMessage', async ({ content, receiverId }: { content: string, receiverId: number }) => {
  const response = await axiosInstance.post('/messages', { content, receiverId });
  return response.data;
});

export const markMessageAsRead = createAsyncThunk('dialogs/markMessageAsRead', async (messageId: number) => {
  const response = await axiosInstance.put(`/messages/${messageId}/read`);
  return response.data;
});

const dialogsSlice = createSlice({
  name: 'dialogs',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDialogs.fulfilled, (state, action) => {
        state.dialogs = action.payload;
        state.status = 'succeeded';
      })
      .addCase(fetchDialogs.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.messages = action.payload;
        state.status = 'succeeded';
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.messages.push(action.payload);
      })
      .addCase(markMessageAsRead.fulfilled, (state, action) => {
        const index = state.messages.findIndex(message => message.id === action.payload.id);
        if (index !== -1) {
          state.messages[index].read = true;
        }
      });
  },
});

export default dialogsSlice.reducer;
