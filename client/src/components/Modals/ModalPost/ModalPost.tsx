import { deleteComment, createComment } from '@/features/posts/postsSlice';
import { RootState, AppDispatch } from '../../../store/store';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './ModalPost.module.scss'
import { fetchUserAPI } from '@/features/users/usersAPI';
import Comment from '../../Comment/Comment';
import Link from 'next/link';
import {deleteIcon, likeIcon, unLikeIcon, commentsIcon} from '../../../assets/'; // Импортируем иконку
import { Post } from '../../../types/types';

interface PostProps {
  post: Post;
  handleDeletePost: (postId: number) => void;
  handleLike: (postId: number, userId: number) => void;
  date: string;
  setIsModalLikesOpen: any;
}

const PostModal: React.FC<PostProps> = ({ post, handleDeletePost, handleLike, date, setIsModalLikesOpen}) => {
  const dispatch = useDispatch<AppDispatch>();
  const authUser = useSelector((state: RootState) => state.auth.user);
  const [commentText, setCommentText] = useState('');

const handleDeleteComment = async (postId: number, commentId: number) => {
    try {
      dispatch(deleteComment({postId, commentId}))
    } catch (e) {
      console.log(e)
    }
  }  

  const handleAddComment = async (postId: number) => {
    try {
      dispatch(createComment({postId, commentText}))
      setCommentText('')
    } catch (e) {
      console.log(e)
    }
  }  

  return (
    <div className='post'>
    <Link href={`/users/${post.User?.id}`} onClick={() => setIsModalLikesOpen(false)}>
      <div className={styles.userContainer}>
        <img
          src={`http://localhost:3001/` + post.User?.image || "default.jpg"}
          alt=""
          className={styles.avatar}
        />
        <div></div>
        <p className={styles.username}>{post.User?.username}</p>
        <p className={styles.date}>{date}</p>
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
        <img src={commentsIcon.src} alt="comments" className={styles.commentsButton}/>
        <p>{post.Comments ? post.Comments.length : 0}</p>
      </div>

    </div>
    <div className={styles.sendCommentContainer}>
      <input placeholder='Есть что сказать?' value={commentText} onChange={(e) => setCommentText(e.target.value)} className={styles.input} />
      <button onClick={() => handleAddComment(post.id)} className={styles.sendComment}>Отправить</button>
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
            setIsModalLikesOpen={setIsModalLikesOpen}/>
          ))
        ) : (
          <></>
        )
      }
      
      </div>
    </div>
  );
};

export default PostModal;
