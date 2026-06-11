import "./globals.css";
import BottomNav from "@/components/BottomNav";
import Header from "@/components/Header";
import VisitorTracker from "@/components/VisitorTracker";

export const metadata = {
  title: "Zuca - Portal de Serviços Digitais",
  description: "Acesse serviços públicos, vagas e reporte falhas em Moçambique com extrema velocidade.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-MZ" suppressHydrationWarning>
      {/* 
        bg-charcoal sets the entire document behind the app to black.
        We ensure smooth text aliasing across PCs and Mobiles. 
      */}
      <body className="antialiased bg-charcoal text-white min-h-screen flex flex-col font-sans overflow-x-hidden selection:bg-mint selection:text-charcoal" suppressHydrationWarning>
        <VisitorTracker />
        <Header />
        
        {/* Main Content Area - Expansive width on Desktop, padded bottom for mobile nav only */}
        <main className="flex-1 w-full mx-auto pb-20 md:pb-8 flex flex-col">
          {children}
        </main>

        <BottomNav />
      </body>
    </html>
  );
}
