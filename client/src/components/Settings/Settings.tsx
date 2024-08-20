import React from 'react'
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axiosInstance from '@/utils/axiosInstance';
import { RootState, AppDispatch } from '../../store/store';
import { fetchUser } from '@/features/users/usersSlice';
import styles from './Settings.module.scss'
import { fetchUserProfile, logout } from '@/features/auth/authSlice';
import { logoutIcon } from '../../assets/';
const Settings = () => {
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const authUser = useSelector((state: RootState) => state.auth.user);
    const handleLogout = () => {
        dispatch(logout());
        router.push('/auth');
      };
      useEffect(() => {
        // dispatch(checkToken() as any);
        dispatch(fetchUserProfile())
      }, [dispatch]);
    return (
        <div className={styles.settingsPage}>
            <h1>Settings</h1>
            {authUser?.username}
            <img
                src={`http://localhost:3001/` + authUser?.image || "default.jpg"}
                alt=""
                className={styles.avatar}
            />
            <hr />
            <button>Изменить тему</button>
            <hr />
            <h2>Закрытый профиль</h2>
            <div>
                <p>Вы можете сделать аккаунт закрытым, ваш профиль и публикации будут видеть только одобернные вами подписчики</p>
                <label className={styles.switch}>
                    <input type="checkbox" />
                    <span className={styles.slider}></span>
                </label>
            </div>
            <hr/>
            <h2>Безопасность</h2>
            <p>Изменить пароль</p>
            <hr/>
            <h2>Уведомления</h2>
            <div>
                <p>Звук уведомлений</p>
                <label className={styles.switch}>
                    <input type="checkbox" />
                    <span className={styles.slider}></span>
                </label>
            </div>
            <div>
                <p>Звук уведомлений сообщений</p>
                <label className={styles.switch}>
                    <input type="checkbox" />
                    <span className={styles.slider}></span>
                </label>
            </div>
            <div>
                <p>Получать уведолмения о лайках</p>
                <label className={styles.switch}>
                    <input type="checkbox" />
                    <span className={styles.slider}></span>
                </label>
            </div>
            <div>
                <p>Получать уведолмения о комментариях</p>
                <label className={styles.switch}>
                    <input type="checkbox" />
                    <span className={styles.slider}></span>
                </label>
            </div>
            <div>
                <p>Получать уведолмения о подписках</p>
                <label className={styles.switch}>
                    <input type="checkbox" />
                    <span className={styles.slider}></span>
                </label>
            </div>
            <hr/>
            <div onClick={handleLogout}>
                <span>Выйти из аккаунта</span>
                <img src={logoutIcon.src} alt="logout" className={styles.logout} />
            </div>


        </div>
    )
}

export default Settings