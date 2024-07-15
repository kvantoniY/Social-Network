import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { fetchUserProfile } from '@/features/auth/authSlice';
import { fetchUserByUsername } from '@/features/users/usersSlice';
import { searchFollowers, searchFollowing } from '@/features/follows/followSlice';
import { useRouter } from 'next/router';

const FriendsPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any>('');
  const { user } = useSelector((state: RootState) => state.auth);
  const { followers } = useSelector((state: RootState) => state.follows);
  const { following } = useSelector((state: RootState) => state.follows);
  const [followsList, setFollowsList] = useState('followers');

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
    <div>
      <h2>Подписчики и подписки</h2>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Искать пользователей"
        />
        <button type="submit">Поиск</button>
      </form>

      <button onClick={() => setFollowsList('followers')}>Подписчики</button>
      <button onClick={() => setFollowsList('following')}>Подписки</button>

      {followsList === 'followers' ? (
        <ul>
          {followers.map((follower: any) => (
            <li key={follower.id}>
              {follower.username}
              <button onClick={() => handleProfileClick(follower.id)}>Профиль</button>
            </li>
          ))}
        </ul>
      ) : (
        <ul>
          {following.map((follow: any) => (
            <li key={follow.id}>
              {follow.username}
              <button onClick={() => handleProfileClick(follow.id)}>Профиль</button>
            </li>
          ))}
        </ul>
      )}

      <h3>Результаты поиска</h3>
      <ul>
        {typeof(searchResults) == "object" ? (
          <li key={searchResults.id}>
            {searchResults.username}
            <button onClick={() => handleProfileClick(searchResults.id)}>Профиль</button>
          </li>
        ) : (
          <h3>{searchResults}</h3>
        )}
      </ul>
    </div>
  );
};

export default FriendsPage;
