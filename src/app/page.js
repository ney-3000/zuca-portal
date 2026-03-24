import Link from "next/link";
import { ArrowRight } from "lucide-react";
import AppleEmoji from "@/components/AppleEmoji";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 sm:p-24 relative overflow-hidden">
      {/* Background Decorators */}
      <div className="absolute top-[20%] left-[10%] w-72 h-72 bg-yellow-600/10 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-amber-600/10 rounded-full blur-[120px] -z-10" />
      
      <div className="text-center max-w-3xl pb-16">
        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 via-yellow-500 to-amber-600">
          Football Player Analyzer
        </h1>
        <p className="text-xl sm:text-2xl text-gray-400 mb-10 leading-relaxed max-w-2xl mx-auto">
          Discover the unique playstyles, strengths, and weaknesses of different football positions.
          Find out who matches your favorite role on the pitch.
        </p>
        
        <Link 
          href="/analyzer"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-yellow-500 text-black px-8 py-4 rounded-full text-lg font-bold transition-all hover:scale-105 shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)]"
        >
          Start Analyzing
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>

      {/* Mini Feature grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-5xl">
        <div className="bg-gray-900/80 border border-yellow-500/20 hover:border-yellow-500/50 transition-colors p-6 rounded-2xl backdrop-blur-sm shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
          <div className="mb-4"><AppleEmoji name="chart" className="w-10 h-10 drop-shadow-[0_0_10px_rgba(250,204,21,0.6)]" /></div>
          <h3 className="text-lg font-bold text-yellow-500 mb-2">Deep Insights</h3>
          <p className="text-gray-400 text-sm">Analyze specific playstyles and understand the nuances of each role.</p>
        </div>
        <div className="bg-gray-900/80 border border-yellow-500/20 hover:border-yellow-500/50 transition-colors p-6 rounded-2xl backdrop-blur-sm shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
          <div className="mb-4"><AppleEmoji name="star" className="w-10 h-10 drop-shadow-[0_0_10px_rgba(250,204,21,0.6)]" /></div>
          <h3 className="text-lg font-bold text-yellow-500 mb-2">Real Examples</h3>
          <p className="text-gray-400 text-sm">See which real-world star matches the position perfectly.</p>
        </div>
        <div className="bg-gray-900/80 border border-yellow-500/20 hover:border-yellow-500/50 transition-colors p-6 rounded-2xl backdrop-blur-sm shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
          <div className="mb-4"><AppleEmoji name="lightning" className="w-10 h-10 drop-shadow-[0_0_10px_rgba(250,204,21,0.6)]" /></div>
          <h3 className="text-lg font-bold text-yellow-500 mb-2">Interactive</h3>
          <p className="text-gray-400 text-sm">Engaging, dynamic interface to make learning fun.</p>
        </div>
      </div>
    </main>
  );
}
