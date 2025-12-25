import { SessionOptions } from 'iron-session';

export interface SessionData {
  userId: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
  department?: string;
  isAdmin: boolean;
  isLoggedIn: boolean;
}

export const defaultSession: SessionData = {
  userId: '',
  username: '',
  email: '',
  fullName: '',
  role: '',
  department: undefined,
  isAdmin: false,
  isLoggedIn: false,
};

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET || 'complex_password_at_least_32_characters_long',
  cookieName: 'dialog-ehr-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60, // 24 hours (extended from 8 hours)
  },
};
