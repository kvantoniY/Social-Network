import React, { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../../store/store';
import { editUserAvatar, fetchUser } from '@/features/users/usersSlice';
import { fetchUserProfile } from '@/features/auth/authSlice';
import { fetchUserPosts } from '@/features/posts/postsSlice';
import { useRouter } from 'next/router';
import styles from './ModalEditAvatar.module.scss';

interface ModalEditAvatarProps {
  user: any;
}

const ModalEditAvatar: React.FC<ModalEditAvatarProps> = ({ user }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [image, setImage] = useState<any>(null);
  const router = useRouter();
  const { id } = router.query;
  const [selectImage, setSelectImage] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null); // Ссылка на input

  const selectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImage(e.target.files[0]);
      setSelectImage(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleEditUserAvatar = async () => {
    try {
      const formData = new FormData();
      formData.append('image', image);
      await dispatch(editUserAvatar(formData));
      dispatch(fetchUserProfile());
      dispatch(fetchUser(Number(id)));
      dispatch(fetchUserPosts(Number(id)));
    } catch (e) {
      console.log(e);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click(); // Открыть выбор файла по клику на аватар
  };

  return (
    <div className={styles.modalContainer}>
      <div className={styles.avatarPreview} onClick={handleAvatarClick}>
        {image !== null ? (
          <img src={selectImage} alt="Selected" />
        ) : (
          <img
            src={`http://localhost:3001/${user?.image || "default.jpg"}`}
            alt="User avatar"
          />
        )}
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={selectFile}
        className={styles.hiddenFileInput} // Скрытый input
      />
      <div className={styles.buttonContainer}>
        <button className={styles.editButton} onClick={handleEditUserAvatar}>
          Изменить аватар
        </button>
      </div>
    </div>
  );
};

export default ModalEditAvatar;
