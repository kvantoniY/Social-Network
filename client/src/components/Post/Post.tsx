import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import {
  deletePost,
  createLike,
  deleteLike,
  createComment,
  deleteComment,
  deleteLikeComment,
  createLikeComment
} from '@/features/posts/postsSlice';
import { RootState, AppDispatch } from '@/store/store';
import Comment from '@/components/Comment/Comment';
import Modal from '@/components/ui/MyModal/Modal';
import PostModal from '@/components/Modals/ModalPost/ModalPost';
import ModalLikes from '@/components/Modals/ModalLikes/ModalLikes';
import ImageSlider from '@/components/ImageSlider/ImageSlider';
import ModalShare from '@/components/Modals/ModalShare/ModalShare';
import { formatDate } from '@/utils/dateUtils';
import axiosInstance from '@/utils/axiosInstance';
import { emptyComment } from '@/utils/constants';
import {
  deleteIcon,
  likeIcon,
  unLikeIcon,
  commentsIcon,
  shareIcon,
  downloadIcon,
  sendIcon
} from '@/assets';
import styles from './Post.module.scss';
import { Post as PostType } from '@/types/types';

interface PostProps {
  post: PostType;
  sendMessage: (userId: number, postId: number, newMessage: string, e: React.FormEvent) => void;
  socket: any;
}

const Post: React.FC<PostProps> = ({ post, sendMessage, socket }) => {
  const dispatch = useDispatch<AppDispatch>();
  const authUser = useSelector((state: RootState) => state.auth.user);
  const [commentText, setCommentText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalLikesOpen, setIsModalLikesOpen] = useState(false);
  const [isModalShareOpen, setIsModalShareOpen] = useState(false);
  const [followStatus, setFollowStatus] = useState<any>(null);

  useEffect(() => {
    const fetchFollowStatus = async () => {
      if (post && post.User?.UserSetting?.canComment === 'mutuals') {
        try {
          const response = await axiosInstance.post(
            `/follows/searchCurrentFollower/${post.User.id}`
          );
          setFollowStatus(response.data);
          console.log(`Follow status: ${followStatus}`);
          console.log(
            `Post User Settings: ${post.User.UserSetting.canComment}`
          );
        } catch (e) {
          console.log(e);
        }
      }
    };
    fetchFollowStatus();
  }, [post]);

  const formattedDate = formatDate(post.createdAt);

  const handleDeletePost = (postId: number) => {
    dispatch(deletePost(postId));
  };

  const handleDownloadSources = () => {
    const baseURL = 'http://localhost:3001/';

    post.sourceImages.forEach((imageSrc) => {
      fetch(baseURL + imageSrc)
        .then((response) => response.blob())
        .then((blob) => {
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
        .catch((error) =>
          console.error('Ошибка при скачивании изображения:', error)
        );
    });
  };

  const handleLike = async (postId: number, userId: number) => {
    if (post.likeStatus) {
      dispatch(deleteLike(postId));
    } else {
      try {
        dispatch(createLike(postId));
        if (post.User?.UserSetting?.likeNotifications) {
          const notificationData = {
            type: 'like',
            userId: Number(userId),
            actorId: authUser?.id,
            postId: postId
          };
          socket.emit('create_notification', notificationData); // Присоединение к комнате пользователя
        }
      } catch (e) {
        console.log(e);
      }
    }
  };

  const handleLikeComment = async (commentId: number, userId: number) => {
    const comment = post.Comments.find((comment) => comment.id === commentId);
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
            commentId: commentId
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
      dispatch(deleteComment({ postId, commentId }));
    } catch (e) {
      console.log(e);
    }
  };

  const handleAddComment = async (postId: number, userId: number) => {
    try {
      dispatch(createComment({ postId, commentText }));
      setCommentText('');
      if (post.User?.UserSetting?.commentNotifications) {
        const notificationData = {
          type: 'comment',
          userId: Number(userId),
          actorId: authUser?.id,
          postId: postId
        };
        socket.emit('create_notification', notificationData); // Присоединение к комнате пользователя
      }
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className='post'>
      <div>
        <div className={styles.userContainer}>
          <Link href={`/users/${post.User?.id}`}>
            <img
              src={`http://localhost:3001/` + post.User?.image || 'default.jpg'}
              alt=""
              className={styles.avatar}
            />
          </Link>
          <div className={styles.userInfo}>
          <Link href={`/users/${post.User?.id}`}>
            <p className={styles.username}>{post.User?.username}</p>
            </Link>
            <p className={styles.date} onClick={() => setIsModalOpen(true)}>{formattedDate}</p>
          </div>
        </div>
      </div>


      <p className={styles.postContent} onClick={() => setIsModalOpen(true)}>{post.content}</p>
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
            <img onClick={handleDownloadSources} className={styles.downloadButton} src={downloadIcon.src} alt='download sources' />
          )}
        </div>
      </div>


      {(post.User?.UserSetting?.canComment === 'everyone' ||
        (post.User?.UserSetting?.canComment === 'mutuals' &&
          followStatus === 3) ||
        authUser?.id === post.User.id) && (
          <div className={styles.sendCommentContainer}>
            <input
              placeholder="Есть что сказать?"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className='inputSendComment'
            />
            <img src={sendIcon.src} alt="Send" className={styles.sendComment} onClick={() => handleAddComment(post.id, post.userId)} />
          </div>
        )}

      {post.Comments?.length > 0 && (
        <div>
          <Comment
            comment={post.Comments?.slice().pop() ?? emptyComment}
            key={post.Comments?.slice().pop()?.id ?? 0}
            authUser={authUser}
            post={post}
            handleDeleteComment={handleDeleteComment}
            handleLikeComment={handleLikeComment}
            setIsModalLikesOpen={setIsModalLikesOpen}
          />
          <p
            onClick={() => setIsModalOpen(true)}
            className={styles.showMoreComments}
          >
            Показать все комментарии...
          </p>
        </div>
      )}

      <Modal isOpen={isModalOpen} setIsModalOpen={setIsModalOpen} type="post">
        <PostModal post={post} socket={socket} authUser={authUser} />
      </Modal>

      <Modal
        isOpen={isModalLikesOpen}
        setIsModalOpen={setIsModalLikesOpen}
        type="default"
      >
        <ModalLikes likes={post.Likes} setIsModalOpen={setIsModalLikesOpen} />
      </Modal>

      {authUser && (
        <Modal
          isOpen={isModalShareOpen}
          setIsModalOpen={setIsModalShareOpen}
          type="default"
        >
          <ModalShare
            postId={post.id}
            sendMessage={sendMessage}
            setIsModalOpen={setIsModalShareOpen}
          />
        </Modal>
      )}
    </div>
  );
};

export default Post;
