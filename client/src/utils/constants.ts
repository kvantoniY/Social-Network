import { Comment, User } from "@/types/types";

export const emptyComment: any = {
    id: 0,
    content: '',
    userId: 0,
    postId: 0,
    createdAt: '',
    updatedAt: '',
    User: {
      id: 0,
      username: '',
      email: '',
      role: 'User',
      UserSettings: '',
      image: '',
      createdAt: '',
      updatedAt: '',
    },
  };