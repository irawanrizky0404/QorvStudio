import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { DEFAULT_LOCALE, LOCALES, LOCALE_COOKIE, isLocale } from '@/lib/i18n/config';

const ADMIN_SESSION_COOKIE = 'qorv_session';

/** Cookie → Accept-Language → default. */
function resolveLocale(request: NextRequest): string {
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  if (cookieLocale && isLocale(cookieLocale)) return cookieLocale;

  const header = request.headers.get('accept-language');
  if (header) {
    const preferred = header
      .split(',')
      .map((part) => {
        const [tag, q] = part.trim().split(';q=');
        return { tag: (tag ?? '').split('-')[0]?.toLowerCase() ?? '', q: q ? Number(q) : 1 };
      })
      .sort((a, b) => b.q - a.q);

    for (const { tag } of preferred) {
      if (isLocale(tag)) return tag;
    }
  }

  return DEFAULT_LOCALE;
}

/** Next 16 renamed the `middleware` convention to `proxy`. Same execution model. */
export default function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  /* ── Admin guard ──────────────────────────────────────────────────────── */
  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') return NextResponse.next();

    const session = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    if (!session) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  /* ── Locale routing ───────────────────────────────────────────────────── */
  const hasLocale = LOCALES.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );

  if (hasLocale) {
    const current = pathname.split('/')[1];
    const response = NextResponse.next();
    // Remember the explicit choice so the next visit lands in the same language.
    if (current && isLocale(current) && request.cookies.get(LOCALE_COOKIE)?.value !== current) {
      response.cookies.set(LOCALE_COOKIE, current, {
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
        sameSite: 'lax',
      });
    }
    return response;
  }

  const locale = resolveLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    /*
     * Everything except Next internals, static assets, and files with an
     * extension. Without the extension guard, /favicon.ico would be redirected
     * to /en/favicon.ico and 404.
     */
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)',
  ],
};
