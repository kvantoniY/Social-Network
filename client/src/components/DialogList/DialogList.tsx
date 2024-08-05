// components/DialogsList.tsx
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import io from 'socket.io-client';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { User } from '../../types/types';
import styles from './DialogList.module.scss';
import { Dialog as DialogType } from '../../types/types'

const DialogsList: React.FC = () => {
  const router = useRouter();
  const [dialogs, setDialogs] = useState<DialogType[]>([]);
  const [socket, setSocket] = useState<any>(null);
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    if (user) {
      const newSocket = io(':3001');
      setSocket(newSocket);
      newSocket.emit('join', user.id); // Присоединение к комнате пользователя
      newSocket.on('dialogs update', (updatedDialogs: DialogType[]) => {
        setDialogs(updatedDialogs);
      });

      // Запрос на получение текущих диалогов
      newSocket.emit('get dialogs', user.id);

      return () => {
        newSocket.off('dialogs update');
        newSocket.close();
      };
    }
  }, [user]);

  const openDialog = (dialogUserId: number, dialogId: number) => {
    router.push(`/dialogs/${dialogUserId}`);
  };

  return (
    <div className={styles.dialogList}>
      <h2>Ваши диалоги</h2>
      <div>
        {dialogs.map(dialog => (
          <div key={dialog.id} onClick={() => openDialog(dialog.User1.id, dialog.dialogId)} className={styles.followContainer}>
            <img
              src={`http://localhost:3001/` + (dialog?.User1.image || "default.jpg")}
              alt=""
              className={styles.avatar}
            />
            <div>{dialog.User1.username}</div>
            {dialog.unreadCount !== 0 ? <div>({dialog.unreadCount})</div> : <div></div>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DialogsList;
