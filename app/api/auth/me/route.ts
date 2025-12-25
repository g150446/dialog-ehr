import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';

export async function GET(request: NextRequest) {
  try {
    const session = await getIronSession<SessionData>(request, NextResponse.next(), sessionOptions);

    if (!session.isLoggedIn) {
      return NextResponse.json(
        { error: 'ログインしていません' },
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
      { error: 'ユーザー情報の取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
