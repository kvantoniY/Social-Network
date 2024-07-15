import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { editUser, editUserAvatar, fetchUser } from '../../features/users/usersSlice';
import { RootState, AppDispatch } from '../../store/store';
import { follow, searchCurrentFollower, searchFollowers, searchFollowing, unFollow } from '@/features/follows/followSlice';
import CreatePost from '@/components/CreatePost/CreatePost';
import { fetchUserPosts } from '@/features/posts/postsSlice';
import Post from '@/components/Post/Post';
import { useState } from 'react'
import ModalEditAvatar from '@/components/Modals/ModalEditAvatar/ModalEditAvatar';
import Modal from '@/components/ui/Modal';
import ModalFollowers from '@/components/Modals/ModalFollowers/ModalFollowers';

const ProfilePage = () => {
  const router = useRouter();
  const { id } = router.query;
  const dispatch = useDispatch<AppDispatch>();
  const { user, status, error } = useSelector((state: RootState) => state.users);
  const { followStatus } = useSelector((state: RootState) => state.follows);
  const { posts } = useSelector((state: RootState) => state.posts);
  const authUser = useSelector((state: RootState) => state.auth.user);
  const { followers } = useSelector((state: RootState) => state.follows);
  const { following } = useSelector((state: RootState) => state.follows);
  const [about, setAbout] = useState('')
  const [image, setImage] = useState<any>(null);
  const [isEdit, setIsEdit] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalFollowersOpen, setIsModalFollowersOpen] = useState(false);
  const selectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImage(e.target.files[0]);
    }
  };

  useEffect(() => {
    if (id) {
      dispatch(fetchUser(Number(id)));
      dispatch(fetchUserPosts(Number(id)));
      dispatch(searchFollowers(Number(id)));
      dispatch(searchFollowing(Number(id)));
      dispatch(searchCurrentFollower(Number(id)))
    }
  }, [dispatch, id]);

  const handleFollow = async () => {
    try {
      await dispatch(follow(Number(id)))
    } catch (e) {
      console.log(e)
    }
  }
  const handleUnFollow = async () => {
    try {
      await dispatch(unFollow(Number(id)))
    } catch (e) {
      console.log(e)
    }
  }
  const handleEditUser = async () => {
    try {
      await dispatch(editUser(about))
      setAbout('')
      setIsEdit(false)
    } catch (e) {
      console.log(e)
    }
  }
  const handleEditUserAvatar = async () => {
    try {
      const formData = new FormData();
      formData.append('image', image);
      await dispatch(editUserAvatar(formData))
      dispatch(fetchUser(Number(id)));
      setAbout('')
    } catch (e) {
      console.log(e)
    }
  }
  
  return (
    <div>
      <h2>User Profile</h2>
      {status === 'loading' && <p>Loading...</p>}
      {error && <p>{error}</p>}
      {user && (
        <div>
          <p>Username: {user.username}</p>
          <p>Email: {user.email}</p>
          <p>{user.about}</p>
          <button onClick={() => setIsModalFollowersOpen(true)}>Followers: {followers?.length}</button>
          <button onClick={() => setIsModalFollowersOpen(true)}>Following: {following?.length}</button>
          <Modal
            isOpen={isModalFollowersOpen}
            setIsModalOpen={setIsModalFollowersOpen}
            >
              <ModalFollowers followers={followers} following={following}/>
          </Modal>
          <img
                    src={`http://localhost:3001/` + user?.image || "default.jpg"}
                    alt=""
                    style={{ maxWidth: '360px', maxHeight: '240px' }}
                  />
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
              <button onClick={() => setIsModalOpen(true)}>Изменить аватар</button>
              {isEdit ? (
                <>
                  <input type="text" value={about} onChange={(e) => setAbout(e.target.value)} />
                  <button onClick={handleEditUser}>Готово</button>
                </>
              ) : (
                <>
                  <p>{about}</p>
                  <button onClick={() => setIsEdit(true)}>Изменить информацию</button>
                </>
              )}
              <CreatePost />
            </div>
          ) : (
            <>
              {followStatus === 0 && <button onClick={() => handleFollow()}>Подписаться</button>}
              {followStatus === 2 && <button onClick={() => handleFollow()}>Подписаться в ответ</button>}
              {followStatus === 3 && <button onClick={() => handleUnFollow()}>Отписаться</button>}
              {followStatus === 1 && <button onClick={() => handleUnFollow()}>Отписаться</button>}
            </>
          )}
          {posts.length > 0 ? (

            posts.map((post) => (
              <div>
                <Post key={post.id} post={post}/>
              </div>
            )
            )

          ) : (
            <p>No posts available</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
