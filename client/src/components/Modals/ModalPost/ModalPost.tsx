import { deletePost, createLike, deleteLike, createComment, deleteComment, deleteLikeComment, createLikeComment } from '@/features/posts/postsSlice';
import { RootState, AppDispatch } from '../../../store/store';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './ModalPost.module.scss';
import { fetchUserAPI } from '@/features/users/usersAPI';
import Comment from '../../Comment/Comment';
import Link from 'next/link';
import { deleteIcon, likeIcon, unLikeIcon, commentsIcon, downloadIcon, shareIcon } from '../../../assets/';
import { Post } from '../../../types/types';
import Modal from '@/components/ui/MyModal/Modal';
import ModalLikes from '../ModalLikes/ModalLikes';
import ImageSlider from '@/components/ImageSlider/ImageSlider';
import ModalShare from '../ModalShare/ModalShare';
import { formatDate } from '@/utils/dateUtils';
import axiosInstance from '@/utils/axiosInstance';

interface PostProps {
  post: Post;
  socket: any;
  authUser: any;
}

const PostModal: React.FC<PostProps> = ({ post, socket, authUser }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [commentText, setCommentText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalLikesOpen, setIsModalLikesOpen] = useState(false);
  const [isModalShareOpen, setIsModalShareOpen] = useState(false);
  const [followStatus, setFollowStatus] = useState<any>(null);

  const handleDeletePost = (postId: number) => {
    dispatch(deletePost(postId));
  };

  useEffect(() => {
    const fetchFollowStatus = async () => {
      if (post && post.User?.UserSetting?.canComment === 'mutuals') {
        try {
          const response = await axiosInstance.post(`/follows/searchCurrentFollower/${post.User.id}`);
          setFollowStatus(response.data);
        } catch (e) {
          console.log(e);
        }
      }
    };
    fetchFollowStatus();
  }, [post]);

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
        socket.emit('create_notification', notificationData);
      } catch (e) {
        console.log(e);
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
        socket.emit('create_notification', notificationData);
      } catch (e) {
        console.log(e);
      }
    }
  };

  const handleDeleteComment = async (postId: number, commentId: number) => {
    try {
      dispatch(deleteComment({ postId, commentId }));
    } catch (e) {
      console.log(e);
    }
  };

  const handleAddComment = async (postId: number, userId: number) => {
    try {
      dispatch(createComment({ postId, commentText }));
      setCommentText('');
      const notificationData = {
        type: 'comment',
        userId: Number(userId),
        actorId: authUser?.id,
        postId: postId,
      };
      socket.emit('create_notification', notificationData);
    } catch (e) {
      console.log(e);
    }
  };

  const sendMessage = (userId: number, postId: number, newMessage: string, e: React.FormEvent) => {
    e.preventDefault();
    if (authUser) {
      const messageData = {
        content: newMessage,
        receiverId: Number(userId),
        senderId: authUser?.id,
        type: 'share',
        postId: postId,
      };
      console.log(messageData);
      socket.emit('chat message', messageData);
    }
  };
  const formattedDate = formatDate(post.createdAt);
  const handleDownloadSources = () => {
    const baseURL = "http://localhost:3001/";

    post.sourceImages.forEach((imageSrc) => {
      fetch(baseURL + imageSrc)
        .then(response => response.blob())
        .then(blob => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;

          const fileName = imageSrc.split('/').pop() || 'source-image.jpg';
          link.download = fileName;

          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        })
        .catch(error => console.error('Ошибка при скачивании изображения:', error));
    });
  };

  return (
    <div className='post'>
      {post ? (
 <div className={styles.post}>
 <Link href={`/users/${post.User?.id}`}>
   <div className={styles.userContainer}>
     <img
       src={`http://localhost:3001/` + post.User?.image || 'default.jpg'}
       alt=""
       className={styles.avatar}
     />
     <div className={styles.userInfo}>
       <p className={styles.username}>{post.User?.username}</p>
       <p className={styles.date}>{formattedDate}</p>
     </div>
   </div>
 </Link>

 <p className={styles.postContent}>{post.content}</p>
 {post.images.length > 0 && (
   <div className={styles.imageSlider}>
     <ImageSlider images={post.images} />
   </div>
 )}

 {authUser?.id === post.userId && (
   <img
     src={deleteIcon.src}
     onClick={() => handleDeletePost(post.id)}
     className={styles.deleteButton}
     alt="Delete"
   />
 )}

 <div className={styles.likeComContainer}>
   <div className={styles.likeContainer}>
     {post.likeStatus ? (
       <img
         src={likeIcon.src}
         alt="like"
         onClick={() => handleLike(post.id, post.userId)}
         className={styles.likeButton}
       />
     ) : (
       <img
         src={unLikeIcon.src}
         alt="unlike"
         onClick={() => handleLike(post.id, post.userId)}
         className={styles.likeButton}
       />
     )}
     <p onClick={() => setIsModalLikesOpen(true)}>
       {post.Likes ? post.Likes.length : 0}
     </p>
   </div>

   <div className={styles.commentsContainer}>
     <img
       src={commentsIcon.src}
       alt="comments"
       className={styles.commentsButton}
       onClick={() => setIsModalOpen(true)}
     />
     <p>{post.Comments ? post.Comments.length : 0}</p>
   </div>
   <div className={styles.shareContainer}>
     <img
       src={shareIcon.src}
       alt="share"
       className={styles.commentsButton}
       onClick={() => setIsModalShareOpen(true)}
     />
   </div>
   <div className={styles.shareContainer}>
   {post.sourceImages.length > 0 && (
   <img onClick={handleDownloadSources} className={styles.downloadButton} src={downloadIcon.src} alt='download sources'/>
 )}
   </div>
 </div>
          {(post.User?.UserSetting?.canComment === 'everyone' ||
            (post.User?.UserSetting?.canComment === 'mutuals' && followStatus === 3) || (authUser?.id === post.User.id)) && (
              <div className={styles.sendCommentContainer}>
                <input placeholder='Есть что сказать?' value={commentText} onChange={(e) => setCommentText(e.target.value)} className={styles.input} />
                <button onClick={() => handleAddComment(post.id, post.userId)} className={styles.sendComment}>Отправить</button>
              </div>
            )}
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
                  setIsModalLikesOpen={setIsModalLikesOpen} />
              ))
            ) : (
              <></>
            )}
            <Modal
              isOpen={isModalLikesOpen}
              setIsModalOpen={setIsModalLikesOpen}
              type='default'
            >
              <ModalLikes likes={post.Likes} setIsModalOpen={setIsModalLikesOpen} />
            </Modal>
            {authUser && (
              <Modal isOpen={isModalShareOpen} setIsModalOpen={setIsModalShareOpen} type='default'>
                <ModalShare postId={post.id} sendMessage={sendMessage} setIsModalOpen={setIsModalShareOpen} />
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
