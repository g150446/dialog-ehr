import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from './lib/session';

// 公開ルート (認証不要)
const PUBLIC_ROUTES = ['/login', '/api/auth/login', '/api/auth/reset-password'];

// 保護対象のAPIルート
const PROTECTED_API_ROUTES = [
  '/api/patients',
  '/api/settings',
  '/api/users',
  '/api/ollama',
  '/api/groq',
];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 公開ルートは認証チェックをスキップ
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // セッションを取得
  const response = NextResponse.next();
  const session = await getIronSession<SessionData>(request, response, sessionOptions);

  // ユーザーが認証されているか確認
  if (!session.isLoggedIn) {
    // ページルートの場合は/loginにリダイレクト
    if (!pathname.startsWith('/api/')) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // APIルートの場合は401を返す
    if (PROTECTED_API_ROUTES.some(route => pathname.startsWith(route))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  // 認証済みの場合、ユーザー情報をリクエストヘッダーに追加
  if (pathname.startsWith('/api/') && session.isLoggedIn) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', session.userId);
    requestHeaders.set('x-user-role', session.role);
    requestHeaders.set('x-user-is-admin', session.isAdmin.toString());

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * 以下を除く全てのパスにマッチ:
     * - _next/static (静的ファイル)
     * - _next/image (画像最適化)
     * - favicon.ico, その他の静的ファイル
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
