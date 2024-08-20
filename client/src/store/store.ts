import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import postsReducer from '../features/posts/postsSlice';
import usersReducer from '../features/users/usersSlice';
import followSlice from '../features/follows/followSlice';
import dialogsSlice from '@/features/dialogs/dialogsSlice';
import settingsSlice from '@/features/settings/settingsSlice';



export const store = configureStore({
  reducer: {
    auth: authReducer,
    posts: postsReducer,
    users: usersReducer,
    follows: followSlice,
    dialogs: dialogsSlice,
    settings: settingsSlice
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
