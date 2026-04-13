// 📁 src/app/(protected)/layout.jsx
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

export default function ProtectedLayout({ children }) {
  return (
    <ProtectedRoute>
      <Header/>
      {children}
      <Footer/>
    </ProtectedRoute>
  );
}
