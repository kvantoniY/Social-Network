import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { fetchUserProfile, logout } from '../../features/auth/authSlice';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { checkToken } from '@/features/auth/authAPI';
import Link from 'next/link';
import ThemeToggle from '../ThemeToggle';
import styles from "./Header.module.scss"

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
      <nav>
        {user ? (
          <>
            <Link href="/feed">Лента</Link>
            <Link href="/dialogs">Диалоги</Link>
            <Link href="/follows">Друзья</Link>
            <ThemeToggle />
            
            <button>Уведомления</button>
            <Link href={`/users/${user.id}`}>
            <div className={styles.userContainer}>
            <img
            src={`http://localhost:3001/` + user?.image || "default.jpg"}
            alt=""
            className={styles.avatar}
          />
              <p>{user.username}</p>
              <button onClick={handleLogout}>Logout</button>
              </div>
              </Link>
          </>
        ) : (
          <button onClick={() => router.push('/auth')}>Войти</button>
        )}
      </nav>
    </header>
  );
};

export default Header;
