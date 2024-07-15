import { Like } from '@/types/types';
import React from 'react'


interface ModalLikesProps {
    likes: Like[];
}

const ModalLikes:React.FC<ModalLikesProps> = ({likes}) => {
  return (
    <div>
        {likes.map(like => (
            <div>
            {like.User?.username}

            </div>
        ))}
    </div>
  )
}

export default ModalLikes