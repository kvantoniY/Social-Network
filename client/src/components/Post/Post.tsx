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
import { Post as PostType, Comment as CommentType } from '../../types/types';
import ModalLikes from '../Modals/ModalLikes/ModalLikes';
import {deleteIcon, likeIcon, unLikeIcon, commentsIcon} from '../../assets/'; // Импортируем иконку

interface PostProps {
  post: PostType;
}

const Post: React.FC<PostProps> = ({ post }) => {
  const dispatch = useDispatch<AppDispatch>();
  const authUser = useSelector((state: RootState) => state.auth.user);
  const [commentText, setCommentText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalLikesOpen, setIsModalLikesOpen] = useState(false);

  const emptyComment: CommentType = {
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
 <img src={deleteIcon.src} onClick={() => handleDeletePost(post.id)} className={styles.deleteButton} alt="Delete" />
      ) : (
        <></>
      )}
      <div className={styles.likeComContainer}>

        <div className={styles.likeContainer}>
          {post.likeStatus ? (
            <img src={likeIcon.src} alt="like"  onClick={() => handleLike(post.id, post.userId)} className={styles.likeButton}/>
          ) : (
            <img src={unLikeIcon.src} alt="unlike"  onClick={() => handleLike(post.id, post.userId)} className={styles.likeButton}/>
            )}
          <p onClick={() => setIsModalLikesOpen(true)}>
            {post.Likes ? post.Likes?.length : 0}
          </p>
        </div>

        <div className={styles.commentsContainer}>
          <img src={commentsIcon.src} alt="comments" className={styles.commentsButton} onClick={() => setIsModalOpen(true)}/>
          <p>{post.Comments ? post.Comments.length : 0}</p>
        </div>

      </div>
      <div className={styles.sendCommentContainer}>
        <input placeholder='Есть что сказать?' value={commentText} onChange={(e) => setCommentText(e.target.value)} className={styles.input} />
        <button onClick={() => handleAddComment(post.id)} className={styles.sendComment}>Отправить</button>
      </div>
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
             <p onClick={() => setIsModalOpen(true)} className={styles.showMoreComments}>Показать все комментарии...</p>
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
        date={formattedDate}
        handleDeletePost={handleDeletePost}
        handleLike={handleLike}
        setIsModalLikesOpen={setIsModalLikesOpen}
        />
      </Modal>
      <Modal
        isOpen={isModalLikesOpen}
        setIsModalOpen={setIsModalLikesOpen}
      >
        <ModalLikes likes={post.Likes}/>
      </Modal>
    </div>
  );
};

export default Post;
