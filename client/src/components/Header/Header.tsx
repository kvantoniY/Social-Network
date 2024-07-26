import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { fetchUserProfile, logout } from '../../features/auth/authSlice';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { checkToken } from '@/features/auth/authAPI';
import io from 'socket.io-client';
import Link from 'next/link';
import ThemeToggle from './ThemeToggle';
import styles from "./Header.module.scss"
import { User, Dialog } from '../../types/types';

import { dialogsIcon, homeIcon, subsIcon, logoutIcon, noticeIcon } from '../../assets/'

const Header: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);
  const [dialogs, setDialogs] = useState<Dialog[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  useEffect(() => {
    dispatch(checkToken() as any);
    dispatch(fetchUserProfile())
  }, [dispatch]);
  useEffect(() => {
    if (user) {
      const newSocket = io(':3001');

      newSocket.emit('join', user.id); // Присоединение к комнате пользователя

      newSocket.on('dialogs update', (updatedDialogs: Dialog[]) => {
        setDialogs(updatedDialogs);
        const totalUnreadCount = updatedDialogs.reduce((acc, dialog) => acc + dialog.unreadCount, 0);
        setUnreadCount(totalUnreadCount); // Обновляем общее количество непрочитанных сообщений
      });

      // Запрос на получение текущих диалогов
      newSocket.emit('get dialogs', user.id);

      return () => {
        newSocket.off('dialogs update');
        newSocket.close();
      };
    }
  }, [user]);

  const handleLogout = () => {
    dispatch(logout());
    router.push('/auth');
  };

  return (
    <header className='header'>
      <nav className={styles.nav}>
        {user ? (
          <>
            <div className={styles.navMenu}>
              <Link href="/feed"><img src={homeIcon.src} alt="Feed" /></Link>
              <Link href="/dialogs"><img src={dialogsIcon.src} alt="dialogs" /></Link>
              {unreadCount}
              <Link href="/follows"><img src={subsIcon.src} alt="Subs" /></Link>
              <ThemeToggle />

              <img src={noticeIcon.src} alt="Notice" />
            </div>

            <div>
              <Link href={`/users/${user.id}`} className={styles.userContainer}>
                <img
                  src={`http://localhost:3001/` + user?.image || "default.jpg"}
                  alt=""
                  className={styles.avatar}
                />
                <p>{user.username}</p>
                <img src={logoutIcon.src} alt="logout" onClick={handleLogout} className={styles.logout} />
              </Link>
            </div>


          </>
        ) : (
          <button onClick={() => router.push('/auth')}>Войти</button>
        )}
      </nav>
    </header>
  );
};

export default Header;
