// 📁 src/hooks/useAuth.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function useAuth({ redirectTo = "/login", redirectIfFound = false } = {}) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/status`, {
          credentials: "include",
          cache: "no-store",
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);

          // If logged in and redirectIfFound (e.g. login page) → go to dashboard
          if (redirectIfFound) {
            router.replace("/dashboard");
          }
        } else {
          setUser(null);
          // If not logged in and on protected route → go to login
          if (redirectTo && !redirectIfFound) {
            router.replace(`${redirectTo}?redirect=${window.location.pathname}`);
          }
        }
      } catch {
        setUser(null);
        if (redirectTo && !redirectIfFound) {
          router.replace(redirectTo);
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  return { user, loading };
}
