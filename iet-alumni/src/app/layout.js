import { Inter, Playfair_Display } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import { ChatProvider } from "@/context/ChatContext";
import ChatSidebar from "@/components/chat/ChatSidebar";

const inter = Inter({ subsets: ["latin"] });
const playfair = Playfair_Display({ 
  subsets: ["latin"], 
  variable: '--font-playfair' 
});

export default async function RootLayout({ children }) {
  const cookieStore = await cookies();
  const isLoggedIn = cookieStore.has("token"); 
  const userId = cookieStore.get("userId")?.value || null; 

  return (
    <html lang="en">
      <body className={`${inter.className} ${playfair.variable}`}>
        <ChatProvider isLoggedIn={isLoggedIn}>
          <Header />
          {children}
          <Footer />
          <ScrollToTop />
          {isLoggedIn && <ChatSidebar currentUserId={userId} />}
        </ChatProvider>
      </body>
    </html>
  );
}