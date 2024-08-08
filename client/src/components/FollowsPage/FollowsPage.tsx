import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store/store';
import { fetchUserProfile } from '@/features/auth/authSlice';
import { fetchUserByUsername } from '@/features/users/usersSlice';
import { searchFollowers, searchFollowing } from '@/features/follows/followSlice';
import { useRouter } from 'next/router';
import styles from './FollowsPage.module.scss';
import Link from 'next/link';
import axiosInstance from '@/utils/axiosInstance';

const FollowsPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const { user } = useSelector((state: RootState) => state.auth);
  const { followers } = useSelector((state: RootState) => state.follows);
  const { following } = useSelector((state: RootState) => state.follows);
  const [followsList, setFollowsList] = useState('followers');
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [usersWhoBlockedMe, setUsersWhoBlockedMe] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        await dispatch(fetchUserProfile()).unwrap();
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      const fetchFollowsData = async () => {
        try {
          await dispatch(searchFollowers(user.id));
          await dispatch(searchFollowing(user.id));
          const response = await axiosInstance.get(`/users/myBlackListUsers/`);
          setBlockedUsers(response.data.blockedUsers);
          setUsersWhoBlockedMe(response.data.usersWhoBlockedMe);
          console.log(blockedUsers)
          console.log(usersWhoBlockedMe)
        } catch (error) {
          console.log(error);
        }
      };

      fetchFollowsData();
    }
  }, [user, dispatch]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      try {
        const results = await dispatch(fetchUserByUsername(searchTerm)).unwrap();
        setSearchResults(results);
      } catch (error) {
        setSearchResults("Пользователь не найден");
      }
    }
  };

  const handleProfileClick = (userId: number) => {
    router.push(`/users/${userId}`);
  };

  return (
    <div className={styles.followsPage}>
      <h2>Подписчики и подписки</h2>
      <form onSubmit={handleSearch} className={styles.searchUserContainer}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Искать пользователей"
        />
        <button type="submit">Поиск</button>
      </form>
      <div className={styles.switchContainer}>
        <button onClick={() => setFollowsList('followers')} className={followsList === 'followers' ? styles.active : ''}>Подписчики</button>
        <button onClick={() => setFollowsList('subs')} className={followsList === 'subs' ? styles.active : ''}>Подписки</button>
        <button onClick={() => setFollowsList('otherBlackList')} className={followsList === 'otherBlackList' ? styles.active : ''}>Вы в чёрном списке</button>
        <button onClick={() => setFollowsList('myBlackList')} className={followsList === 'myBlackList' ? styles.active : ''}>У вас в чёрном списке</button>
      </div>

      {typeof searchResults === "object" && searchResults ? (
        <div className={styles.searchResult}>
          <Link href={`/users/${searchResults?.id}`}>
            <div className={styles.followContainer}>
              <img
                src={`http://localhost:3001/${searchResults?.image || "default.jpg"}`}
                alt=""
                className={styles.avatar}
              />
              <p>{searchResults.username}</p>
            </div>
          </Link>
        </div>
      ) : (
        <div className={styles.searchResult}>
          <h3 className={styles.searchResult}>{searchResults}</h3>
        </div>
      )}

      {followsList === 'followers' ? (
        <>
          <h2>Подписчики</h2>
          {followers.map((follower: any) => (
            <Link href={`/users/${follower?.id}`} key={follower?.id}>
              <div className={styles.followContainer}>
                <img
                  src={`http://localhost:3001/${follower?.image || "default.jpg"}`}
                  alt=""
                  className={styles.avatar}
                />
                <p>{follower.username}</p>
              </div>
            </Link>
          ))}
        </>
      ) : followsList === 'subs' ? (
        <>
          <h2>Подписки</h2>
          {following.map((follower: any) => (
            <Link href={`/users/${follower.id}`} key={follower.id}>
              <div className={styles.followContainer}>
                <img
                  src={`http://localhost:3001/${follower?.image || "default.jpg"}`}
                  alt=""
                  className={styles.avatar}
                />
                <p>{follower.username}</p>
              </div>
            </Link>
          ))}
        </>
      ) : followsList === 'otherBlackList' ? (
        <>
          <p>Вы в чёрном списке:</p>
          
          {usersWhoBlockedMe.map((user: any) => (
            <Link href={`/users/${user.BlockedUsers?.id}`} key={user.BlockedUsers?.id}>
            <div key={user.BlockedUsers?.id} className={styles.followContainer}>
              <img
                src={`http://localhost:3001/${user?.BlockedUsers?.image || "default.jpg"}`}
                alt=""
                className={styles.avatar}
              />
              <p>{user.BlockedUsers?.username}</p>
            </div>
            </Link>
          ))}
        </>
      ) : (
        <>
          <p>У вас в чёрном списке:</p>
          {blockedUsers.map((user: any) => (
            <Link href={`/users/${user.BlockingUsers?.id}`} key={user.BlockingUsers?.id}>
            <div key={user.BlockingUsers?.id} className={styles.followContainer}>
              <img
                src={`http://localhost:3001/${user.BlockingUsers?.image || "default.jpg"}`}
                alt=""
                className={styles.avatar}
              />
              <p>{user.BlockingUsers?.username}</p>
            </div>
            </Link>
          ))}
        </>
      )}
      <div></div>
    </div>
  );
};

export default FollowsPage;
