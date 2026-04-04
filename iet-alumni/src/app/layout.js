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
  return (
    <html lang="en">
      <body className={`${inter.className} ${playfair.variable}`}>
        <ChatProvider>
          <Header />
          {children}
          <Footer />
          <ScrollToTop />
          <ChatSidebar />
        </ChatProvider>
      </body>
    </html>
  );
}