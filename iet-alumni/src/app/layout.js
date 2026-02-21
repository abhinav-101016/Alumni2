import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });
const playfair = Playfair_Display({ 
  subsets: ["latin"], 
  variable: '--font-playfair' 
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${playfair.variable}`}>
        <Header/>
        {children}
        <Footer/>
      </body>
    </html>
  );
}