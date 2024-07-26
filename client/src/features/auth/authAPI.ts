import { AppDispatch } from "@/store/store";
import { logout, setToken, setUserProfile } from "./authSlice";
import axios from "axios";
import axiosInstance from "@/utils/axiosInstance";

export const checkToken = () => async (dispatch: AppDispatch) => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await axiosInstance.get('/auth/checkToken', {
          headers: { Authorization: `Bearer ${token}` },
        });
        dispatch(setToken(token));
      } catch (error) {

      }
    }
  };
