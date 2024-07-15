import { Like } from '@/types/types';
import React from 'react'


interface ModalLikesProps {
  likes: Like[];
}

const ModalLikes: React.FC<ModalLikesProps> = ({ likes }) => {
  return (
    <div>
      {likes.length > 0 ? (
        <>
          {likes.map(like => (
            <div>
              {like.User?.username}

            </div>
          ))}
        </>
      ) : (
        <p>Пока никто не лайкнул пост :(</p>
      )}

    </div>
  )
}

export default ModalLikes