import { NextRequest } from 'next/server';

export interface AuthContext {
  userId: string;
  userRole: string;
  isAdmin: boolean;
}

export async function requireAuth(request: NextRequest): Promise<AuthContext> {
  const userId = request.headers.get('x-user-id');
  const userRole = request.headers.get('x-user-role');
  const isAdmin = request.headers.get('x-user-is-admin') === 'true';

  if (!userId || !userRole) {
    throw new Error('Unauthorized');
  }

  return { userId, userRole, isAdmin };
}

export async function requireAdmin(request: NextRequest): Promise<AuthContext> {
  const authContext = await requireAuth(request);

  if (!authContext.isAdmin) {
    throw new Error('Forbidden');
  }

  return authContext;
}

export async function requireRole(
  request: NextRequest,
  allowedRoles: string[]
): Promise<AuthContext> {
  const { userId, userRole, isAdmin } = await requireAuth(request);

  if (!allowedRoles.includes(userRole)) {
    throw new Error('Forbidden');
  }

  return { userId, userRole, isAdmin };
}

export function canAccessUser(authContext: AuthContext, targetUserId: string): boolean {
  return authContext.userId === targetUserId || authContext.isAdmin;
}

export function isAdmin(authContext: AuthContext): boolean {
  return authContext.isAdmin;
}
