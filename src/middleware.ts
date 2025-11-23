import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const userCookie = request.cookies.get('user')?.value;
  
  let userRole: string | null = null;

  if (userCookie) {
    try {
      const user = JSON.parse(decodeURIComponent(userCookie));
      userRole = user.rol;
    } catch (e) {
      console.error('Error parsing user cookie', e);
    }
  }

  const { pathname } = request.nextUrl;

  // Proteger ruta /admin - solo accesible para admin
  if (pathname.startsWith('/admin')) {
    if (!token) {
      // No autenticado - redirigir a login
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    if (userRole !== 'admin') {
      // Autenticado pero no es ADMIN - redirigir a home
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Redirigir usuarios autenticados fuera de login/register
  if ((pathname === '/login' || pathname === '/register') && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/login', '/register'],
};
