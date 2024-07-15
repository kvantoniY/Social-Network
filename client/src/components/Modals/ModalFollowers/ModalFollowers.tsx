import {useState } from 'react'


interface Follower {
    id: number;
    username: string;
    image: string;
}

interface ModalFollowersProps {
    followers: Follower[];
    following: Follower[];
}

const ModalFollowers: React.FC<ModalFollowersProps> = ({ followers, following }) => {

    const [follow, setFollow] = useState(false);

    return (
        <div>
            <button onClick={() => setFollow(true)}>Подписки</button>
            <button onClick={() => setFollow(false)}>Подписчики</button>
            {follow ? (
            <div>
            Подписчики
            {followers.map(follower => (
                <div>
                <p>{follower.username}</p>
                <img
                src={`http://localhost:3001/` + follower?.image || "default.jpg"}
                alt=""
                style={{width: '50px', height: '50px'}}
            />
            </div>
            ))}
        </div>
            ) : (
                <div>Подписки
                {following.map(follower => (
                    <div>
                        {follower.username}
                        <img
                            src={`http://localhost:3001/` + follower?.image || "default.jpg"}
                            alt=""
                            style={{width: '50px', height: '50px'}}
                        />
                    </div>
                ))}
            </div>
            )}
 

        </div>
    )
}

export default ModalFollowers