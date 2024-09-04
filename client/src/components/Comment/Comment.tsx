import styles from './Comment.module.scss';
import React, { useState } from 'react';
import Link from 'next/link';
import { Post, Comment as CommentType } from '../../types/types';
import { deleteIcon, likeIcon, unLikeIcon } from '../../assets/'; // Импортируем иконку
import Modal from '../ui/MyModal/Modal';
import ModalLikes from '../Modals/ModalLikes/ModalLikes';
import { formatDate } from '@/utils/dateUtils';

interface CommentProps {
  comment: CommentType;
  authUser: {
    id: number;
    username: string;
    email: string;
    image: string;
  } | null;
  post: Post;
  handleDeleteComment: (postId: number, commentId: number) => void;
  handleLikeComment: (commentId: number, userId: number) => void;
  setIsModalLikesOpen: any;
}

const Comment: React.FC<CommentProps> = ({ comment, authUser, post, handleDeleteComment, setIsModalLikesOpen, handleLikeComment }) => {

  const [isModalLikesComsOpen, setIsModalLikesComsOpen] = useState(false);

  const formattedDate = formatDate(comment.createdAt);

  return (
    <div className={styles.comment}>
      <Link href={`/users/${comment.User?.id}`} onClick={() => setIsModalLikesOpen(false)}>
        <div className={styles.userContainer}>
          <img
            src={`http://localhost:3001/` + comment.User?.image || "default.jpg"}
            alt=""
            className={styles.avatar}
          />
          <div className={styles.commentContent}>
            <div className={styles.header}>
              <p className={styles.username}>{comment.User?.username}</p>
              <p className={styles.date}>{formattedDate}</p>
            </div>
            <p className={styles.text}>{comment?.content}</p>
          </div>
        </div>
      </Link>

      <div className={styles.actions}>
        <div className={styles.likeContainer}>
          {comment.likeStatus ? (
            <img src={likeIcon.src} alt="like" onClick={() => handleLikeComment(comment.id, comment.userId)} className={styles.likeButton} />
          ) : (
            <img src={unLikeIcon.src} alt="unlike" onClick={() => handleLikeComment(comment.id, comment.userId)} className={styles.likeButton} />
          )}
          <p onClick={() => setIsModalLikesComsOpen(true)}>
            {comment.LikeComs ? comment.LikeComs?.length : 0}
          </p>
        </div>
        {authUser?.id === comment?.userId || authUser?.id === post.userId ? (
          <img src={deleteIcon.src} onClick={() => handleDeleteComment(post.id, comment.id)} className={styles.deleteButton} alt="Delete" />
        ) : null}
      </div>
      
      <Modal
        isOpen={isModalLikesComsOpen}
        setIsModalOpen={setIsModalLikesComsOpen}
        type="default"
      >
        <ModalLikes likes={comment.LikeComs} setIsModalOpen={setIsModalLikesComsOpen} />
      </Modal>
    </div>
  );
};

export default Comment;
