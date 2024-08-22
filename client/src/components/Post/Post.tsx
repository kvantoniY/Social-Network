import { deletePost, createLike, deleteLike, createComment, deleteComment, deleteLikeComment, createLikeComment } from '@/features/posts/postsSlice';
import { RootState, AppDispatch } from '../../store/store';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';;
import styles from './Post.module.scss'
import Comment from '../Comment/Comment';
import Link from 'next/link';
import Modal from '@/components/ui/MyModal/Modal';
import PostModal from '../Modals/ModalPost/ModalPost';
import { Post as PostType, Comment as CommentType, Like } from '../../types/types';
import ModalLikes from '../Modals/ModalLikes/ModalLikes';
import {deleteIcon, likeIcon, unLikeIcon, commentsIcon} from '../../assets/'; // Импортируем иконку
import ImageSlider from '../ImageSlider/ImageSlider';
import ModalShare from '../Modals/ModalShare/ModalShare';
import { formatDate } from '@/utils/dataUtils';

interface PostProps {
  post: PostType;
  sendMessage: (userId: number, postId: number, newMessage: string, e: React.FormEvent) => void
  socket: any
}

const Post: React.FC<PostProps> = ({ post, sendMessage, socket }) => {
  const dispatch = useDispatch<AppDispatch>();
  const authUser = useSelector((state: RootState) => state.auth.user);
  const [commentText, setCommentText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalLikesOpen, setIsModalLikesOpen] = useState(false);
  const [isModalShareOpen, setIsModalShareOpen] = useState(false);
  const emptyComment: any = {
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

  const formattedDate = formatDate(post.createdAt);

  const handleDeletePost = (postId: number) => {
    dispatch(deletePost(postId));
  };

  const handleDownloadSources = () => {
    const baseURL = "http://localhost:3001/";

    post.sourceImages.forEach((imageSrc) => {
      fetch(baseURL + imageSrc)
        .then(response => response.blob())
        .then(blob => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;

          // Генерация имени файла для скачивания
          const fileName = imageSrc.split('/').pop() || 'source-image.jpg';
          link.download = fileName;

          // Обработка клика по ссылке для скачивания файла
          document.body.appendChild(link);
          link.click();

          // Удаление ссылки из DOM после скачивания
          document.body.removeChild(link);

          // Очистка URL-объекта
          window.URL.revokeObjectURL(url);
        })
        .catch(error => console.error('Ошибка при скачивании изображения:', error));
    });
  };

  const handleLike = async (postId: number, userId: number) => {
    if (post.likeStatus) {
      dispatch(deleteLike(postId));
    } else {
      try {
        dispatch(createLike(postId));
        console.log(post.User.UserSetting.likeNotifications)
        if (post.User?.UserSetting?.likeNotifications) {
        const notificationData = {
          type: 'like',
          userId: Number(userId),
          actorId: authUser?.id,
          postId: postId,
        };
        socket.emit('create_notification', notificationData); // Присоединение к комнате пользователя
        console.log(post.User.UserSetting?.likeNotifications)
        }
        console.log(post.User.UserSetting)
      } catch (e) {
        console.log(e)
      }

    }
  };
  const handleLikeComment = async (commentId: number, userId: number) => {
    const comment = post.Comments.find(comment => comment.id === commentId);
    if (comment?.likeStatus) {
      dispatch(deleteLikeComment(commentId));
    } else {
      try {
        dispatch(createLikeComment(commentId));
        if (post.User?.UserSetting?.likeNotifications) {
        const notificationData = {
          type: 'likeCom',
          userId: Number(userId),
          actorId: authUser?.id,
          postId: post.id,
          commentId: commentId,
        };
        socket.emit('create_notification', notificationData); // Присоединение к комнате пользователя
        }
        
      } catch (e) {
        console.log(e);
      }
    }
  };

  const handleDeleteComment = async (postId: number, commentId: number) => {
    try {
      dispatch(deleteComment({ postId, commentId }))
    } catch (e) {
      console.log(e)
    }
  }

  const handleAddComment = async (postId: number, userId: number) => {
    try {
      dispatch(createComment({ postId, commentText }))
      setCommentText('')
      if (post.User?.UserSetting?.commentNotifications) {
      const notificationData = {
        type: 'comment',
        userId: Number(userId),
        actorId: authUser?.id,
        postId: postId,
      };
      socket.emit('create_notification', notificationData); // Присоединение к комнате пользователя
    }
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
          <p className={styles.username}>{post.User?.username}</p>
          <p className={styles.date}>{formattedDate}</p>
        </div>
      </Link>
 
      <p className={styles.postContent}>{post.content}</p>
       {post.images.length > 0 && (
          <div className={styles.imageSlider}>
            <ImageSlider images={post.images} />
          </div>
      )}

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
        <div className={styles.shareContainer}>
          <img src={commentsIcon.src} alt="comments" className={styles.commentsButton} onClick={() => setIsModalShareOpen(true)}/>
        </div>
      </div>
      {post.sourceImages.length > 0 && (
                    <button onClick={handleDownloadSources}>
                        Download Source Images
                    </button>
                )}
      <div className={styles.sendCommentContainer}>
        <input placeholder='Есть что сказать?' value={commentText} onChange={(e) => setCommentText(e.target.value)} className={styles.input} />
        <button onClick={() => handleAddComment(post.id, post.userId)} className={styles.sendComment}>Отправить</button>
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
              handleLikeComment={handleLikeComment}
              setIsModalLikesOpen={setIsModalLikesOpen}
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
        socket={socket}
        authUser={authUser}
        />
      </Modal>
      <Modal
        isOpen={isModalLikesOpen}
        setIsModalOpen={setIsModalLikesOpen}
      >
        <ModalLikes likes={post.Likes} setIsModalOpen={setIsModalLikesOpen}/>
      </Modal>
      {authUser && (
        <Modal isOpen={isModalShareOpen} setIsModalOpen={setIsModalShareOpen}>
          <ModalShare postId={post.id} sendMessage={sendMessage} setIsModalOpen={setIsModalShareOpen}/>
        </Modal>
      )}

    </div>
  );
};

export default Post;
