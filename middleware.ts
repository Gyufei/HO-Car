export { auth as middleware } from "@/auth";

export const config = {
  matcher: ["/", "/ele/:path*", "/water/:path*", "/api/bills/:path*"],
};

