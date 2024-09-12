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
            <h2>Подписчики</h2>
            {followers.map(follower => (
                <Link href={`/users/${follower.id}`} onClick={() => setIsModalOpen(false)}>
                <div className='followContainer'>
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
                    <h2>Подписки</h2>
                {following.map(follower => (
                    <Link href={`/users/${follower.id}`} onClick={() => setIsModalOpen(false)}>
                        
                    <div className='followContainer'>
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