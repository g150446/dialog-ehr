import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { prisma } from '@/lib/db';
import { sessionOptions, SessionData } from '@/lib/session';
import { validatePassword } from '@/lib/password-validator';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const session = await getIronSession<SessionData>(request, NextResponse.next(), sessionOptions);

    if (!session.isLoggedIn) {
      return NextResponse.json(
        { error: 'ログインしていません' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: '現在のパスワードと新しいパスワードを入力してください' },
        { status: 400 }
      );
    }

    // ユーザーを取得
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 }
      );
    }

    // 現在のパスワードを検証
    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: '現在のパスワードが正しくありません' },
        { status: 401 }
      );
    }

    // 新しいパスワードのバリデーション
    const validation = validatePassword(newPassword);

    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.errors[0] },
        { status: 400 }
      );
    }

    // 新しいパスワードをハッシュ化
    const passwordHash = await bcrypt.hash(newPassword, 12);

    // パスワードを更新
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        mustChangePassword: false,
      },
    });

    // 監査ログ記録
    const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || undefined;

    await prisma.auditLog.create({
      data: {
        username: user.username,
        action: 'CHANGE_PASSWORD',
        success: true,
        ipAddress: clientIp,
        userAgent,
        user: {
          connect: { id: user.id },
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json(
      { error: 'パスワード変更中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
