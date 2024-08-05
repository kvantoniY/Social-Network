import { Like, LikeCom } from '@/types/types';
import React from 'react'
import styles from './ModalLikes.module.scss'
import Link from 'next/link';

interface ModalLikesProps {
  likes: Like[] | LikeCom[];
  setIsModalOpen: any;
}

const ModalLikes: React.FC<ModalLikesProps> = ({ likes, setIsModalOpen }) => {
  return (
    <div>
      {likes.length > 0 ? (
        <>
          {likes.map(like => (
            <Link href={`/users/${like.User?.id}`} onClick={() => setIsModalOpen(false)}>
              <div className={styles.followContainer}>
                <img
                  src={`http://localhost:3001/` + like.User?.image || "default.jpg"}
                  alt=""
                  className={styles.avatar}
                />
                <p>{like.User?.username}</p>
              </div>
            </Link>
          ))}
        </>
      ) : (
        <p>Пока никто не поставил лайк :(</p>
      )}

    </div>
  )
}

export default ModalLikes