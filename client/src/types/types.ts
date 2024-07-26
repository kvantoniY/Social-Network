export interface User {
    id: number;
    username: string;
    email: string;
    about?: string;
    role: 'User' | 'Admin';
    image: string;
    createdAt: string;
    updatedAt: string;
  }
  
  interface Follower {
    id: number;
    username: string
    image: string;
  }

  export interface FollowsState {
    following: Follower[];
    followers: Follower[];
    followStatus: number;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
  }

  export interface Like {
    id: number;
    postId: number;
    userId: number;
    User: User;
  }
  
  export interface Comment {
    id: number;
    content: string;
    userId: number;
    postId: number;
    createdAt: string;
    updatedAt: string;
    User: User;
  }
  
  export interface Post {
    id: number;
    content: string;
    userId: number;
    Likes: Like[];
    Comments: Comment[];
    User: User;
    likeStatus: boolean;
    createdAt: string;
    updatedAt: string;
    image: any;
  }
  export interface Dialog {
    id: number;
    userId1: number;
    userId2: number;
    unreadCount: number;
    User1: User;
    User2: User;
  }