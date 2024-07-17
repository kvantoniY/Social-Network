import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { fetchUserProfile, logout } from '../../features/auth/authSlice';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { checkToken } from '@/features/auth/authAPI';
import Link from 'next/link';
import ThemeToggle from './ThemeToggle';
import styles from "./Header.module.scss"

import { dialogsIcon, homeIcon, subsIcon, logoutIcon, noticeIcon } from '../../assets/'

const Header = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    dispatch(checkToken() as any);
    dispatch(fetchUserProfile())
  }, [dispatch]);

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
