import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { RootState, AppDispatch } from '../store/store';
import { fetchUserProfile, login, register } from '../features/auth/authSlice';

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
    dispatch(fetchUserProfile())
    if (user) {
      router.push('/feed');
    }
  }, [user, router, dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegistering === true) {
      try {
        const formData = new FormData();
        formData.append('username', username);
        formData.append('email', email);
        formData.append('password', password);
        if (image) {
          formData.append('image', image);
        }

        await dispatch(register(formData));
        setIsRegistering(false);
      } catch (e) {
        console.log(e)
      }
    } else {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);
      await dispatch(login(formData));
    }
  };

  return (
    <div>
      <br /><br /><br /><br />
      <h2>{isRegistering ? 'Регистрация' : 'Вход'}</h2>
      <form onSubmit={handleSubmit}>
        {isRegistering && (
          <div>
          <input
            type="text"
            placeholder="Имя пользователя"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input type="file" onChange={selectFile}/>
          </div>
        )}
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
        <button type="submit">{isRegistering ? 'Зарегистрироваться' : 'Войти'}</button>
      </form>
      {status === 'loading' && <p>Загрузка...</p>}
      {error && <p>{error}</p>}
      <button onClick={() => setIsRegistering(!isRegistering)}>
        {isRegistering ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться'}
      </button>
    </div>
  );
};

export default AuthPage;
