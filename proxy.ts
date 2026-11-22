import { NextRequest, NextResponse } from 'next/server';
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

  let isAuthenticated = false;

  const requestHeaders = new Headers(request.headers);

  const updatedCookies = Object.fromEntries(
    request.cookies.getAll().map(({ name, value }) => [name, value]),
  );

  let sessionCookies: string[] = [];

  try {
    const response = await fetch(new URL('/api/auth/session', request.url), {
      method: 'GET',
      headers: {
        Cookie: request.headers.get('cookie') ?? '',
      },
      cache: 'no-store',
    });

    if (response.ok) {
      const data: { success: boolean } = await response.json();

      isAuthenticated = data.success === true;

      sessionCookies = response.headers.getSetCookie();

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

  if (sessionCookies.length > 0) {
    requestHeaders.set('cookie', stringifyCookie(updatedCookies));
  }

  let response: NextResponse;

  if (isPrivateRoute && !isAuthenticated) {
    response = NextResponse.redirect(new URL('/sign-in', request.url));
  } else if (isPublicRoute && isAuthenticated) {
    response = NextResponse.redirect(new URL('/profile', request.url));
  } else {
    response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  for (const cookieString of sessionCookies) {
    response.headers.append('set-cookie', cookieString);
  }

  return response;
}

export const config = {
  matcher: ['/notes/:path*', '/profile/:path*', '/sign-in', '/sign-up'],
};
