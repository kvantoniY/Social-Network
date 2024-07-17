import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store/store';
import { fetchUserProfile } from '@/features/auth/authSlice';
import { fetchUserByUsername } from '@/features/users/usersSlice';
import { searchFollowers, searchFollowing } from '@/features/follows/followSlice';
import { useRouter } from 'next/router';
import styles from './FollowsPage.module.scss'
import Link from 'next/link';

const FollowsPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const { user } = useSelector((state: RootState) => state.auth);
  const { followers } = useSelector((state: RootState) => state.follows);
  const { following } = useSelector((state: RootState) => state.follows);
  const [followsList, setFollowsList] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (user) {
      dispatch(fetchUserProfile());
      dispatch(searchFollowers(user.id));
      dispatch(searchFollowing(user.id));
    }
  }, [dispatch]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      try {
        const results = await dispatch(fetchUserByUsername(searchTerm)).unwrap();
        setSearchResults(results);
      } catch (error) {
        setSearchResults("Пользователь не найден")
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
        <button onClick={() => setFollowsList(true)} className={followsList ? styles.active : ''}>Подписчики</button>
        <button onClick={() => setFollowsList(false)} className={!followsList ? styles.active : ''}>Подписки</button>
      </div>

      {(typeof (searchResults) == "object" && searchResults) ? (
          <div className={styles.searchResult}>
            <Link href={`/users/${searchResults?.id}`}>
              <div className={styles.followContainer}>
                <img
                  src={`http://localhost:3001/` + searchResults?.image || "default.jpg"}
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
      {followsList ? (
        <>
          <h2>Подписчики</h2>
          {followers.map((follower: any) => (
            <Link href={`/users/${follower?.id}`}>
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
        </>
      ) : (
        <>
          <h2>Подписки</h2>
            {following.map((follower: any) => (
              <Link href={`/users/${follower.id}`}>
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
        </>
      )}
      </div>
    
  );
};

export default FollowsPage;
