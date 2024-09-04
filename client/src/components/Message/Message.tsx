import Modal from '../ui/MyModal/Modal';
import PostModal from '../Modals/ModalPost/ModalPost';
import { formatDate } from '@/utils/dateUtils';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import React, { useEffect, useState, useRef } from 'react';
import { Post, User } from '@/types/types';
import axiosInstance from '@/utils/axiosInstance';
import ImageSlider from '../ImageSlider/ImageSlider';
import Link from 'next/link';
import styles from './Message.module.scss';
import { deleteIconMini, deleteIcon } from '../../assets/';
import { fetchPost } from '@/features/posts/postsSlice';

const Message: React.FC<any> = ({ message, authUser, handleDeleteMessage, socket, post }) => {
    const dispatch = useDispatch<AppDispatch>();
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (message.Post) {
            dispatch(fetchPost(message.Post.id));
        }
    }, [message.Post, dispatch, isModalOpen]);

    const handleOpenModal = () => {
        if (authUser && message.Post) {
            dispatch(fetchPost(message.Post.id));
            setIsModalOpen(true);
            console.log(post);
        }
    };

    return (
        <div>
            {message.type === 'message' ? (
                <div key={message.id} className={`userMessageContainer`}>
                    <div className={`${styles.userDetails} ${message.read === false ? styles.unread : ''}`}>
                        <Link href={`/users/${message.Sender?.id}`}>
                            <img
                                src={`http://localhost:3001/${message.Sender?.image || 'default.jpg'}`}
                                alt="User Avatar"
                                className={styles.avatar}
                            />
                        </Link>
                        <div className={styles.messageContent}>
                            {message.Sender?.id === authUser?.id && (
                                <img
                                    src={deleteIcon.src}
                                    alt="Delete"
                                    className={styles.deleteImage}
                                    onClick={() => handleDeleteMessage(message.id)}
                                />
                            )}

                            <div className={styles.userHeader}>
                                <Link href={`/users/${message.Sender?.id}`}>
                                    <p className={styles.username}>{message.Sender?.username}</p>
                                </Link>
                                <p className={styles.date}>{formatDate(message.createdAt)}</p>
                            </div>
                            <div className={styles.messageContents}>
                                <p className={styles.message}>{message.content}</p>
                                {message.images && message.images.length > 0 && (
                                    <div className={styles.imageSlider}>
                                        <ImageSlider images={message.images} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div key={message.id} className={`userMessageContainer`}>
                    <div className={`${styles.userDetails} ${message.read === false ? styles.unread : ''}`}>

                        <Link href={`/users/${message.Sender?.id}`}>
                            <img
                                src={`http://localhost:3001/${message.Sender?.image || 'default.jpg'}`}
                                alt="User Avatar"
                                className={styles.avatar}
                            />
                        </Link>
                        <div className={styles.messageContent}>
                            {message.Sender?.id === authUser?.id && (
                                <img
                                    src={deleteIcon.src}
                                    alt="Delete"
                                    className={styles.deleteImage}
                                    onClick={() => handleDeleteMessage(message.id)}
                                />
                            )}
                            
                            <div className={styles.userHeader}>
                                <Link href={`/users/${message.Sender?.id}`}>
                                    <p className={styles.username}>{message.Sender?.username}</p>
                                </Link>
                                <p className={styles.date}>{formatDate(message.createdAt)}</p>
                            </div>
                            <p className={styles.message}>{message.content}</p>
                            <div className={styles.messageContentShare}>
                                <div className={styles.userContainer}>
                                    <Link href={`/users/${message?.Post?.User?.id}`}>
                                        <img
                                            src={`http://localhost:3001/${message?.Post?.User?.image || 'default.jpg'}`}
                                            alt="Post Author Avatar"
                                            className={styles.avatar}
                                        />
                                        <p className={styles.username}>{message?.Post.User?.username}</p>
                                    </Link>
                                    <p onClick={handleOpenModal} className={styles.date}>
                                        {formatDate(message?.Post?.createdAt)}
                                    </p>
                                </div>
                                <p className={styles.postContent}>{message.Post.content}</p>
                                {message.Post.images.length > 0 && (
                                    <div className={styles.imageSlider}>
                                        <ImageSlider images={message.Post.images} />
                                    </div>
                                )}
                            </div>
                        </div>

                        <Modal isOpen={isModalOpen} setIsModalOpen={setIsModalOpen} type="default">
                            <PostModal socket={socket} post={post} authUser={authUser} />
                        </Modal>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Message;
