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
import { io } from 'socket.io-client';
const FeedPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { posts, status, error } = useSelector((state: RootState) => state.posts);
  const { user } = useSelector((state: RootState) => state.auth);
  const [socket, setSocket] = useState<any>(null);
  useEffect(() => {
    if (user) {
      dispatch(fetchPosts(user.id));
      const newSocket = io(':3001');
      setSocket(newSocket);
      newSocket.emit('join', user?.id);
    }
  }, [dispatch, user]);
  
  const sendMessage = (userId: number, postId: number, newMessage: string, e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      const messageData = {
        content: newMessage,
        receiverId: Number(userId),
        senderId: user?.id,
        type: "share",
        postId: postId
      };
      console.log(messageData)
      socket.emit('chat message', messageData);
    }
  }
  return (
    <div className={styles.feedPage}>
      <CreatePost />
      {status === 'loading' && <p>Loading...</p>}
      {error && <p>{error}</p>}
      {posts.length > 0 ? (
        posts.map((post) => (
          <div>
            <Post key={post.id} post={post} sendMessage={sendMessage} socket={socket}/>
          </div>
        ))
      ) : (
        <p>No posts available</p>
      )}
    </div>
  );
};

export default FeedPage;
