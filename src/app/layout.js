import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "Football Player Analyzer",
  description: "Analyze different football player profiles",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-gray-950 text-white min-h-screen flex flex-col" suppressHydrationWarning>
        <Navbar />
        {children}
        <footer className="mt-auto py-6 border-t border-gray-800 text-center text-gray-500 text-sm">
          developed by Neyton Muhlanga
        </footer>
      </body>
    </html>
  );
}
