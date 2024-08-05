// src/pages/feed.tsx
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPosts } from '../../features/posts/postsSlice';
import { RootState, AppDispatch } from '../../store/store';
import Post from '../Post/Post';
import CreatePost from '../CreatePost/CreatePost';
import { fetchUserProfile } from '@/features/auth/authSlice';
import { useState } from 'react';
import styles from './FeedPage.module.scss'
import axiosInstance from '@/utils/axiosInstance';
const FeedPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { posts, status, error } = useSelector((state: RootState) => state.posts);
  const { user } = useSelector((state: RootState) => state.auth);
  useEffect(() => {
    if (user) {
      dispatch(fetchPosts(user.id));
    }
  }, [dispatch, user]);
  
  return (
    <div className={styles.feedPage}>
      <CreatePost />
      {status === 'loading' && <p>Loading...</p>}
      {error && <p>{error}</p>}
      {posts.length > 0 ? (
        posts.map((post) => (
          <div>
          <Post key={post.id} post={post}/>
          </div>
        ))
      ) : (
        <p>No posts available</p>
      )}
    </div>
  );
};

export default FeedPage;
