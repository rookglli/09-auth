import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';
import { parseSetCookie, stringifyCookie } from 'cookie';

import { checkSession } from './lib/api/serverApi';

const privateRoutes = ['/notes', '/profile'];
const publicRoutes = ['/sign-in', '/sign-up'];

const matchesRoute = (pathname: string, route: string): boolean => {
  return pathname === route || pathname.startsWith(`${route}/`);
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPrivateRoute = privateRoutes.some((route) =>
    matchesRoute(pathname, route),
  );

  const isPublicRoute = publicRoutes.some((route) =>
    matchesRoute(pathname, route),
  );

  // Получаем cookies через Next.js.
  const cookieStore = await cookies();

  // Проверяем наличие токенов.
  const accessToken = cookieStore.get('accessToken')?.value;
  const refreshToken = cookieStore.get('refreshToken')?.value;

  let isAuthenticated = Boolean(accessToken);

  const requestHeaders = new Headers(request.headers);

  const updatedCookies: Record<string, string> = Object.fromEntries(
    cookieStore.getAll().map(({ name, value }) => [name, value]),
  );

  let sessionCookies: string[] = [];

  // Обновляем сессию только при отсутствии accessToken
  // и наличии refreshToken.
  if (!accessToken && refreshToken) {
    try {
      const sessionResponse = await checkSession();

      if (sessionResponse.data.success === true) {
        isAuthenticated = true;

        // Получаем заголовок Set-Cookie из ответа Axios.
        const setCookieHeader = sessionResponse.headers['set-cookie'];

        if (Array.isArray(setCookieHeader)) {
          sessionCookies = setCookieHeader;
        } else if (typeof setCookieHeader === 'string') {
          sessionCookies = [setCookieHeader];
        }

        // Подготавливаем обновлённые cookies.
        for (const cookieString of sessionCookies) {
          const parsed = parseSetCookie(cookieString);

          if (parsed.name && parsed.value !== undefined) {
            updatedCookies[parsed.name] = parsed.value;
          }
        }
      }
    } catch (error) {
      console.error('Session refresh failed:', error);
    }
  }

  // Передаём обновлённые cookies серверным компонентам.
  if (sessionCookies.length > 0) {
    requestHeaders.set('cookie', stringifyCookie(updatedCookies));
  }

  let response: NextResponse;

  if (isPrivateRoute && !isAuthenticated) {
    response = NextResponse.redirect(new URL('/sign-in', request.url));
  } else if (isPublicRoute && isAuthenticated) {
    response = NextResponse.redirect(new URL('/', request.url));
  } else {
    response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // Передаём обновлённые cookies браузеру.
  for (const cookieString of sessionCookies) {
    response.headers.append('set-cookie', cookieString);
  }

  return response;
}

export const config = {
  matcher: ['/notes/:path*', '/profile/:path*', '/sign-in', '/sign-up'],
};
