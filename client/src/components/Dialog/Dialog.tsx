import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { useRouter } from 'next/router';
import axiosInstance from '@/utils/axiosInstance';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { fetchMessages } from '@/features/dialogs/dialogsSlice';
import { User } from '../../types/types';
import io from 'socket.io-client';
import styles from './Dialog.module.scss';
import { fetchUser } from '@/features/users/usersSlice';
import Link from 'next/link';
import { deleteIconMini, deleteIcon } from '../../assets/';
import { fetchUserProfile } from '@/features/auth/authSlice';
import { useSearchParams } from 'next/dist/client/components/navigation';


interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  image?: string;
  createdAt: string;
  read: boolean;
  Sender: User;
  Receiver: User;
}

const Dialog: React.FC = () => {
  const router = useRouter();
  const { userId } = router.query;
  const searchParams = useSearchParams();
  const dialogId = searchParams.get('dialog')
  const [newMessage, setNewMessage] = useState<string>('');
  const user = useSelector((state: RootState) => state.auth.user);
  const dialogUser = useSelector((state: RootState) => state.users.user);
  const [socket, setSocket] = useState<any>(null);
  const [socketMessages, setSocketMessages] = useState<Message[]>([]);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
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
      newSocket.emit('join', user?.id); // Присоединение к комнате пользователя
      newSocket.emit('open dialog', Number(user.id), Number(userId)); // Сообщаем серверу об открытии диалога
      const checkBlackListStatus = async () => {
        try {

          const response = await axiosInstance.get(`/users/checkBlackList/${userId}`)
          if (response.data.isBlackList) {
            setIsBlackListStatus(true)
          }
          if (response.data.blUser) {
            setBlackListStatus(true)
          }
        } catch (e) {
          console.log(e)
        }
      }
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
              console.log('Updated messages:', updatedMessages);
              console.log('Original messages:', msgs);
              return updatedMessages;
            });
          });
          newSocket.emit('get messages', Number(user?.id), Number(userId), Number(dialogId));
        } catch (e) {
          console.log(e);
        }
      };
      checkBlackListStatus();
      fetchSocketMessages();

      return () => {

        if (newSocket) {
          newSocket.emit('close dialog', Number(user.id), Number(userId)); // Сообщаем серверу о закрытии диалога
          newSocket.off('get messages');
          newSocket.off('chat message');
          newSocket.off('delete message');
          newSocket.close();
        }
      };
    }
  }, [dispatch, userId, user, dialogId]);

  useEffect(() => {
    scrollToBottom();
  }, [socketMessages]);


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView();
  };

  const sendSocketMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() && !image) return;
    console.log(dialogId)
    const reader = new FileReader();
    reader.onloadend = () => {
      const messageData = {
        content: newMessage,
        receiverId: Number(userId),
        senderId: user?.id,
        image: image ? reader.result : null,
        dialogId: Number(dialogId)
      };
      socket.emit('chat message', messageData);
      setNewMessage('');
      setImage(null);
      setImagePreview(null);
      if (contentRef.current) {
        contentRef.current.textContent = '';
      }
    };

    if (image) {
      reader.readAsDataURL(image);
    } else {
      const messageData = {
        content: newMessage,
        receiverId: Number(userId),
        senderId: user?.id,
        dialogId: Number(dialogId)
      };
      socket.emit('chat message', messageData);
      setNewMessage('');
      if (contentRef.current) {
        contentRef.current.textContent = '';
      }
    }
  };

  const selectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
      setImagePreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleDeleteImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const handleDeleteMessage = (messageId: number) => {
    try {
      socket.emit('delete message', messageId, user?.id, dialogUser?.id);
    } catch (e) {
      console.log(e)
    }

  }

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
                {message.Sender?.id === user?.id ? <img src={deleteIcon.src} alt="Preview" className={styles.deleteImage} onClick={() => handleDeleteMessage(message.id)} /> : <div></div>}

                <div className={styles.userHeader}>
                  <Link href={`/users/${message.Sender?.id}`}>
                    <p className={styles.username}>{message.Sender?.username}</p>
                  </Link>
                  <p className={styles.date}>{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <div className={styles.messageContents}>
                  <p className={styles.message}>{message.content}</p>{message.read ? 'true' : "false"}
                  {message.image && <img src={`http://localhost:3001/${message.image}`} alt="message image" className={styles.messageImage} />}
                </div>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      {blackListStatus ? (
        <>
          <p>Пользователь добавил вас в чёрный список</p>
        </>
      ) : isBlackListStatus ? (
        <>
          <p>Вы добавили пользователя в чёрный список</p>
        </>
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
            {imagePreview && (
              <div>
                <div className={styles.imagePreviewContainer}>
                  <img src={imagePreview} alt="Preview" className={styles.imagePreview} />
                  <img src={deleteIconMini.src} alt="Delete" className={styles.deleteImage} onClick={handleDeleteImage} />
                </div>
              </div>
            )}
            <hr className={styles.separator} />
            <div className={styles.actions}>
              <label htmlFor="fileInput" className={styles.fileLabel}>
                <input
                  id="fileInput"
                  type="file"
                  onChange={selectFile}
                  style={{ display: 'none' }}
                  className={styles.inputFile}
                />
              </label>
              <button type="submit" className={styles.buttonPost}>Опубликовать</button>
            </div>
          </form>
        </>
      )}

    </div>
  );
};

export default Dialog;
