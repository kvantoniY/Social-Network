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
import {editIcon} from '@/assets'
import Link from 'next/link';
import io from 'socket.io-client';
import axiosInstance from '@/utils/axiosInstance';
import { Dialog } from '@/types/types';
import { AddBlackListAPI, CheckBlackListAPI, DeleteBlackListAPI } from '@/features/users/usersAPI';

const UserPage = () => {
  const router = useRouter();
  let { id } = router.query;

  const dispatch = useDispatch<AppDispatch>();
  const { user, status, error } = useSelector((state: RootState) => state.users);
  const { followStatus, followers, following } = useSelector((state: RootState) => state.follows);
  const { posts } = useSelector((state: RootState) => state.posts);
  const authUser = useSelector((state: RootState) => state.auth.user);
  const [dialogId, setDialogId] = useState(null);
  const [about, setAbout] = useState('');
  const [image, setImage] = useState<any>(null);
  const [isEdit, setIsEdit] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalFollowersOpen, setIsModalFollowersOpen] = useState(false);
  const [socket, setSocket] = useState<any>(null);
  const [blackListStatus, setBlackListStatus] = useState(false);
  const [isBlackListStatus, setIsBlackListStatus] = useState(false);
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
          
          const response = await axiosInstance.get(`/users/checkBlackList/${userId}`)
          if(response.data.isBlackList) {
            setIsBlackListStatus(true)
          }
          if(response.data.blUser) {
            setBlackListStatus(true)
          }
        } catch (e) {
          console.log(e)
        }
      }
      dispatch(fetchUser(Number(id)));
      dispatch(fetchUserPosts(Number(id)));
      dispatch(searchFollowers(Number(id)));
      dispatch(searchFollowing(Number(id)));
      dispatch(searchCurrentFollower(Number(id)));
      const findDialogId = async () => {
        try {
          const response = await axiosInstance.post('/messages/dialog', { id: numericId })
          if (response.data) {
            setDialogId(response.data.dialogId)
          } else {

          }
          console.log("resp data null")
        } catch (e) {
          console.log(e)
        }
        console.log(dialogId)
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
      newSocket.emit('join', authUser?.id); // Присоединение к комнате пользователя

      return () => {
        newSocket.close();
      };
    }
  }, [authUser]);

  const handleBlackList = async (status: string) => {
    if (status === "add") {
      try {
        const response = await AddBlackListAPI(Number(id))
        setIsBlackListStatus(true)
      } catch (e) {
        console.log(e)
      }
    } else {
      try {
        const response = await DeleteBlackListAPI(Number(id))
        setIsBlackListStatus(false)
      } catch (e) {
        console.log(e)
      }
    }
  }

  const handleFollow = async () => {
    try {
      await dispatch(follow(Number(id)));
      const notificationData = {
        type: 'follow',
        userId: Number(id),
        actorId: Number(authUser?.id),
      };
      socket.emit('create_notification', notificationData); // Присоединение к комнате пользователя
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
      setAbout('');
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
      setAbout('');
    } catch (e) {
      console.log(e);
    }
  };
  const [openFollowers, setOpenFollowers] = useState(true)
  
  const handleOpenFollowers = (checkOpenFollowers: string) => {
    checkOpenFollowers === 'followers' ? setOpenFollowers(true) : setOpenFollowers(false);
    setIsModalFollowersOpen(true)
  }

  return (
    <div className={styles.userPage}>
      <div className='userProfile'>
        {status === 'loading' && <p>Loading...</p>}
        {error && <p>{error}</p>}
        {user && (
          <>
           <div className={styles.userAvatarContainer}>
            <img
              src={`http://localhost:3001/` + user?.image || "default.jpg"}
              alt=""
              style={{ maxWidth: '360px', maxHeight: '240px' }}
              onClick={() => setIsModalOpen(true)}
            />
            </div>
            <div className={styles.userAboutContainer}>
            <h1 className={styles.username}>{user.username}</h1>
            {authUser?.id === user.id ? (
              <div>
                <Modal
                  isOpen={isModalOpen}
                  setIsModalOpen={setIsModalOpen}
                >
                  <ModalEditAvatar
                    user={user}
                  />
                </Modal>
                {isEdit ? (
                  <div className={styles.editAboutContainer}>
                    <input type="text" value={about} onChange={(e) => setAbout(e.target.value)} />
                    <button onClick={handleEditUser}>Готово</button>
                  </div>
                ) : (
                  <div className={styles.editAboutContainer}>
                    <div className={styles.about}>{user.about}</div>
                    {authUser?.id === user.id && (
                    <>
                        <div>{user.about?.length < 1 || user.about === null ? <div>Добавить описание</div> : <></>}</div>
                        <img src={editIcon.src} onClick={() => setIsEdit(true)}/>
                    </>
                    )}

                  </div>
                )}
              </div>
            ) : (
              <div className={styles.subsContainer}>
                {blackListStatus ? (
                  <>
                   
                  </>
                ) : (
                  <>
                  {followStatus === 0 && <button onClick={handleFollow}>Подписаться</button>}
                {followStatus === 2 && <button onClick={handleFollow}>Подписаться в ответ</button>}
                {followStatus === 3 && (
                  <div>
                    <button onClick={handleUnFollow}>Отписаться</button>
                    <Link href={`/dialogs/${user.id}`}>Написать</Link>
                  </div>
                )}
                {followStatus === 1 && <button onClick={handleUnFollow}>Отписаться</button>}
                  </>
                )}
                
                {isBlackListStatus ? <div onClick={() => handleBlackList("delete")}>Убрать ЧС</div> : <div onClick={() => handleBlackList("add")}>Добавить в ЧС</div>}
                
              </div>
            )}
            <div className={styles.followContainer}>
                <p onClick={() => handleOpenFollowers('followers')}>Подписчиков: {followers?.length}</p>
                <p onClick={() => handleOpenFollowers('following')}>Подписок: {following?.length}</p>
            </div>
            <Modal
              isOpen={isModalFollowersOpen}
              setIsModalOpen={setIsModalFollowersOpen}
            >
              <ModalFollowers followers={followers} following={following} setIsModalOpen={setIsModalFollowersOpen} openFollowers={openFollowers} setOpenFollowers={setOpenFollowers}/>
            </Modal>
            </div>
           
          </>
          
        )}
        
      </div>
      <div>
        {user && authUser?.id === user.id && <CreatePost />}
        {blackListStatus ? (
          <>
            <p className={styles.blackList}>Пользователь добавил вас в чёрный список</p>
          </>
        ) : (
          <>
            {posts.length > 0 ? (
              posts.map((post) => (
                <Post key={post.id} post={post} />
              ))
            ) : (
              <p>No posts available</p>
            )}
          </>
        )}

      </div>
    </div>
  );
};

export default UserPage;
