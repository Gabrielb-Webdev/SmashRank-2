export { default } from 'next-auth/middleware';

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/tournaments/create',
    '/tournaments/:id/edit',
    '/profile/:path*',
    '/admin/:path*',
  ],
};
