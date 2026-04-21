import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ChatProvider } from "@/context/ChatContext";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ScrollToTop from "@/components/ScrollToTop";


const inter = Inter({ subsets: ["latin"] });
const playfair = Playfair_Display({ 
  subsets: ["latin"], 
  variable: '--font-playfair' 
});

export const metadata = {
  title: "IETLAA",
  description: "Alumni Platform",
  icons: {
    icon: "/logo2.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${playfair.variable}`}>
        <ChatProvider>
          {children}
          <ScrollToTop />
          <ChatSidebar />
        </ChatProvider>
      </body>
    </html>
  );
}