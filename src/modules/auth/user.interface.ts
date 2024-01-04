interface UserAndTokens {
    id: number;
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    isAdmin: boolean;
    isBlocked: boolean;
    profileImage?: string | null;
    otp?: string | null;
    createdAt: Date;
    updatedAt: Date;
    refreshTokens?: RefreshToken[];
  }

  interface User {
    id: number;
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    isAdmin?: boolean;
    isBlocked?: boolean;
    isVerified?: boolean;
    profileImage?: string | null;
    createdAt: Date;
    updatedAt: Date;
  }

  interface UserWithoutId {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    isAdmin: boolean;
    isBlocked: boolean;
    profileImage?: string | null;
    otp?: string | null;
  }

  interface UserWithoutPassword {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    isAdmin: boolean;
    isBlocked: boolean;
    profileImage?: string | null;
    otp?: string | null;
    createdAt: Date;
    updatedAt: Date;
  }
  
  interface RefreshToken {
    id: string;
    userId: number;
    token: string;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export { User, UserWithoutPassword, UserWithoutId, UserAndTokens, RefreshToken };
  