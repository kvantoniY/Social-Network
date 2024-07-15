import { deleteComment, createComment } from '@/features/posts/postsSlice';
import { RootState, AppDispatch } from '../../../store/store';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './ModalPost.module.scss'
import { fetchUserAPI } from '@/features/users/usersAPI';
import Comment from '../../Comment/Comment';
import Link from 'next/link';

import { Post } from '../../../types/types';

interface PostProps {
  post: Post;
  handleDeletePost: (postId: number) => void;
  handleLike: (postId: number, userId: number) => void;
}

const PostModal: React.FC<PostProps> = ({ post, handleDeletePost, handleLike}) => {
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
                  <Link href={`/users/${post.userId}`}>
      <div className={styles.userContainer}>
      <img
            src={`http://localhost:3001/` + post.User?.image || "default.jpg"}
            alt=""
            className={styles.avatar}
          />
      <p className={styles.username}>{post.User?.username}</p>
     </div>
     </Link>
      <hr/>
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
        <button onClick={() => handleLike(post.id, post.userId)} className={styles.likeButton}>{post.likeStatus ? 'Unlike' : 'Like'} ({post.Likes ? post.Likes?.length : 0})</button>
        <button>Comments: {post.Comments ? post.Comments.length : 0}</button>
      </div>
      <input placeholder='comment' value={commentText} onChange={(e) => setCommentText(e.target.value)} className={styles.input}/>
      <button onClick={() => handleAddComment(post.id)}>Отправить комментарий</button>
      <div>
      {post.Comments?.length > 0 ? (
          post.Comments.map(comment => (
            <Comment comment={comment} key={comment?.id} authUser={authUser} post={post} handleDeleteComment={handleDeleteComment}/>
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
