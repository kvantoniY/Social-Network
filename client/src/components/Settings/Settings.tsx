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

    const [profileVisibility, setProfileVisibility] = useState<string>('Все пользователи');
    const [messagePrivacy, setMessagePrivacy] = useState<string>('Все пользователи');
    const [commentPrivacy, setCommentPrivacy] = useState<string>('Все пользователи');
    const [notificationSound, setNotificationSound] = useState<boolean>(true);
    const [messageSound, setMessageSound] = useState<boolean>(true);
    const [likeNotifications, setLikeNotifications] = useState<boolean>(true);
    const [commentNotifications, setCommentNotifications] = useState<boolean>(true);
    const [followerNotifications, setFollowerNotifications] = useState<boolean>(true);

    useEffect(() => {
        dispatch(fetchUserProfile());
        dispatch(fetchUserSettings());
    }, [dispatch]);

    useEffect(() => {
        if (settings) {
            setProfileVisibility(settings.profileVisibility);
            setMessagePrivacy(settings.messagePrivacy);
            setCommentPrivacy(settings.commentPrivacy);
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
        if (newPassword !== confirmPassword) {
            alert("Пароли не совпадают");
            return;
        }
        if (authUser?.id) {
            dispatch(changePassword({ id: authUser.id, oldPassword, newPassword }));
        }
        if(!error) {
            setShowPasswordForm(false);
        }
    };

    const handleUpdateSettings = () => {
        const updatedSettings = {
            profileVisibility,
            messagePrivacy,
            commentPrivacy,
            notificationSound,
            messageSound,
            likeNotifications,
            commentNotifications,
            followerNotifications,
        };
        dispatch(updateUserSettings(updatedSettings));
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
                    <select value={profileVisibility} onChange={(e) => setProfileVisibility(e.target.value)}>
                        <option>Все пользователи</option>
                        <option>Взаимные подписчики</option>
                    </select>
                </div>
                <div className={styles.optionContainer}>
                    <p>Кто может писать сообщения</p>
                    <select value={messagePrivacy} onChange={(e) => setMessagePrivacy(e.target.value)}>
                        <option>Все пользователи</option>
                        <option>Взаимные подписчики</option>
                    </select>
                </div>
                <div className={styles.optionContainer}>
                    <p>Кто может комментировать мои посты</p>
                    <select value={commentPrivacy} onChange={(e) => setCommentPrivacy(e.target.value)}>
                        <option>Все пользователи</option>
                        <option>Взаимные подписчики</option>
                        <option>Никто</option>
                    </select>
                </div>
                <button onClick={handleUpdateSettings}>Сохранить изменения</button>
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
                        {status === 'loading' && <p>Loading...</p>}
                        {error && <p>{error}</p>}
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
                    <p>Получать уведомления о подписках</p>
                    <label className={styles.switch}>
                        <input 
                            type="checkbox" 
                            checked={followerNotifications}
                            onChange={() => setFollowerNotifications(!followerNotifications)}
                        />
                        <span className={styles.slider}></span>
                    </label>
                </div>
                <button onClick={handleUpdateSettings}>Сохранить изменения</button>
            </div>

            <div onClick={handleLogout} className={styles.settingContainer}>
                <div className={styles.optionContainer}>
                    <span>Выйти из аккаунта</span>
                    <img src={logoutIcon.src} alt="logout" className={styles.logout} />
                </div>
            </div>
        </div>
    );
};

export default Settings;
