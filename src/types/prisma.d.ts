import { Prisma } from '@prisma/client';
import { UserRole } from '@/lib/auth-utils';

declare module '@prisma/client' {
  // Extend User model
  type UserWithRole = Prisma.UserGetPayload<{}> & {
    role: UserRole;
  };

  // Update User to include role
  declare type User = UserWithRole;
}
