import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/api-auth';

// POST /api/users/[id]/unlock - アカウントロック解除
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // ADMIN のみアクセス可能
    const auth = await requireRole(request, ['ADMIN']);
    const { id } = await context.params;

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

    // ロック解除
    await prisma.user.update({
      where: { id },
      data: {
        isLocked: false,
        failedLoginAttempts: 0,
      },
    });

    // 監査ログ記録
    const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || undefined;

    await prisma.auditLog.create({
      data: {
        username: auth.userRole,
        action: 'UNLOCK_USER',
        resourceType: 'USER',
        resourceId: id,
        details: { unlockedUser: user.username },
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
    console.error('Unlock user error:', error);
    return NextResponse.json(
      { error: 'アカウントロック解除中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
