import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { RootState, AppDispatch } from '../store/store';
import { fetchUserProfile, login, register } from '../features/auth/authSlice';
import styles from '../styles/AuthPage.module.scss'; // Подключаем стили

const AuthPage = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [image, setImage] = useState<any>(null);

  const selectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImage(e.target.files[0]);
    }
  };

  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { user, status, error } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(fetchUserProfile());
    if (user) {
      router.push('/feed');
    }
  }, [user, router, dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    if (isRegistering) {
      formData.append('username', username);
      formData.append('email', email);
      formData.append('password', password);
      if (image) formData.append('image', image);
      await dispatch(register(formData));
      setIsRegistering(false);
    } else {
      formData.append('email', email);
      formData.append('password', password);
      await dispatch(login(formData));
    }
  };

  return (
    <div className={styles.authContainer}>
      <br /><br /><br /><br />
      <h2>{isRegistering ? 'Регистрация' : 'Вход'}</h2>
      <form onSubmit={handleSubmit} className={styles.authForm}>
        {isRegistering && (
          <div className={styles.formGroup}>
            <input
              type="text"
              placeholder="Имя пользователя"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <input type="file" onChange={selectFile} />
          </div>
        )}
        <div className={styles.formGroup}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className={styles.submitButton}>
          {isRegistering ? 'Зарегистрироваться' : 'Войти'}
        </button>
      </form>
      {status === 'loading' && <p>Загрузка...</p>}
      {error && <p className={styles.error}>{error}</p>}
      <button onClick={() => setIsRegistering(!isRegistering)} className={styles.switchButton}>
        {isRegistering ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться'}
      </button>
    </div>
  );
};

export default AuthPage;
