import React from 'react'
import { useState, useRef, useEffect } from 'react'
import styles from './ModalShare.module.scss'
import { Dialog as DialogType } from '@/types/types'
import axiosInstance from '@/utils/axiosInstance';

interface ModalShareProps {
    sendMessage: (userId: number, postId: number, newMessage: string, e: React.FormEvent) => void;
    postId: number
    setIsModalOpen: any
}

const ModalShare: React.FC<ModalShareProps> = ({sendMessage, postId, setIsModalOpen}) => {
    const [newMessage, setNewMessage] = useState("");
    const contentRef = useRef<HTMLDivElement>(null);
    const [dialogs, setDialogs] = useState<DialogType[]>([]);
    const [userId, setUserId] = useState<any>(null)

    useEffect(() => {
        const findDialogs = async () => {
            try {
                const response: any = await axiosInstance.get('/messages/dialogs')
                setDialogs(response.data)
                if (response.data.length > 0) {
                  setUserId(response.data[0].User1.id);
              }
            } catch (e) {
                console.log(e)
            }
        }
        findDialogs();
    }, [])
    
    const handleSend = (e: React.FormEvent ) => {
        setIsModalOpen(false)
        sendMessage(userId, postId, newMessage, e)
    }
    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedUserId = Number(e.target.value);
        setUserId(selectedUserId);
    };
  return (
    <div>
        <h1>Поделиться постом</h1>
        <select onChange={handleSelectChange}>
            {dialogs.map(dialog => (
                <option key={dialog.id} className={styles.followContainer} value={dialog.User1.id}>
                <img
                  src={`http://localhost:3001/` + (dialog?.User1.image || "default.jpg")}
                  alt=""
                  className={styles.avatar}
                />
                <div>{dialog.User1.username}</div>
              </option>
            ))}
        </select>
        <form onSubmit={(e) => handleSend(e)} className='createPost'>
      <div
        contentEditable
        ref={contentRef}
        className='inputCreatePost'
        onInput={(e) => setNewMessage(e.currentTarget.textContent || '')}
        suppressContentEditableWarning={true}
      />
      
      <hr className={styles.separator} />
      <div className={styles.actions}>
        <button type="submit" className={styles.buttonPost}>Отправить</button>
      </div>
    </form>
    </div>
  )
}

export default ModalShare