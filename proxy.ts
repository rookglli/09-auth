import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';
import { parseSetCookie, stringifyCookie } from 'cookie';

const privateRoutes = ['/notes', '/profile'];
const publicRoutes = ['/sign-in', '/sign-up'];

const matchesRoute = (pathname: string, route: string): boolean => {
  return pathname === route || pathname.startsWith(`${route}/`);
};

interface SessionResponse {
  success: boolean;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPrivateRoute = privateRoutes.some((route) =>
    matchesRoute(pathname, route),
  );

  const isPublicRoute = publicRoutes.some((route) =>
    matchesRoute(pathname, route),
  );

  // Получаем cookies через асинхронный API Next.js.
  const cookieStore = await cookies();

  // Проверяем наличие токенов.
  const accessToken = cookieStore.get('accessToken')?.value;
  const refreshToken = cookieStore.get('refreshToken')?.value;

  // Если accessToken существует, считаем пользователя
  // авторизованным без дополнительного запроса.
  let isAuthenticated = Boolean(accessToken);

  const requestHeaders = new Headers(request.headers);

  const updatedCookies: Record<string, string> = Object.fromEntries(
    cookieStore.getAll().map(({ name, value }) => [name, value]),
  );

  let sessionCookies: string[] = [];

  // Обновляем сессию только тогда, когда:
  // 1. accessToken отсутствует;
  // 2. refreshToken существует.
  if (!accessToken && refreshToken) {
    try {
      const sessionResponse = await fetch(
        new URL('/api/auth/session', request.url),
        {
          method: 'GET',
          headers: {
            Cookie: cookieStore.toString(),
          },
          cache: 'no-store',
        },
      );

      if (sessionResponse.ok) {
        const data: SessionResponse = await sessionResponse.json();

        if (data.success === true) {
          isAuthenticated = true;

          // Получаем обновлённые cookies.
          sessionCookies = sessionResponse.headers.getSetCookie();

          for (const cookieString of sessionCookies) {
            const parsed = parseSetCookie(cookieString);

            if (parsed.name && parsed.value !== undefined) {
              updatedCookies[parsed.name] = parsed.value;
            }
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

  // Неавторизованным пользователям закрываем приватные страницы.
  if (isPrivateRoute && !isAuthenticated) {
    response = NextResponse.redirect(new URL('/sign-in', request.url));
  }

  // Авторизованных пользователей перенаправляем
  // со страниц входа и регистрации на главную.
  else if (isPublicRoute && isAuthenticated) {
    response = NextResponse.redirect(new URL('/', request.url));
  }

  // Во всех остальных случаях разрешаем переход.
  else {
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
