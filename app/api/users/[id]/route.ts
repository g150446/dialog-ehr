import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth, canAccessUser, isAdmin } from '@/lib/api-auth';

// GET /api/users/[id] - ユーザー詳細取得
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request);
    const { id } = await context.params;

    // 自分自身または管理者のみアクセス可能
    if (!canAccessUser(auth, id)) {
      return NextResponse.json(
        { error: 'この操作を実行する権限がありません' },
        { status: 403 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        department: true,
        licenseNumber: true,
        isAdmin: true,
        isActive: true,
        isLocked: true,
        failedLoginAttempts: true,
        lastLoginAt: true,
        lastLoginIp: true,
        mustChangePassword: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
    }
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'ユーザー情報の取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

// PUT /api/users/[id] - ユーザー更新
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request);
    const { id } = await context.params;

    const body = await request.json();
    const { fullName, email, role, department, licenseNumber, isAdmin: isAdminFlag, isActive } = body;

    // 自分自身または管理者のみアクセス可能
    const isSelfUpdate = auth.userId === id;
    const isAdminUser = isAdmin(auth);

    if (!isSelfUpdate && !isAdminUser) {
      return NextResponse.json(
        { error: 'この操作を実行する権限がありません' },
        { status: 403 }
      );
    }

    // ユーザーが存在するか確認
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 }
      );
    }

    // 更新データを構築
    const updateData: any = {};

    if (fullName !== undefined) updateData.fullName = fullName;
    if (department !== undefined) updateData.department = department;
    if (licenseNumber !== undefined) updateData.licenseNumber = licenseNumber;

    // role, isAdmin, isActive の変更は管理者のみ
    if (isAdminUser) {
      if (role !== undefined) updateData.role = role;
      if (isAdminFlag !== undefined) updateData.isAdmin = isAdminFlag;
      if (isActive !== undefined) updateData.isActive = isActive;
    }

    // email の変更も ADMIN のみ (本人も変更可能にする場合はここを修正)
    if (isAdminUser && email !== undefined) {
      // メールアドレスの重複チェック
      const existingEmail = await prisma.user.findFirst({
        where: {
          email,
          id: { not: id },
        },
      });

      if (existingEmail) {
        return NextResponse.json(
          { error: 'このメールアドレスは既に使用されています' },
          { status: 400 }
        );
      }

      updateData.email = email;
    }

    // ユーザー更新
    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        department: true,
        licenseNumber: true,
        isActive: true,
        updatedAt: true,
      },
    });

    // 監査ログ記録
    const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || undefined;

    await prisma.auditLog.create({
      data: {
        username: auth.userRole,
        action: 'UPDATE_USER',
        resourceType: 'USER',
        resourceId: id,
        details: { updatedFields: Object.keys(updateData) },
        ipAddress: clientIp,
        userAgent,
        success: true,
        user: {
          connect: { id: auth.userId },
        },
      },
    });

    return NextResponse.json({ user });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
    }
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'ユーザー更新中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] - ユーザー削除 (ソフトデリート)
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request);
    const { id } = await context.params;

    // ADMIN のみアクセス可能
    if (!isAdmin(auth)) {
      return NextResponse.json(
        { error: 'この操作を実行する権限がありません' },
        { status: 403 }
      );
    }

    // 自分自身を削除できないようにする
    if (auth.userId === id) {
      return NextResponse.json(
        { error: '自分自身を削除することはできません' },
        { status: 400 }
      );
    }

    // ユーザーが存在するか確認
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 }
      );
    }

    // ソフトデリート (isActive を false に設定)
    await prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    // 監査ログ記録
    const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || undefined;

    await prisma.auditLog.create({
      data: {
        username: auth.userRole,
        action: 'DELETE_USER',
        resourceType: 'USER',
        resourceId: id,
        details: { deletedUser: existingUser.username },
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
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: 'ユーザー削除中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
