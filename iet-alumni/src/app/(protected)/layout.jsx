// 📁 src/app/(protected)/layout.jsx
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function ProtectedLayout({ children }) {
  return (
    <ProtectedRoute>
      {children}
    </ProtectedRoute>
  );
}
