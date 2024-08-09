import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { fetchUser } from '@/features/users/usersSlice';
import io from 'socket.io-client';
import styles from './Dialog.module.scss';
import Link from 'next/link';
import { deleteIconMini, deleteIcon } from '../../assets/';
import { User } from '@/types/types';
import axiosInstance from '@/utils/axiosInstance';
import ImageSlider from '../ImageSlider/ImageSlider';

interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  images?: string[];
  createdAt: string;
  read: boolean;
  Sender: User;
  Receiver: User;
}

const Dialog: React.FC = () => {
  const router = useRouter();
  const { userId } = router.query;

  const [newMessage, setNewMessage] = useState<string>('');
  const user = useSelector((state: RootState) => state.auth.user);
  const dialogUser = useSelector((state: RootState) => state.users.user);
  const [socket, setSocket] = useState<any>(null);
  const [socketMessages, setSocketMessages] = useState<Message[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const dispatch = useDispatch<AppDispatch>();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [blackListStatus, setBlackListStatus] = useState(false);
  const [isBlackListStatus, setIsBlackListStatus] = useState(false);

  useEffect(() => {
    if (userId && user) {
      dispatch(fetchUser(Number(userId)));
      const newSocket = io(':3001');
      setSocket(newSocket);
      newSocket.emit('join', user?.id);
      newSocket.emit('open dialog', Number(user.id), Number(userId));

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
          newSocket.on('get messages', (msg: Message[]) => {
            setSocketMessages(msg);
            scrollToBottom();
          });
          newSocket.on('chat message', (msg: Message) => {
            setSocketMessages((msgs: any) => [...msgs, msg]);
            scrollToBottom();
          });
          newSocket.on('delete message', (msg: Message) => {
            setSocketMessages((msgs: Message[]) => {
              const updatedMessages = msgs.filter(message => message.id !== msg.id);
              return updatedMessages;
            });
          });
          newSocket.emit('get messages', Number(user?.id), Number(userId));
        } catch (e) {
          console.log(e);
        }
      };
      checkBlackListStatus();
      fetchSocketMessages();

      return () => {
        if (newSocket) {
          newSocket.emit('close dialog', Number(user.id), Number(userId));
          newSocket.off('get messages');
          newSocket.off('chat message');
          newSocket.off('delete message');
          newSocket.close();
        }
      };
    }
  }, [dispatch, userId, user]);

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
        senderId: user?.id,
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
      socket.emit('delete message', messageId, user?.id, dialogUser?.id);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className={styles.dialogContainer}>
      <Link href={`/users/${dialogUser?.id}`}>
        <div className='dialogUserContainer'>
          <img src={`http://localhost:3001/${dialogUser?.image || 'default.jpg'}`} alt="Avatar" className={styles.dialogAvatar} />
          <p>{dialogUser?.username}</p>
        </div>
      </Link>
      <div className='messageContainer'>
        {socketMessages.map(message => (
          <div key={message.id} className={`${styles.userContainer} ${message.read === false ? styles.unread : ''}`}>
            <div className={styles.userDetails}>
              <Link href={`/users/${message.Sender?.id}`}>
                <img
                  src={`http://localhost:3001/${message.Sender?.image || 'default.jpg'}`}
                  alt=""
                  className={styles.avatar}
                />
              </Link>
              <div className={styles.messageContent}>
                {message.Sender?.id === user?.id ? (
                  <img src={deleteIcon.src} alt="Preview" className={styles.deleteImage} onClick={() => handleDeleteMessage(message.id)} />
                ) : <div></div>}

                <div className={styles.userHeader}>
                  <Link href={`/users/${message.Sender?.id}`}>
                    <p className={styles.username}>{message.Sender?.username}</p>
                  </Link>
                  <p className={styles.date}>{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <div className={styles.messageContents}>
                  <p className={styles.message}>{message.content}</p>
                  {message.images && 
                    <ImageSlider images={message.images} />
                  }
                </div>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      {blackListStatus ? (
        <p>Пользователь добавил вас в чёрный список</p>
      ) : isBlackListStatus ? (
        <p>Вы добавили пользователя в чёрный список</p>
      ) : (
        <>
          <form onSubmit={sendSocketMessage} className='createMessage'>
            <div
              contentEditable
              ref={contentRef}
              className='inputCreatePost'
              onInput={(e) => setNewMessage(e.currentTarget.textContent || '')}
              suppressContentEditableWarning={true}
            />
            {imagePreviews.length > 0 && (
              <div className={styles.imagePreviewContainer}>
                {imagePreviews.map((preview: any, index: any) => (
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
            <hr className={styles.separator} />
            <div className={styles.actions}>
              <label htmlFor="fileInput" className={styles.fileLabel}>
                <input
                  id="fileInput"
                  type="file"
                  onChange={selectFiles}
                  multiple
                  style={{ display: 'none' }}
                  className={styles.fileInput}
                />
              </label>
              <button type="submit" className={styles.submitButton}>Отправить</button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default Dialog;
