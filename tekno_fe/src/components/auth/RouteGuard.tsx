"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/context/AuthContext";

/**
 * Redirects unauthenticated users or non-admins away from protected pages.
 * Usage: drop <RouteGuard role="admin"> or <RouteGuard> inside any layout.
 */
export default function RouteGuard({
  children,
  role,
}: {
  children: React.ReactNode;
  role?: "admin" | "customer";
}) {
  const { user, isAuthenticated } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/");
      return;
    }
    if (role && user?.role?.toLowerCase() !== role.toLowerCase()) {
      // Authenticated but wrong role (e.g. customer hitting /dashboard)
      router.replace("/");
    }
  }, [isAuthenticated, user, role, router]);

  // Render nothing while redirecting to avoid flash
  if (!isAuthenticated) return null;
  if (role && user?.role?.toLowerCase() !== role.toLowerCase()) return null;

  return <>{children}</>;
}
