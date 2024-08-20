import { deletePost, createLike, deleteLike, createComment, deleteComment, deleteLikeComment, createLikeComment } from '@/features/posts/postsSlice';
import { RootState, AppDispatch } from '../../../store/store';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './ModalPost.module.scss'
import { fetchUserAPI } from '@/features/users/usersAPI';
import Comment from '../../Comment/Comment';
import Link from 'next/link';
import {deleteIcon, likeIcon, unLikeIcon, commentsIcon} from '../../../assets/'; // Импортируем иконку
import { Post } from '../../../types/types';
import Modal from '@/components/ui/MyModal/Modal';
import ModalLikes from '../ModalLikes/ModalLikes';
import ImageSlider from '@/components/ImageSlider/ImageSlider';
import ModalShare from '../ModalShare/ModalShare';
import { formatDate } from '@/utils/dataUtils';

interface PostProps {
  post: Post;
  socket: any;
  authUser: any
}

const PostModal: React.FC<PostProps> = ({ post, socket, authUser }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [commentText, setCommentText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalLikesOpen, setIsModalLikesOpen] = useState(false);
  const [isModalShareOpen, setIsModalShareOpen] = useState(false);
  const handleDeletePost = (postId: number) => {
    dispatch(deletePost(postId));
  };

  const handleLike = async (postId: number, userId: number) => {
    if (post.likeStatus) {
      dispatch(deleteLike(postId));
    } else {
      try {
        dispatch(createLike(postId));
        const notificationData = {
          type: 'like',
          userId: Number(userId),
          actorId: authUser?.id,
          postId: postId,
        };
        socket.emit('create_notification', notificationData); // Присоединение к комнате пользователя
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
        const notificationData = {
          type: 'likeCom',
          userId: Number(userId),
          actorId: authUser?.id,
          postId: post.id,
          commentId: commentId,
        };
        socket.emit('create_notification', notificationData); // Присоединение к комнате пользователя
      } catch (e) {
        console.log(e);
      }
    }
  };

const handleDeleteComment = async (postId: number, commentId: number) => {
    try {
      dispatch(deleteComment({postId, commentId}))
    } catch (e) {
      console.log(e)
    }
  }  

  const handleAddComment = async (postId: number, userId: number) => {
    try {
      dispatch(createComment({ postId, commentText }))
      setCommentText('')
      const notificationData = {
        type: 'comment',
        userId: Number(userId),
        actorId: authUser?.id,
        postId: postId,
      };
      socket.emit('create_notification', notificationData); // Присоединение к комнате пользователя
    } catch (e) {
      console.log(e)
    }
  }
  const sendMessage = (userId: number, postId: number, newMessage: string, e: React.FormEvent) => {
    e.preventDefault();
    if (authUser) {
      const messageData = {
        content: newMessage,
        receiverId: Number(userId),
        senderId: authUser?.id,
        type: "share",
        postId: postId
      };
      console.log(messageData)
      socket.emit('chat message', messageData);
    }
  }
  
  return (
    <div className='post'>
      {post ? (
      <div>      
      <Link href={`/users/${post.User?.id}`}>
        <div className={styles.userContainer}>
          <img
            src={`http://localhost:3001/` + post.User?.image || "default.jpg"}
            alt=""
            className={styles.avatar}
          />
          <p className={styles.username}>{post.User?.username}</p>
          <p className={styles.date}>{formatDate(post.createdAt)}</p>
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
      <div className={styles.sendCommentContainer}>
        <input placeholder='Есть что сказать?' value={commentText} onChange={(e) => setCommentText(e.target.value)} className={styles.input} />
        <button onClick={() => handleAddComment(post.id, post.userId)} className={styles.sendComment}>Отправить</button>
      </div>
      <div>
        {post.Comments?.length > 0 ? (
          post.Comments.map(comment => (
            <Comment 
            comment={comment} 
            key={comment?.id} 
            authUser={authUser} 
            post={post} 
            handleDeleteComment={handleDeleteComment}
            handleLikeComment={handleLikeComment}
            setIsModalLikesOpen={setIsModalLikesOpen}/>
          ))
        ) : (
          <></>
        )
      }
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
      </div>) : (
        <div>loading...</div>
      )}
    </div>
  );
};

export default PostModal;
