import { fetchPosts, deletePost, createLike, deleteLike, createComment, deleteComment } from '@/features/posts/postsSlice';
import { RootState, AppDispatch } from '../../store/store';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';;
import styles from './Post.module.scss'
import { fetchUserProfile } from '@/features/auth/authSlice';
import { fetchUserAPI } from '@/features/users/usersAPI';
import Comment from '../Comment/Comment';
import Link from 'next/link';
import Modal from '../ui/Modal';
import PostModal from '../Modals/ModalPost/ModalPost';

import { Post } from '../../types/types';
import ModalLikes from '../Modals/ModalLikes/ModalLikes';

interface PostProps {
  post: Post;
}

const Post: React.FC<PostProps> = ({ post }) => {
  const dispatch = useDispatch<AppDispatch>();
  const authUser = useSelector((state: RootState) => state.auth.user);
  const [commentText, setCommentText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalLikesOpen, setIsModalLikesOpen] = useState(false);

  const emptyComment: Comment = {
    id: 0,
    content: '',
    userId: 0,
    postId: 0,
    createdAt: '',
    updatedAt: '',
    User: {
      id: 0,
      username: '',
      email: '',
      role: 'User',
      image: '',
      createdAt: '',
      updatedAt: '',
    },
  };

const isoDateString = post.createdAt;
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

  const handleDeletePost = (postId: number) => {
    dispatch(deletePost(postId));
  };

  const handleLike = async (postId: number, userId: number) => {
    if (post.likeStatus) {
      dispatch(deleteLike(postId));
    } else {
      dispatch(createLike(postId));
    }
  };

  const handleDeleteComment = async (postId: number, commentId: number) => {
    try {
      dispatch(deleteComment({ postId, commentId }))
    } catch (e) {
      console.log(e)
    }
  }

  const handleAddComment = async (postId: number) => {
    try {
      dispatch(createComment({ postId, commentText }))
      setCommentText('')
    } catch (e) {
      console.log(e)
    }
  } 

  
  return (
    <div className='post'>
      <Link href={`/users/${post.User?.id}`}>
        <div className={styles.userContainer}>
          <img
            src={`http://localhost:3001/` + post.User?.image || "default.jpg"}
            alt=""
            className={styles.avatar}
          />
          <div></div>
          <p className={styles.username}>{post.User?.username}</p>
          <p className={styles.date}>{formattedDate}</p>
        </div>
      </Link>
 
      <p className={styles.postContent}>{post.content}</p>
      <img
        src={`http://localhost:3001/` + post?.image || "default.jpg"}
        alt=""
        className={styles.postImage}
      />
      {authUser?.id === post.userId ? (
        <button onClick={() => handleDeletePost(post.id)} className={styles.deleteButton}>DELETE POST</button>
      ) : (
        <></>
      )}
      <div className={styles.likeComContainer}>
        <button onClick={() => handleLike(post.id, post.userId)} className={styles.likeButton}>{post.likeStatus ? 'Unlike' : 'Like'}</button>
        <p onClick={() => setIsModalLikesOpen(true)}>
          ({post.Likes ? post.Likes?.length : 0})
        </p>
        <button>Comments: {post.Comments ? post.Comments.length : 0}</button>
      </div>
      <input placeholder='comment' value={commentText} onChange={(e) => setCommentText(e.target.value)} className={styles.input} />
      <button onClick={() => handleAddComment(post.id)}>Отправить комментарий</button>
      <div>
        {post.Comments?.length > 0 ? (
          <>
            {/* Отображение последнего комментария */}
            <Comment
              comment={post.Comments?.slice().pop()  ?? emptyComment}
              key={post.Comments?.slice().pop()?.id ?? 0}
              authUser={authUser}
              post={post}
              handleDeleteComment={handleDeleteComment}
            />
          </>
        ) : (
          <></>
        )}
      </div>
      <Modal
        isOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
      >
         <PostModal
        post={post} 
        handleDeletePost={handleDeletePost}
        handleLike={handleLike}
        />
      </Modal>
      <Modal
        isOpen={isModalLikesOpen}
        setIsModalOpen={setIsModalLikesOpen}
      >
        <ModalLikes likes={post.Likes}/>
      </Modal>
      <button onClick={() => setIsModalOpen(true)}>Открыть пост</button>
    </div>
  );
};

export default Post;
