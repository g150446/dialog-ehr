import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { prisma } from '@/lib/db';
import { sessionOptions, SessionData } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    const session = await getIronSession<SessionData>(request, NextResponse.next(), sessionOptions);

    if (!session.isLoggedIn) {
      return NextResponse.json(
        { error: 'ログインしていません' },
        { status: 401 }
      );
    }

    const userId = session.userId;
    const username = session.username;

    // 監査ログ記録
    const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || undefined;

    await prisma.auditLog.create({
      data: {
        username,
        action: 'LOGOUT',
        success: true,
        ipAddress: clientIp,
        userAgent,
        user: {
          connect: { id: userId },
        },
      },
    });

    // セッション破棄
    session.destroy();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'ログアウト中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
