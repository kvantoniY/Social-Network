import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { fetchUser } from '@/features/users/usersSlice';
import io from 'socket.io-client';
import styles from './Dialog.module.scss';
import Link from 'next/link';
import { deleteIconMini, deleteIcon, addImageIcon, sendIcon } from '../../assets/';
import { User } from '@/types/types';
import axiosInstance from '@/utils/axiosInstance';
import ImageSlider from '../ImageSlider/ImageSlider';
import { Message as MessageType } from '../../types/types'
import Modal from '../ui/MyModal/Modal';
import PostModal from '../Modals/ModalPost/ModalPost';
import { formatDate } from '@/utils/dateUtils';
import Message from '../Message/Message';
import { fetchCurrentUserSettings } from '@/features/settings/settingsSlice';
import { searchCurrentFollower } from '@/features/follows/followSlice';

const Dialog: React.FC = () => {
  const router = useRouter();
  const { userId } = router.query;
  const [newMessage, setNewMessage] = useState<string>('');
  const authUser = useSelector((state: RootState) => state.auth.user);
  const dialogUser = useSelector((state: RootState) => state.users.user);
  const [socket, setSocket] = useState<any>(null);
  const [socketMessages, setSocketMessages] = useState<MessageType[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const { followStatus, followers, following } = useSelector((state: RootState) => state.follows);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const dispatch = useDispatch<AppDispatch>();
  const { settings } = useSelector((state: RootState) => state.settings);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [blackListStatus, setBlackListStatus] = useState(false);
  const [isBlackListStatus, setIsBlackListStatus] = useState(false);
  
  const post = useSelector((state: RootState) => state.posts.posts[0]);

  useEffect(() => {
    if (userId && authUser) {
      dispatch(fetchUser(Number(userId)));
      dispatch(fetchCurrentUserSettings(Number(userId)))
      dispatch(searchCurrentFollower(Number(userId)));
      const newSocket = io(':3001');
      setSocket(newSocket);
      newSocket.emit('join', authUser?.id);
      newSocket.emit('open dialog', Number(authUser.id), Number(userId));

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
      };

      const fetchSocketMessages = async () => {
        try {
          newSocket.on('get messages', (msg: MessageType[]) => {
            setSocketMessages(msg);
            scrollToBottom();
          });
          newSocket.on('chat message', (msg: MessageType) => {
            setSocketMessages((msgs: any) => [...msgs, msg]);
            scrollToBottom();
          });
          newSocket.on('delete message', (msg: MessageType) => {
            setSocketMessages((msgs: MessageType[]) => {
              const updatedMessages = msgs.filter(message => message.id !== msg.id);
              return updatedMessages;
            });
          });
          newSocket.emit('get messages', Number(authUser?.id), Number(userId));
        } catch (e) {
          console.log(e);
        }
      };
      checkBlackListStatus();
      fetchSocketMessages();

      return () => {
        if (newSocket) {
          newSocket.emit('close dialog', Number(authUser.id), Number(userId));
          newSocket.off('get messages');
          newSocket.off('chat message');
          newSocket.off('delete message');
          newSocket.close();
        }
      };
    }
  }, [dispatch, userId, authUser]);

  useEffect(() => {
    scrollToBottom();
  }, [socketMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView();
  };

  const sendSocketMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() && images.length === 0) return;

    const imagePromises = images.map(file => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    try {
      const encodedImages = await Promise.all(imagePromises);
      const messageData = {
        content: newMessage,
        receiverId: Number(userId),
        senderId: authUser?.id,
        images: encodedImages,
      };
      console.log(messageData)
      socket.emit('chat message', messageData);
      setNewMessage('');
      setImages([]);
      setImagePreviews([]);
      if (contentRef.current) {
        contentRef.current.textContent = '';
      }
    } catch (error) {
      console.error('Failed to encode images:', error);
    }
  };

  const selectFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);

      const totalImages = images.length + selectedFiles.length;

      if (totalImages > 5) {
        alert('Вы не можете добавить больше 5 изображений.');
        return;
      }

      setImages((prevImages) => [...prevImages, ...selectedFiles]);
      const selectedPreviews = selectedFiles.map(file => URL.createObjectURL(file));
      setImagePreviews((prevPreviews) => [...prevPreviews, ...selectedPreviews]);
    }
  };

  const handleDeleteImage = (index: number) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
    setImagePreviews((prevPreviews) => prevPreviews.filter((_, i) => i !== index));
  };

  const handleDeleteMessage = (messageId: number) => {
    try {
      socket.emit('delete message', messageId, authUser?.id, dialogUser?.id);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className='dialogContainer'>
      <Link href={`/users/${dialogUser?.id}`}>
        <div className='dialogUserContainer'>
          <img src={`http://localhost:3001/${dialogUser?.image || 'default.jpg'}`} alt="Avatar" className={styles.dialogAvatar} />
          <p>{dialogUser?.username}</p>
        </div>
      </Link>
      <div className='messageContainer'>
        {socketMessages.map(message => (
          <Message message={message} authUser={authUser} handleDeleteMessage={handleDeleteMessage} socket={socket} post={post}/>
        ))}
        <div ref={messagesEndRef} />
      </div>
      {blackListStatus ? (
        <p>Пользователь добавил вас в чёрный список</p>
      ) : isBlackListStatus ? (
        <p>Вы добавили пользователя в чёрный список</p>
      ) : (
        (settings && settings.canMessage === 'mutuals' && followStatus === 3) || (settings && settings.canMessage === "everyone") ? (
        <>
<form onSubmit={sendSocketMessage} className='createMessage'>
  <div className='inputContainer'>
    <label htmlFor="fileInput" className={styles.iconButton}>
      <img src={addImageIcon.src} alt="Add image" />
    </label>
    <input
      id="fileInput"
      type="file"
      onChange={selectFiles}
      multiple
      style={{ display: 'none' }} // Скрываем инпут, но он связан с label
    />

    <div
      contentEditable
      ref={contentRef}
      className={styles.inputCreatePost}
      onInput={(e) => setNewMessage(e.currentTarget.textContent || '')}
      suppressContentEditableWarning={true}
    />
    
    <button type="submit" className={styles.submitButton}>
      <img src={sendIcon.src} alt="Send" />
    </button>
  </div>
</form>
{imagePreviews.length > 0 && (
    <div className={styles.imagePreviewContainer}>
      {imagePreviews.map((preview, index) => (
        <div key={index} className={styles.imagePreviewWrapper}>
          <img src={preview} alt="Preview" className={styles.imagePreview} />
          <img
            src={deleteIconMini.src}
            alt="Delete"
            className={styles.deleteImage}
            onClick={() => handleDeleteImage(index)}
          />
        </div>
      ))}
    </div>
  )}
        </>
      ) : (
        <>
        <div>Этот пользователь ограничил возможность писать ему сообщения</div>
        </>
      )
      )}
    </div>
  );
};

export default Dialog;
