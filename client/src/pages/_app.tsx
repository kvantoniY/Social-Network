import { AppProps } from 'next/app';
import { Provider } from 'react-redux';
import { store } from '../store/store';
import Header from '../components/Header/Header';
import '../styles/globals.scss'; // Подключаем глобальные стили
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import axiosInstance from '@/utils/axiosInstance';

const MyApp = ({ Component, pageProps }: AppProps) => {
  const router = useRouter()
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await axiosInstance.get('/auth/checkToken'); // Эндпоинт для проверки аутентификации
      } catch (error) {
        console.log(error)
        if (router.pathname !== '/auth') {
          router.push('/auth');
        }
      }
    };
    checkAuth();
  }, []);
  return (
    <Provider store={store}>
      <Header />
          <Component {...pageProps} />
    </Provider>
  );
};

export default MyApp;
