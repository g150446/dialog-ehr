import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/api-auth';
import { validatePassword } from '@/lib/password-validator';
import bcrypt from 'bcryptjs';

// POST /api/users/[id]/reset-password-admin - 管理者によるパスワードリセット
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // ADMIN のみアクセス可能
    const auth = await requireRole(request, ['ADMIN']);
    const { id } = await context.params;

    const body = await request.json();
    const { newPassword } = body;

    if (!newPassword) {
      return NextResponse.json(
        { error: '新しいパスワードを入力してください' },
        { status: 400 }
      );
    }

    // ユーザーが存在するか確認
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 }
      );
    }

    // パスワードバリデーション
    const validation = validatePassword(newPassword);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.errors[0] },
        { status: 400 }
      );
    }

    // パスワードをハッシュ化
    const passwordHash = await bcrypt.hash(newPassword, 12);

    // パスワードをリセット
    await prisma.user.update({
      where: { id },
      data: {
        passwordHash,
        mustChangePassword: true, // 次回ログイン時にパスワード変更を強制
      },
    });

    // 監査ログ記録
    const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || undefined;

    await prisma.auditLog.create({
      data: {
        username: auth.userRole,
        action: 'ADMIN_RESET_PASSWORD',
        resourceType: 'USER',
        resourceId: id,
        details: { resetUser: user.username },
        ipAddress: clientIp,
        userAgent,
        success: true,
        user: {
          connect: { id: auth.userId },
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
    }
    if (error.message === 'Forbidden') {
      return NextResponse.json({ error: 'この操作を実行する権限がありません' }, { status: 403 });
    }
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'パスワードリセット中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
