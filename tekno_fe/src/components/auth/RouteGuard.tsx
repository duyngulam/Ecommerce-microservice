"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/context/AuthContext";

export default function RouteGuard({
  children,
  role,
}: {
  children: React.ReactNode;
  role?: "admin" | "customer";
}) {
  const { user, isAuthenticated, isLoading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace("/");
      return;
    }

    if (role && user?.role?.toLowerCase() !== role.toLowerCase()) {
      // Authenticated but wrong role (e.g. customer hitting /dashboard)
      router.replace("/");
    }
  }, [isLoading, isAuthenticated, user, role, router]);

  if (isLoading) return null;
  if (!isAuthenticated) return null;
  if (role && user?.role?.toLowerCase() !== role.toLowerCase()) return null;

  return <>{children}</>;
}
