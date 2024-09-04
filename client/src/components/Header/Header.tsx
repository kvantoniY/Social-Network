import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/router';
import Link from 'next/link';
import io from 'socket.io-client';

import { RootState, AppDispatch } from '@/store/store';
import { fetchUserProfile, logout } from '@/features/auth/authSlice';
import { fetchUserSettings } from '@/features/settings/settingsSlice';
import { checkToken } from '@/features/auth/authAPI';

import ThemeToggle from '@/components/ThemeToogle/ThemeToggle';
import { User, Dialog, Notification } from '@/types/types';

import { dialogsIcon, homeIcon, subsIcon, logoutIcon, noticeIcon, settingsIcon } from '@/assets/';
import styles from './Header.module.scss';

// Компонент Header
const Header: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);
  const { settings } = useSelector((state: RootState) => state.settings);
  
  const [dialogs, setDialogs] = useState<Dialog[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsRead, setNotificationsRead] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [socket, setSocket] = useState<any>(null);
  const previousDialogsRef = useRef<Dialog[]>([]);

  // Аудио элементы
  const messageSoundRef = useRef<HTMLAudioElement | null>(null);
  const notificationSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    dispatch(checkToken() as any);
    dispatch(fetchUserProfile());
    dispatch(fetchUserSettings());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      const newSocket = io(':3001');
      setSocket(newSocket);
      newSocket.emit('join', user.id);

      newSocket.on('dialogs update', (updatedDialogs: Dialog[]) => {
        const totalUnreadCount = updatedDialogs.reduce((acc, dialog) => acc + dialog.unreadCount, 0);
        const prevUnreadCount = previousDialogsRef.current.reduce((acc, dialog) => acc + dialog.unreadCount, 0);

        if (totalUnreadCount > prevUnreadCount && messageSoundRef.current && settings?.messageSound) {
          messageSoundRef.current.play();
        }

        previousDialogsRef.current = updatedDialogs;
        setDialogs(updatedDialogs);
        setUnreadCount(totalUnreadCount);
      });

      newSocket.on('new_notification', (notification: Notification) => {
        setNotifications((prev) => [notification, ...prev]);
        setNotificationsRead((prev) => prev + 1);

        if (notificationSoundRef.current && settings?.notificationSound) {
          notificationSoundRef.current.play();
        }
      });

      newSocket.on('notifications', (notifications: Notification[]) => {
        setNotifications(notifications);
        setNotificationsRead(notifications.filter(n => !n.isRead).length);
      });

      newSocket.emit('get dialogs', user.id);
      newSocket.emit('get_notifications', user.id);

      return () => {
        newSocket.off('dialogs update');
        newSocket.off('new_notification');
        newSocket.off('notifications');
        newSocket.close();
      };
    }
  }, [user, settings]);

  const handleLogout = () => {
    dispatch(logout());
    router.push('/auth');
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (user) {
      socket.emit('mark_as_read', user.id);
      setNotifications([]);
    }
  };

  // Мемозируем отрывок поста, чтобы не пересчитывался на каждый рендер
  const getPostContentSnippet = useMemo(() => {
    return (content: string) => (content.length > 10 ? `${content.substring(0, 10)}...` : content);
  }, []);

  return (
    <header className='header'>
      <nav className={styles.nav}>
        {user ? (
          <>
            <div className={styles.navMenu}>
              <Link href="/feed"><img src={homeIcon.src} alt="Feed" /></Link>

              <Link href="/dialogs">
                <div className={styles.noticeContainer}>
                  <img src={dialogsIcon.src} alt="Dialogs" />
                  {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
                </div>
              </Link>

              <Link href="/follows"><img src={subsIcon.src} alt="Subs" /></Link>
              <ThemeToggle />

              <div className={styles.noticeContainer}>
                <img src={noticeIcon.src} alt="Notice" onClick={toggleNotifications} />
                {notificationsRead > 0 && <span className={styles.badge}>{notificationsRead}</span>}

                {showNotifications && (
                  <div className={styles.notifications}>
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div key={notification.id} className={styles.notification}>
                          {notification.type === 'like' && (
                            <>
                              Пользователь <Link href={`/users/${notification.Actor.id}`}>{notification.Actor.username}</Link> поставил лайк на ваш пост{' '}
                              <img
                                src={`http://localhost:3001/${notification.Post?.images[0] || 'default.jpg'}`}
                                alt=""
                                onError={(e) => (e.currentTarget.src = 'default.jpg')}
                              />{' '}
                              {getPostContentSnippet(notification.Post?.content || '')}
                            </>
                          )}

                          {notification.type === 'comment' && (
                            <>
                              Пользователь <Link href={`/users/${notification.Actor.id}`}>{notification.Actor.username}</Link> написал комментарий под ваш пост{' '}
                              <img
                                src={`http://localhost:3001/${notification.Post?.images[0] || 'default.jpg'}`}
                                alt=""
                                onError={(e) => (e.currentTarget.src = 'default.jpg')}
                              />{' '}
                              {getPostContentSnippet(notification.Post?.content || '')}
                            </>
                          )}

                          {notification.type === 'likeCom' && (
                            <>
                              Пользователь <Link href={`/users/${notification.Actor.id}`}>{notification.Actor.username}</Link> лайкнул ваш комментарий{' '}
                              {getPostContentSnippet(notification.Comment?.content || '')}
                            </>
                          )}

                          {notification.type === 'follow' && (
                            <>
                              Пользователь <Link href={`/users/${notification.Actor.id}`}>{notification.Actor.username}</Link> подписался на вас
                            </>
                          )}
                        </div>
                      ))
                    ) : (
                      <p>No new notifications</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div>
              <Link href={`/users/${user.id}`} className={styles.userContainer}>
                <img
                  src={`http://localhost:3001/${user?.image || 'default.jpg'}`}
                  alt={user.username}
                  className={styles.avatar}
                  onError={(e) => (e.currentTarget.src = 'default.jpg')}
                />
                <p>{user.username}</p>
                <img src={logoutIcon.src} alt="Logout" onClick={handleLogout} className={styles.logout} />
                <Link href="/settings" className={styles.userContainer}>
                  <img src={settingsIcon.src} alt="Settings" className={styles.logout} />
                </Link>
              </Link>
            </div>
          </>
        ) : (
          <button onClick={() => router.push('/auth')}>Войти</button>
        )}
      </nav>

      {/* Аудио для уведомлений */}
      <audio ref={messageSoundRef} src="/sounds/message.mp3" preload="auto" />
      <audio ref={notificationSoundRef} src="/sounds/notification.mp3" preload="auto" />
    </header>
  );
};

export default Header;