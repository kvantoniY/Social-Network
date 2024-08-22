import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { fetchUserProfile, logout, changePassword } from '@/features/auth/authSlice';
import { fetchUserSettings, updateUserSettings } from '@/features/settings/settingsSlice';
import ThemeToggle from '../Header/ThemeToggle';
import styles from './Settings.module.scss';
import { logoutIcon } from '../../assets/';

const Settings: React.FC = () => {
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const authUser = useSelector((state: RootState) => state.auth.user);
    const { status, error, settings } = useSelector((state: RootState) => state.settings);

    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

        // Добавление состояний для обработки ошибок и успешных сообщений
        const [passwordError, setPasswordError] = useState<string | null>(null);
        const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

    // Правильные переменные, соответствующие модели на сервере
    const [privateProfile, setPrivateProfile] = useState<string>('Все пользователи');
    const [canMessage, setCanMessage] = useState<string>('Все пользователи');
    const [canComment, setCanComment] = useState<string>('Все пользователи');
    const [notificationSound, setNotificationSound] = useState<boolean>(true);
    const [messageSound, setMessageSound] = useState<boolean>(true);
    const [likeNotifications, setLikeNotifications] = useState<boolean>(true);
    const [commentNotifications, setCommentNotifications] = useState<boolean>(true);
    const [followerNotifications, setFollowerNotifications] = useState<boolean>(true);
    const [updateStatus, setUpdateStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [updateError, setUpdateError] = useState<string | null>(null);

    useEffect(() => {
        dispatch(fetchUserProfile());
        dispatch(fetchUserSettings());
    }, [dispatch]);

    useEffect(() => {
        if (settings) {
            setPrivateProfile(settings.privateProfile ? 'Взаимные подписчики' : 'Все пользователи');
            setCanMessage(settings.canMessage);
            setCanComment(settings.canComment);
            setNotificationSound(settings.notificationSound);
            setMessageSound(settings.messageSound);
            setLikeNotifications(settings.likeNotifications);
            setCommentNotifications(settings.commentNotifications);
            setFollowerNotifications(settings.followerNotifications);
        }
    }, [settings]);

    const handleLogout = () => {
        dispatch(logout());
        router.push('/auth');
    };

    const handlePasswordChange = () => {
        // Сброс сообщений
        setPasswordError(null);
        setPasswordSuccess(null);

        // Проверка совпадения паролей
        if (newPassword !== confirmPassword) {
            setPasswordError("Пароли не совпадают");
            return;
        }

        // Проверка длины нового пароля
        if (newPassword.length < 6) {
            setPasswordError("Пароль должен содержать не менее 6 символов");
            return;
        }

        if (authUser?.id) {
            dispatch(changePassword({ id: authUser.id, oldPassword, newPassword }))
                .unwrap()
                .then(() => {
                    setPasswordSuccess("Пароль успешно изменен");
                    setShowPasswordForm(false); // Закрытие формы после успешного изменения
                })
                .catch((err) => {
                    setPasswordError(err.message || "Ошибка при изменении пароля");
                });
        }
    };

    const handleUpdateSettings = async () => {
        const updatedSettings = {
            privateProfile: privateProfile === 'Взаимные подписчики',
            canMessage,
            canComment,
            notificationSound,
            messageSound,
            likeNotifications,
            commentNotifications,
            followerNotifications,
        };

        try {
            setUpdateStatus('loading');
            await dispatch(updateUserSettings(updatedSettings)).unwrap();
            setUpdateStatus('success');
            setUpdateError(null);
        } catch (err: any) {
            setUpdateStatus('error');
            setUpdateError(err.message || 'Ошибка при обновлении настроек');
        }
    };

    return (
        <div className={styles.settingsPage}>
            <div className={styles.settingContainer}>
                <h1>Настройки</h1>
                {authUser?.username}
                <img
                    src={`http://localhost:3001/` + (authUser?.image || "default.jpg")}
                    alt=""
                    className={styles.avatar}
                />
            </div>

            <div className={styles.settingContainer}>
                <div className={styles.optionContainer}>
                    <span>Изменить тему</span>
                    <ThemeToggle />
                </div>
            </div>

            <div className={styles.settingContainer}>
                <h2>Закрытый профиль</h2>
                <div className={styles.optionContainer}>
                    <p>Кто может просматривать мой профиль</p>
                    <select value={privateProfile} onChange={(e) => setPrivateProfile(e.target.value)}>
                        <option>Все пользователи</option>
                        <option>Взаимные подписчики</option>
                    </select>
                </div>
                <div className={styles.optionContainer}>
                    <p>Кто может писать сообщения</p>
                    <select value={canMessage} onChange={(e) => setCanMessage(e.target.value)}>
                        <option value="everyone">Все пользователи</option>
                        <option value="mutuals">Взаимные подписчики</option>
                        <option value="no_one">Никто</option>
                    </select>
                </div>
                <div className={styles.optionContainer}>
                    <p>Кто может комментировать мои посты</p>
                    <select value={canComment} onChange={(e) => setCanComment(e.target.value)}>
                        <option value="everyone">Все пользователи</option>
                        <option value="mutuals">Взаимные подписчики</option>
                        <option value="no_one">Никто</option>
                    </select>
                </div>
                <button onClick={handleUpdateSettings}>Сохранить изменения</button>
                {updateStatus === 'loading' && <p>Сохранение...</p>}
                {updateStatus === 'success' && <p>Настройки успешно обновлены</p>}
                {updateStatus === 'error' && <p>{updateError}</p>}
            </div>

            <div className={styles.settingContainer}>
                <h2>Безопасность</h2>
                <p onClick={() => setShowPasswordForm(!showPasswordForm)}>Изменить пароль</p>

                {showPasswordForm && (
                    <div className={styles.passwordForm}>
                        <input
                            type="password"
                            placeholder="Старый пароль"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                        />
                        <input
                            type="password"
                            placeholder="Новый пароль"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <input
                            type="password"
                            placeholder="Повторите новый пароль"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <div className={styles.buttonContainer}>
                            <button onClick={() => setShowPasswordForm(false)}>Отмена</button>
                            <button onClick={handlePasswordChange}>Готово</button>
                        </div>

                        {/* Вывод сообщения об ошибке */}
                        {passwordError && <p className={styles.error}>{passwordError}</p>}
                        {passwordSuccess && <p className={styles.success}>{passwordSuccess}</p>}
                    </div>
                )}
            </div>


            <div className={styles.settingContainer}>
                <h2>Уведомления</h2>
                <div className={styles.optionContainer}>
                    <p>Звук уведомлений</p>
                    <label className={styles.switch}>
                        <input 
                            type="checkbox" 
                            checked={notificationSound}
                            onChange={() => setNotificationSound(!notificationSound)}
                        />
                        <span className={styles.slider}></span>
                    </label>
                </div>
                <div className={styles.optionContainer}>
                    <p>Звук уведомлений сообщений</p>
                    <label className={styles.switch}>
                        <input 
                            type="checkbox" 
                            checked={messageSound}
                            onChange={() => setMessageSound(!messageSound)}
                        />
                        <span className={styles.slider}></span>
                    </label>
                </div>
                <div className={styles.optionContainer}>
                    <p>Получать уведомления о лайках</p>
                    <label className={styles.switch}>
                        <input 
                            type="checkbox" 
                            checked={likeNotifications}
                            onChange={() => setLikeNotifications(!likeNotifications)}
                        />
                        <span className={styles.slider}></span>
                    </label>
                </div>
                <div className={styles.optionContainer}>
                    <p>Получать уведомления о комментариях</p>
                    <label className={styles.switch}>
                        <input 
                            type="checkbox" 
                            checked={commentNotifications}
                            onChange={() => setCommentNotifications(!commentNotifications)}
                        />
                        <span className={styles.slider}></span>
                    </label>
                </div>
                <div className={styles.optionContainer}>
                    <p>Получать уведомления о подписчиках</p>
                    <label className={styles.switch}>
                        <input 
                            type="checkbox" 
                            checked={followerNotifications}
                            onChange={() => setFollowerNotifications(!followerNotifications)}
                        />
                        <span className={styles.slider}></span>
                    </label>
                </div>
            </div>

            <div className={styles.settingContainer}>
                <h2>Завершить сеанс</h2>
                <button onClick={handleLogout} className={styles.logoutButton}>
                    <img src={logoutIcon.src} alt="Выйти" className={styles.logout}/>
                </button>
            </div>
        </div>
    );
};

export default Settings;
