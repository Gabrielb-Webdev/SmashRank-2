import 'next-auth';
import { Role } from '@prisma/client';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      username: string;
      role: Role;
      province: string;
      avatar?: string | null;
    };
  }

  interface User {
    id: string;
    email: string;
    username: string;
    role: Role;
    province: string;
    avatar?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    username: string;
    role: Role;
    province: string;
    avatar?: string | null;
  }
}
