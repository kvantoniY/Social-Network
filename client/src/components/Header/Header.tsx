import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { fetchUserProfile, logout } from '../../features/auth/authSlice';
import { useRouter } from 'next/router';
import { useEffect, useState, useRef } from 'react';
import { checkToken } from '@/features/auth/authAPI';
import io from 'socket.io-client';
import Link from 'next/link';
import ThemeToggle from './ThemeToggle';
import styles from "./Header.module.scss";
import { User, Dialog, Notification } from '../../types/types';

import { dialogsIcon, homeIcon, subsIcon, logoutIcon, noticeIcon, settingsIcon } from '../../assets/';
import { fetchUserSettings } from '@/features/settings/settingsSlice';

const Header: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);
  const { status, error, settings } = useSelector((state: RootState) => state.settings);
  const [dialogs, setDialogs] = useState<Dialog[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsRead, setNotificationsRead] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [socket, setSocket] = useState<any>(null);
  const previousDialogsRef = useRef<Dialog[]>([]); // Храним предыдущие диалоги

  // Создаем ссылки на аудио элементы
  const messageSoundRef = useRef<HTMLAudioElement | null>(null);
  const notificationSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    dispatch(checkToken() as any);
    dispatch(fetchUserProfile())
    dispatch(fetchUserSettings());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      const newSocket = io(':3001');
      setSocket(newSocket);
      newSocket.emit('join', user.id); // Присоединение к комнате пользователя

      newSocket.on('dialogs update', (updatedDialogs: Dialog[]) => {
        const totalUnreadCount = updatedDialogs.reduce((acc, dialog) => acc + dialog.unreadCount, 0);

        // Проверка на увеличение количества непрочитанных сообщений
        const prevUnreadCount = previousDialogsRef.current.reduce((acc, dialog) => acc + dialog.unreadCount, 0);
        if (totalUnreadCount > prevUnreadCount && messageSoundRef.current && settings && settings.messageSound) {
          messageSoundRef.current.play();
        }

        // Сохраняем обновленные диалоги и количество непрочитанных
        previousDialogsRef.current = updatedDialogs; // Сохраняем текущее состояние диалогов
        setDialogs(updatedDialogs);
        setUnreadCount(totalUnreadCount);
      });

      // Запрос на получение текущих диалогов
      newSocket.emit('get dialogs', user.id);

      newSocket.on('new_notification', (notification: Notification) => {
        setNotifications((prev) => [notification, ...prev]);
        setNotificationsRead(notificationsRead => notificationsRead + 1)

        // Воспроизведение звука для новых уведомлений
        if (notificationSoundRef.current && settings && settings.notificationSound) {
          notificationSoundRef.current.play();
        }
      });

      newSocket.on('notifications', (notifications: Notification[]) => {
        setNotifications(notifications);
        let unreadNotifications = notifications.filter(notification => notification.isRead === false)
        setNotificationsRead(unreadNotifications.length)
      });

      newSocket.emit('get_notifications', user.id);

      return () => {
        newSocket.off('dialogs update');
        newSocket.off('new_notification');
        newSocket.off('notifications');
        newSocket.close();
      };
    }
  }, [user, dispatch]);

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

  const getPostContentSnippet = (content: string) => {
    return content.length > 10 ? `${content.substring(0, 10)}...` : content;
  };

  return (
    <header className='header'>
      <nav className={styles.nav}>
        {user ? (
          <>
            <div className={styles.navMenu}>
              <Link href="/feed"><img src={homeIcon.src} alt="Feed" /></Link>
              
              <Link href="/dialogs">
              <div className={styles.noticeContainer}>
                <img src={dialogsIcon.src} alt="dialogs" />
                <span className={styles.badge}>{unreadCount}</span>
                </div>
              </Link>
              
              <Link href="/follows"><img src={subsIcon.src} alt="Subs" /></Link>
              <ThemeToggle />

              <div className={styles.noticeContainer}>
                <img src={noticeIcon.src} alt="Notice" onClick={toggleNotifications} />
                {notifications.length > 0 && <span className={styles.badge}>{notificationsRead}</span>}

                {showNotifications && (
                  <div className={styles.notifications}>
                    
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div key={notification.id}>
                          {notification.type === 'like' ? (
                            <div className={styles.notification}>
                              Пользователь <Link href={`/users/${notification.Actor.id}`}>{notification.Actor.username} </Link> 
                              поставил лайк на ваш пост <img src={`http://localhost:3001/` + notification.Post?.images[0] || "default.jpg"} alt="" /> {notification.Post ? getPostContentSnippet(notification.Post.content) : ''}
                            </div>
                          ) : notification.type === 'comment' ? (
                              <div className={styles.notification}>
                                Пользователь <Link href={`/users/${notification.Actor.id}`}>{notification.Actor.username} </Link> написал комментарий под ваш пост 
                                <div><img src={`http://localhost:3001/` + notification.Post?.images[0] || "default.jpg"} alt="" /> {notification.Post ? getPostContentSnippet(notification.Post.content) : ''}</div>
                              </div>
                          ) : notification.type === 'likeCom' ? (
                            <div className={styles.notification}>
                               Пользователь <Link href={`/users/${notification.Actor.id}`}>{notification.Actor.username} </Link> 
                               лайкнул ваш комментарий {notification.Comment ? getPostContentSnippet(notification.Comment.content) : ''}
                            </div>
                          ) : (
                                <div className={styles.notification}>
                                  Пользователь <Link href={`/users/${notification.Actor.id}`}>{notification.Actor.username} </Link> подписался на вас
                                </div>
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
                  src={`http://localhost:3001/` + user?.image || "default.jpg"}
                  alt=""
                  className={styles.avatar}
                />
                <p>{user.username}</p>
                <img src={logoutIcon.src} alt="logout" onClick={handleLogout} className={styles.logout} />
                <Link href={`/settings`} className={styles.userContainer}>
                  <img src={settingsIcon.src} alt="logout" className={styles.logout} />
                </Link>
              </Link>
            </div>
          </>
        ) : (
          <button onClick={() => router.push('/auth')}>Войти</button>
        )}
      </nav>

      {/* Аудио элементы для уведомлений */}
      <audio ref={messageSoundRef} src="/sounds/message.mp3" preload="auto" />
      <audio ref={notificationSoundRef} src="/sounds/notification.mp3" preload="auto" />

    </header>
  );
};

export default Header;
