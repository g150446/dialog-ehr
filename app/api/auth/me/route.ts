import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';

const isAuthRequired = (): boolean => {
  return process.env.EHR_AUTH_REQUIRED === 'true';
};

export async function GET(request: NextRequest) {
  try {
    // When auth is not required, return default demo user
    if (!isAuthRequired()) {
      return NextResponse.json({
        user: {
          userId: 'demo-admin',
          username: 'admin',
          email: 'admin@example.local',
          fullName: 'Demo Admin',
          role: 'DOCTOR',
          department: '内科',
        },
      });
    }

    const session = await getIronSession<SessionData>(request, NextResponse.next(), sessionOptions);

    if (!session.isLoggedIn) {
      return NextResponse.json(
        { error: 'Not logged in' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      user: {
        userId: session.userId,
        username: session.username,
        email: session.email,
        fullName: session.fullName,
        role: session.role,
        department: session.department,
      },
    });
  } catch (error) {
    console.error('Get me error:', error);
    return NextResponse.json(
      { error: 'An error occurred while retrieving user information' },
      { status: 500 }
    );
  }
}
