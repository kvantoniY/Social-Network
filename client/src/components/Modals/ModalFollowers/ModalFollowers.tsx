import {useState } from 'react'
import styles from './ModalFollowers.module.scss'
import Link from 'next/link';

interface Follower {
    id: number;
    username: string;
    image: string;
}

interface ModalFollowersProps {
    followers: Follower[];
    following: Follower[];
    setIsModalOpen: any;
    openFollowers: any;
    setOpenFollowers: any;
}

const ModalFollowers: React.FC<ModalFollowersProps> = ({ followers, following, setIsModalOpen, openFollowers, setOpenFollowers }) => {

    return (
        <div>
            <button onClick={() => setOpenFollowers(true)} className={openFollowers ? styles.active : ''}>Подписчики</button>
            <button onClick={() => setOpenFollowers(false)} className={!openFollowers ? styles.active : ''}>Подписки</button>
            {openFollowers ? (
            <div>
           
            {followers.map(follower => (
                <Link href={`/users/${follower.id}`} onClick={() => setIsModalOpen(false)}>
                <div className={styles.followContainer}>
                <img
                src={`http://localhost:3001/` + follower?.image || "default.jpg"}
                alt=""
                className={styles.avatar}
            />
                            <p>{follower.username}</p>
            </div>
            </Link>
            ))}
        </div>
            ) : (
                <div>
                {following.map(follower => (
                    <Link href={`/users/${follower.id}`} onClick={() => setIsModalOpen(false)}>
                    <div className={styles.followContainer}>
                        <img
                            src={`http://localhost:3001/` + follower?.image || "default.jpg"}
                            alt=""
                            className={styles.avatar}
                        />
                        <p>{follower.username}</p>
                    </div>
                    </Link>
                ))}
            </div>
            )}
 

        </div>
    )
}

export default ModalFollowers