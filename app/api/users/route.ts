import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/api-auth';
import { validatePassword } from '@/lib/password-validator';
import bcrypt from 'bcryptjs';

// GET /api/users - ユーザー一覧取得
export async function GET(request: NextRequest) {
  try {
    // 管理者のみアクセス可能
    const auth = await requireAdmin(request);

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const role = searchParams.get('role');
    const isActive = searchParams.get('isActive');

    let whereClause: any = {};

    // 検索条件の構築
    if (search) {
      whereClause.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { fullName: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role && role !== 'all') {
      whereClause.role = role;
    }

    // デフォルトでアクティブなユーザーのみ表示
    if (isActive && isActive !== 'all') {
      whereClause.isActive = isActive === 'true';
    } else if (!isActive || isActive === 'all') {
      // フィルターが指定されていない、または 'all' の場合はアクティブユーザーのみ
      whereClause.isActive = true;
    }

    const users = await prisma.user.findMany({
      where: whereClause,
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
        // passwordHash は除外
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ users });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
    }
    if (error.message === 'Forbidden') {
      return NextResponse.json({ error: 'この操作を実行する権限がありません' }, { status: 403 });
    }
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'ユーザー一覧の取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

// POST /api/users - ユーザー作成
export async function POST(request: NextRequest) {
  try {
    // 管理者のみアクセス可能
    const auth = await requireAdmin(request);

    const body = await request.json();
    const { username, email, fullName, role, department, licenseNumber, password, isAdmin } = body;

    // 必須フィールドの検証
    if (!username || !email || !fullName || !role || !password) {
      return NextResponse.json(
        { error: '必須フィールドを入力してください' },
        { status: 400 }
      );
    }

    // ユーザー名の重複チェック
    const existingUsername = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUsername) {
      return NextResponse.json(
        { error: 'このユーザー名は既に使用されています' },
        { status: 400 }
      );
    }

    // メールアドレスの重複チェック
    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingEmail) {
      return NextResponse.json(
        { error: 'このメールアドレスは既に使用されています' },
        { status: 400 }
      );
    }

    // パスワードバリデーション
    const validation = validatePassword(password);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.errors[0] },
        { status: 400 }
      );
    }

    // パスワードをハッシュ化
    const passwordHash = await bcrypt.hash(password, 12);

    // ユーザー作成
    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        fullName,
        role,
        department,
        licenseNumber,
        isAdmin: isAdmin === true,
        isActive: true,
        mustChangePassword: true,
        createdBy: auth.userId,
      },
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
        createdAt: true,
      },
    });

    // 監査ログ記録
    const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || undefined;

    await prisma.auditLog.create({
      data: {
        username: auth.userRole,
        action: 'CREATE_USER',
        resourceType: 'USER',
        resourceId: user.id,
        details: { createdUser: user.username },
        ipAddress: clientIp,
        userAgent,
        success: true,
        user: {
          connect: { id: auth.userId },
        },
      },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
    }
    if (error.message === 'Forbidden') {
      return NextResponse.json({ error: 'この操作を実行する権限がありません' }, { status: 403 });
    }
    console.error('Create user error:', error);
    return NextResponse.json(
      { error: 'ユーザー作成中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
