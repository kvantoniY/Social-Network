import { fetchUserAPI } from '@/features/users/usersAPI';
import styles from './Comment.module.scss'
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Post, Comment as CommentType, User, Like } from '../../types/types';
import {deleteIcon} from '../../assets/'; // Импортируем иконку

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
    setIsModalLikesOpen: any;
  }

const Comment: React.FC<CommentProps> = ({comment, authUser, post, handleDeleteComment, setIsModalLikesOpen}) => {
  const isoDateString = comment.createdAt;
const dateObject = new Date(isoDateString);

// Получаем день и месяц
const day = dateObject.getDate();
const monthNames = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];
const monthIndex = dateObject.getMonth();
const monthName = monthNames[dateObject.getMonth()]; // Индексация начинается с 0, поэтому getMonth() возвращает 0 для января

// Получаем время
const hours = dateObject.getHours().toString().padStart(2, '0'); // Добавляем ведущий ноль, если необходимо
const minutes = dateObject.getMinutes().toString().padStart(2, '0'); // Добавляем ведущий ноль, если необходимо

// Формируем итоговую строку
const formattedDate = `${day} ${monthName}, ${hours}:${minutes}`;
  return (
    <div className='comment'>
            <Link href={`/users/${comment.User?.id}`} onClick={() => setIsModalLikesOpen(false)}>
           <div className={styles.userContainer}>
            <img
            src={`http://localhost:3001/` + comment.User?.image || "default.jpg"}
            alt=""
            className={styles.avatar}
          />
          <p className={styles.username}>{comment.User?.username}</p>
          <p className={styles.date}>{formattedDate}</p>
          </div>
          </Link>
          
          <p className={styles.postContent}>{comment?.content}</p>
          {authUser?.id === comment?.userId || authUser?.id === post.userId ? (
           <img src={deleteIcon.src} onClick={() => handleDeleteComment(post.id, comment.id)} className={styles.deleteButton} alt="Delete"/>
          ) : (
          <></>
          )}

          </div>
  )
}

export default Comment