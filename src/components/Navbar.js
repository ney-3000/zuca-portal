import Link from "next/link";
import AppleEmoji from "@/components/AppleEmoji";

export default function Navbar() {
  return (
    <nav className="w-full bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link href="/" className="text-xl font-bold text-white flex items-center gap-2">
              <AppleEmoji name="soccer" className="w-6 h-6 inline-block drop-shadow-md" />
              <span>Player</span><span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">Analyzer</span>
            </Link>
          </div>
          <div className="flex space-x-1 sm:space-x-8">
            <Link 
              href="/" 
              className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-gray-800"
            >
              Home
            </Link>
            <Link 
              href="/analyzer" 
              className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-gray-800"
            >
              Analyzer
            </Link>
            <Link 
              href="/about" 
              className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-gray-800"
            >
              About
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
