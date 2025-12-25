import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';
import { sessionOptions, SessionData } from '@/lib/session';
import bcrypt from 'bcryptjs';

const MAX_FAILED_ATTEMPTS = parseInt(process.env.MAX_FAILED_LOGIN_ATTEMPTS || '5');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'ユーザー名とパスワードを入力してください' },
        { status: 400 }
      );
    }

    // ユーザーを検索 (username または email で検索)
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: username },
          { email: username },
        ],
        isActive: true,
      },
    });

    // ユーザーが存在しない場合
    if (!user) {
      await logAuditLog(null, 'LOGIN', false, 'ユーザーが見つかりません', request, username);
      return NextResponse.json(
        { error: 'ユーザー名またはパスワードが正しくありません' },
        { status: 401 }
      );
    }

    // アカウントがロックされているか確認
    if (user.isLocked) {
      await logAuditLog(user.id, 'LOGIN', false, 'アカウントがロックされています', request, user.username);
      return NextResponse.json(
        { error: 'アカウントがロックされています。管理者にお問い合わせください。' },
        { status: 403 }
      );
    }

    // パスワード検証
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      // ログイン失敗回数を増やす
      const newFailedAttempts = user.failedLoginAttempts + 1;
      const shouldLock = newFailedAttempts >= MAX_FAILED_ATTEMPTS;

      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: newFailedAttempts,
          isLocked: shouldLock,
        },
      });

      await logAuditLog(user.id, 'LOGIN', false, 'パスワードが正しくありません', request, user.username);

      const remainingAttempts = MAX_FAILED_ATTEMPTS - newFailedAttempts;
      let errorMessage = 'ユーザー名またはパスワードが正しくありません';

      if (shouldLock) {
        errorMessage = 'ログイン試行回数が上限に達しました。アカウントがロックされました。';
      } else if (remainingAttempts <= 2) {
        errorMessage = `ユーザー名またはパスワードが正しくありません (残り${remainingAttempts}回)`;
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: 401 }
      );
    }

    // ログイン成功 - failedLoginAttemptsをリセット、lastLoginAtを更新
    const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        isLocked: false,
        lastLoginAt: new Date(),
        lastLoginIp: clientIp,
      },
    });

    // 監査ログ記録
    await logAuditLog(user.id, 'LOGIN', true, null, request, user.username);

    // レスポンス作成
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        department: user.department,
        mustChangePassword: user.mustChangePassword,
      },
    });

    // セッション作成
    const session = await getIronSession<SessionData>(request, response, sessionOptions);

    session.userId = user.id;
    session.username = user.username;
    session.email = user.email;
    session.fullName = user.fullName;
    session.role = user.role;
    session.department = user.department || undefined;
    session.isAdmin = user.isAdmin;
    session.isLoggedIn = true;

    await session.save();

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'ログイン中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

async function logAuditLog(
  userId: string | null,
  action: string,
  success: boolean,
  errorMessage: string | null,
  request: NextRequest,
  username: string
) {
  const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const userAgent = request.headers.get('user-agent') || undefined;

  await prisma.auditLog.create({
    data: {
      username,
      action,
      success,
      errorMessage,
      ipAddress: clientIp,
      userAgent,
      ...(userId && {
        user: {
          connect: { id: userId },
        },
      }),
    },
  });
}
