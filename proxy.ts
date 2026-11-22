import { NextRequest, NextResponse } from 'next/server';

// Приватные маршруты

const privateRoutes = ['/notes', '/profile'];

// Маршруты авторизации

const publicRoutes = ['/sign-in', '/sign-up'];

// Проверяем принадлежность маршрута к группе

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

  // Проверяем сессию через серверный API

  let isAuthenticated = false;

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
    }
  } catch (error) {
    console.error('Session validation failed:', error);
  }

  // Защищаем приватные маршруты

  if (isPrivateRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  // Авторизованного пользователя
  // перенаправляем со страниц входа и регистрации

  if (isPublicRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/profile', request.url));
  }

  return NextResponse.next();
}

// Указываем маршруты, для которых запускается Proxy

export const config = {
  matcher: ['/notes/:path*', '/profile/:path*', '/sign-in', '/sign-up'],
};
