import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { editUser, editUserAvatar, fetchUser } from '../../features/users/usersSlice';
import { RootState, AppDispatch } from '../../store/store';
import { follow, searchCurrentFollower, searchFollowers, searchFollowing, unFollow } from '@/features/follows/followSlice';
import CreatePost from '@/components/CreatePost/CreatePost';
import { fetchUserPosts } from '@/features/posts/postsSlice';
import Post from '@/components/Post/Post';
import ModalEditAvatar from '@/components/Modals/ModalEditAvatar/ModalEditAvatar';
import Modal from '@/components/ui/MyModal/Modal';
import ModalFollowers from '@/components/Modals/ModalFollowers/ModalFollowers';
import styles from './UserPage.module.scss';
import { addImageIcon, blackListIcon, editIcon, sendIcon, unBlackListIcon } from '@/assets';
import Link from 'next/link';
import io from 'socket.io-client';
import axiosInstance from '@/utils/axiosInstance';
import { AddBlackListAPI, CheckBlackListAPI, DeleteBlackListAPI } from '@/features/users/usersAPI';
import { fetchCurrentUserSettings } from '@/features/settings/settingsSlice';

const UserPage = () => {
  const router = useRouter();
  let { id } = router.query;

  const dispatch = useDispatch<AppDispatch>();
  const { user, status, error } = useSelector((state: RootState) => state.users);
  const { followStatus, followers, following } = useSelector((state: RootState) => state.follows);
  const { posts } = useSelector((state: RootState) => state.posts);
  const authUser = useSelector((state: RootState) => state.auth.user);
  const { settings } = useSelector((state: RootState) => state.settings);
  const [dialogId, setDialogId] = useState(null);
  const [about, setAbout] = useState('');
  const [image, setImage] = useState<any>(null);
  const [isEdit, setIsEdit] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalFollowersOpen, setIsModalFollowersOpen] = useState(false);
  const [socket, setSocket] = useState<any>(null);
  const [blackListStatus, setBlackListStatus] = useState(false);
  const [isBlackListStatus, setIsBlackListStatus] = useState(false);
  const [isModalAvatarImageOpen, setIsModalAvatarImageOpen] = useState(false)

  const selectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImage(e.target.files[0]);
    }
  };
  
  useEffect(() => {
    if (id) {
      const numericId = Number(id);
      const userId = Number(id)
      const checkBlackListStatus = async () => {
        try {
          const response = await axiosInstance.get(`/users/checkBlackList/${userId}`);
          if (response.data.isBlackList) {
            setIsBlackListStatus(true);
          }
          if (response.data.blUser) {
            setBlackListStatus(true);
          }
        } catch (e) {
          console.log(e);
        }
      }
      dispatch(fetchUser(Number(id)));
      dispatch(fetchUserPosts(Number(id)));
      dispatch(searchFollowers(Number(id)));
      dispatch(searchFollowing(Number(id)));
      dispatch(searchCurrentFollower(Number(id)));
      dispatch(fetchCurrentUserSettings(Number(id)));
      const findDialogId = async () => {
        try {
          const response = await axiosInstance.post('/messages/dialog', { id: numericId });
          if (response.data) {
            setDialogId(response.data.dialogId);
          }
        } catch (e) {
          console.log(e);
        }
      }
      checkBlackListStatus();
      findDialogId();
    }
  }, [dispatch, id]);
  
  useEffect(() => {
    if (user) {
      setAbout(user.about || '');
    }
  }, [user]);

  useEffect(() => {
    if (authUser) {
      const newSocket = io(':3001');
      setSocket(newSocket);
      newSocket.emit('join', authUser?.id);

      return () => {
        newSocket.close();
      };
    }
  }, [authUser]);

  const sendMessage = (userId: number, postId: number, newMessage: string, e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      const messageData = {
        content: newMessage,
        receiverId: Number(userId),
        senderId: user?.id,
        type: "share",
        postId: postId
      };
      socket.emit('chat message', messageData);
    }
  }

  const handleBlackList = async (status: string) => {
    if (status === "add") {
      try {
        await AddBlackListAPI(Number(id));
        setIsBlackListStatus(true);
      } catch (e) {
        console.log(e);
      }
    } else {
      try {
        await DeleteBlackListAPI(Number(id));
        setIsBlackListStatus(false);
      } catch (e) {
        console.log(e);
      }
    }
  }

  const handleFollow = async () => {
    try {
      await dispatch(follow(Number(id)));
      if (settings && settings.followerNotifications) {
        const notificationData = {
          type: 'follow',
          userId: Number(id),
          actorId: Number(authUser?.id),
        };
        socket.emit('create_notification', notificationData);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const handleUnFollow = async () => {
    try {
      await dispatch(unFollow(Number(id)));
    } catch (e) {
      console.log(e);
    }
  };

  const handleEditUser = async () => {
    try {
      await dispatch(editUser(about));
      setIsEdit(false);
    } catch (e) {
      console.log(e);
    }
  };

  const handleEditUserAvatar = async () => {
    try {
      const formData = new FormData();
      formData.append('image', image);
      await dispatch(editUserAvatar(formData));
      dispatch(fetchUser(Number(id)));
    } catch (e) {
      console.log(e);
    }
  };

  const [openFollowers, setOpenFollowers] = useState(true);
  
  const handleOpenFollowers = (checkOpenFollowers: string) => {
    checkOpenFollowers === 'followers' ? setOpenFollowers(true) : setOpenFollowers(false);
    setIsModalFollowersOpen(true);
  }

  return (
    <div className={styles.userPage}>
      <div className='userProfile'>
        {status === 'loading' && <p>Loading...</p>}
        {error && <p>{error}</p>}
        {user && (
          <>
            <div className={styles.userAvatarContainer}>
              {authUser?.id === user.id ? (
                <img
                  src={`http://localhost:3001/` + user?.image || "default.jpg"}
                  alt=""
                  onClick={() => setIsModalOpen(true)}
                />
              ) : (
                <img
                  src={`http://localhost:3001/` + user?.image || "default.jpg"}
                  alt=""
                  onClick={() => setIsModalAvatarImageOpen(true)}
                />
              )
              }
            </div>
            <div className={styles.userAboutContainer}>
              <h1 className={styles.username}>{user.username}</h1>
              {authUser?.id === user.id ? (
                isEdit ? (
                  <div>
                    <input
                      type="text"
                      value={about}
                      onChange={(e) => setAbout(e.target.value)}
                    />
                    <button onClick={handleEditUser}>Сохранить</button>
                    <button onClick={() => setIsEdit(false)}>Отмена</button>
                  </div>
                ) : (
                  <div className={styles.aboutContainer}>
                    <p>{user.about?.length > 0 ? user.about : 'Добавить описание'}</p>
                    <img onClick={() => setIsEdit(true)} alt="edit" src={editIcon.src}/>
                  </div>
                )
              ) : (
                <p className={styles.aboutContainer}>{user.about}</p>
              )}
              {authUser?.id === user.id ? (
                <div>
                  <Modal
                    isOpen={isModalOpen}
                    setIsModalOpen={setIsModalOpen}
                    type='image'
                  >
                    <ModalEditAvatar user={user} />
                  </Modal>
              </div>
              ) : (
                <div className={styles.subsContainer}>
                  {blackListStatus === true ? (
                    <>
                      <div>Вы в черном списке этого пользователя</div>
                    </>
                  ) : isBlackListStatus === true ? (
                    <>
                    <div>Вы добавили пользователя в чёрный список</div>
                    </>
                  ) : (
                    <>
                      {followStatus === 0 && <button onClick={handleFollow}>Подписаться</button>}
                      {followStatus === 2 && <button onClick={handleFollow}>Подписаться в ответ</button>}
                      {followStatus === 3 && (
                        <div>
                          <button onClick={handleUnFollow}>Отписаться</button>
                        </div>
                      )}
                      {followStatus === 1 && <button onClick={handleUnFollow}>Отписаться</button>}
                    </>
                  )}
                  {settings?.canMessage === "everyone" && <Link href={`/dialogs/${user.id}`}><img src={sendIcon.src} alt='send message' className={styles.icon}/></Link>}
                  {settings?.canMessage === "mutuals" && followStatus === 3 && <Link href={`/dialogs/${user.id}`}><img src={sendIcon.src} alt='send message' className={styles.icon}/></Link>}
                  {isBlackListStatus ? (
                    <div onClick={() => handleBlackList("delete")}><img src={unBlackListIcon.src} alt='send message' className={styles.icon}/></div>
                  ) : (
                    <div onClick={() => handleBlackList("add")}><img src={blackListIcon.src} alt='send message' className={styles.icon}/></div>
                  )}
                </div>
              )}
              <div className={styles.followContainer}>
                <p onClick={() => handleOpenFollowers('followers')}>Подписчиков: {followers?.length}</p>
                <p onClick={() => handleOpenFollowers('following')}>Подписок: {following?.length}</p>
              </div>
              <Modal
                isOpen={isModalFollowersOpen}
                setIsModalOpen={setIsModalFollowersOpen}
                type='default'
              >
                <ModalFollowers
                  followers={followers}
                  following={following}
                  setIsModalOpen={setIsModalFollowersOpen}
                  openFollowers={openFollowers}
                  setOpenFollowers={setOpenFollowers}
                />
              </Modal>
            </div>
          </>
        )}
      </div>
      <Modal 
        isOpen={isModalAvatarImageOpen}
        setIsModalOpen={setIsModalAvatarImageOpen}
        type='image'
      >
        <img
          src={`http://localhost:3001/` + user?.image || "default.jpg"}
          alt=""
        />
      </Modal>
      <div>
        {user && authUser?.id === user.id && <CreatePost />}
        {blackListStatus ? (
          <p className={styles.blackList}>Пользователь добавил вас в чёрный список</p>
        ) : (
          (settings && settings.privateProfile === true && followStatus === 3) ||
          (settings && settings.privateProfile === false) ||
          (authUser && authUser?.id === Number(id)) ? (
            <>
              {posts.length > 0 ? (
                posts.map((post) => (
                  <Post key={post.id} post={post} socket={socket} sendMessage={sendMessage} />
                ))
              ) : (
                <p>No posts available</p>
              )}
            </>
          ) : (
            <p>Этот профиль приватный</p>
          )
        )}
      </div>
    </div>
  );
};

export default UserPage;

