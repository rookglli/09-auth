import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';
import { parseSetCookie, stringifyCookie } from 'cookie';

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

  // Получаем cookies через асинхронный API Next.js.
  const cookieStore = await cookies();

  const updatedCookies: Record<string, string> = Object.fromEntries(
    cookieStore.getAll().map(({ name, value }) => [name, value]),
  );

  const requestHeaders = new Headers(request.headers);

  let isAuthenticated = false;
  let sessionCookies: string[] = [];

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
      const data: { success: boolean } = await sessionResponse.json();

      isAuthenticated = data.success === true;

      // Сохраняем cookies, обновлённые сервером авторизации.
      sessionCookies = sessionResponse.headers.getSetCookie();

      for (const cookieString of sessionCookies) {
        const parsed = parseSetCookie(cookieString);

        if (parsed.name && parsed.value !== undefined) {
          updatedCookies[parsed.name] = parsed.value;
        }
      }
    }
  } catch (error) {
    console.error('Session validation failed:', error);
  }

  // Передаём обновлённые cookies следующим серверным обработчикам.
  if (sessionCookies.length > 0) {
    requestHeaders.set('cookie', stringifyCookie(updatedCookies));
  }

  let response: NextResponse;

  if (isPrivateRoute && !isAuthenticated) {
    // Неавторизованный пользователь -> страница входа.
    response = NextResponse.redirect(new URL('/sign-in', request.url));
  } else if (isPublicRoute && isAuthenticated) {
    // Авторизованный пользователь -> главная страница.
    response = NextResponse.redirect(new URL('/', request.url));
  } else {
    response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // Возвращаем обновлённые cookies браузеру.
  // Сохраняем исходные атрибуты HttpOnly, Secure, SameSite и другие.
  for (const cookieString of sessionCookies) {
    response.headers.append('set-cookie', cookieString);
  }

  return response;
}

export const config = {
  matcher: ['/notes/:path*', '/profile/:path*', '/sign-in', '/sign-up'],
};
