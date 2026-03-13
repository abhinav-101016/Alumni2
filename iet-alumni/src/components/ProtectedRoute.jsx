// 📁 src/components/ProtectedRoute.jsx
"use client";

import { useAuth } from "@/hooks/useAuth";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth({ redirectTo: "/login" });

  // Show spinner while checking auth
  if (loading) {
    return (
      <div className="w-full min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-[#800000] border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-600 font-black uppercase tracking-widest text-sm">
          Verifying Session...
        </p>
      </div>
    );
  }

  // User verified — render the page
  if (user) return <>{children}</>;

  // Not logged in — useAuth already redirected, show nothing
  return null;
}
