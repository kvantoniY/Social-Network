import { deleteComment, createComment, fetchPosts, fetchUserPosts } from '@/features/posts/postsSlice';
import { RootState, AppDispatch } from '../../../store/store';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './ModalEditAvatar.module.scss'
import { editUserAvatar, fetchUser } from '@/features/users/usersSlice';
import { fetchUserProfile } from '@/features/auth/authSlice';
import { useRouter } from 'next/router';


interface ModalEditAvatarProps {
  user: any;
}

const ModalEditAvatar: React.FC<ModalEditAvatarProps> = ({user}) => {
  const dispatch = useDispatch<AppDispatch>();
  const authUser = useSelector((state: RootState) => state.auth.user);
  const [image, setImage] = useState<any>(null);
  const router = useRouter();
  const { id } = router.query;
  const [selectImage, setSelectImage] = useState<any>(null);
  const selectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImage(e.target.files[0]);
      setSelectImage(URL.createObjectURL(e.target.files[0]));
      console.log(image)
    }
  };
  const handleEditUserAvatar = async () => {
    try {
      const formData = new FormData();
      formData.append('image', image);
      await dispatch(editUserAvatar(formData))
      dispatch(fetchUserProfile())
      dispatch(fetchUser(Number(id)))
      dispatch(fetchUserPosts(Number(id)))
    } catch (e) {
      console.log(e)
    }
  }
  return (
    <div>
              <div>
                {image !== null ? (
                  <div>
                    <img src={selectImage} alt="Selected" style={{ maxWidth: '360px', maxHeight: '240px' }} />
                  </div>
                ) : (
                  <div>
                  <img
                    src={`http://localhost:3001/` + user?.image || "default.jpg"}
                    alt=""
                    style={{ maxWidth: '360px', maxHeight: '240px' }}
                  />
                  </div>
                )}
                <input type="file" onChange={selectFile} />
                <button onClick={handleEditUserAvatar}>Изменить аватар</button>
              </div>
    </div>
  );
};

export default ModalEditAvatar;
