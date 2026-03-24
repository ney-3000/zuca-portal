"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ChevronDown, Activity, Zap, Shield, Target } from "lucide-react";
import AppleEmoji from "@/components/AppleEmoji";

const playerData = {
  Winger: {
    style: "Explosive dribbler, 1v1 specialist",
    strengths: "Pace, dribbling, creativity",
    weaknesses: "Defensive tracking back",
    player: "Khvicha Kvaratskhelia",
    image: "/images/winger.svg",
    color: "from-yellow-400 to-amber-600",
    video: "https://youtu.be/v_TEVCs-Emk?si=IKzgZkoqkMvVOgOk"
  },
  Striker: {
    style: "Clinical finisher, attacking leader",
    strengths: "Finishing, positioning",
    weaknesses: "Build-up play involvement",
    player: "Victor Osimhen",
    image: "/images/striker.svg",
    color: "from-yellow-400 to-amber-600",
    video: "https://youtu.be/UJh4NAxP76k?si=dQDd2hTJtsUToj7-"
  },
  Midfielder: {
    style: "Controls tempo of game",
    strengths: "Passing, vision",
    weaknesses: "Aerial duels, pace",
    player: "Luka Modric",
    image: "/images/midfielder.svg",
    color: "from-yellow-400 to-amber-600",
    video: "https://youtu.be/atReonbrBbk?si=1sYrq-zu52RX5Ut6"
  },
  Fullback: {
    style: "Attacking defender",
    strengths: "Crossing, stamina",
    weaknesses: "Leaving space behind",
    player: "Achraf Hakimi",
    image: "/images/fullback.svg",
    color: "from-yellow-400 to-amber-600",
    video: "https://youtu.be/VJP54rdF44Y?si=xhz-L9xfcM80sXDu"
  },
  "Center Back": {
    style: "Defensive leader",
    strengths: "Tackling, positioning",
    weaknesses: "Agility, attacking contribution",
    player: "Ruben Dias",
    image: "/images/centerback.svg",
    color: "from-yellow-400 to-amber-600",
    video: "https://youtu.be/QKCll-Wp9dU?si=XVIphLg_6P1KJrls"
  }
};

export default function Analyzer() {
  const [selectedRole, setSelectedRole] = useState("Winger");
  const [result, setResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setResult(null);
    
    // Simulate loading for better UX
    setTimeout(() => {
      setResult(playerData[selectedRole]);
      setIsAnalyzing(false);
    }, 800);
  };

  return (
    <main className="flex-1 flex flex-col items-center p-6 sm:p-12 w-full max-w-5xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-4xl sm:text-5xl font-bold mb-4">Player Analyzer</h1>
        <p className="text-gray-400">Select a position type to analyze key attributes and find your real-world match.</p>
      </div>

      {/* Control Panel */}
      <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl w-full max-w-md shadow-xl mb-12">
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Select Player Type
        </label>
        <div className="relative mb-6">
          <select 
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full appearance-none bg-gray-950 border border-gray-700 text-white py-3 px-4 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          >
            {Object.keys(playerData).map((role) => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>

        <button 
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 disabled:from-yellow-800 disabled:to-yellow-900 text-black font-bold py-3 px-4 rounded-lg transition-all hover:shadow-[0_0_15px_rgba(234,179,8,0.4)] flex justify-center items-center"
        >
          {isAnalyzing ? (
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
            />
          ) : (
            "Analyze Profile"
          )}
        </button>
      </div>

      {/* Results Display */}
      <AnimatePresence mode="wait">
        {result && (
          <motion.div 
            key={result.player}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full"
          >
            <div className="bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
              
              {/* Image Section */}
              <div className={`md:w-2/5 relative h-64 md:h-auto bg-gradient-to-br ${result.color} p-1`}>
                <div className="absolute inset-0 bg-gray-950/20 backdrop-blur-sm z-0"></div>
                <div className="relative z-10 w-full h-full rounded-2xl overflow-hidden bg-gray-900 flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center justify-center text-gray-800">
                     <Image 
                       src={result.image} 
                       alt={result.player}
                       fill
                       className="object-cover opacity-90 hover:scale-105 transition-transform duration-700"
                     />
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 bg-gray-950/80 backdrop-blur-md px-4 py-2 rounded-xl border border-gray-700">
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Similar Player</p>
                    <p className="text-lg font-bold text-white truncate">{result.player}</p>
                  </div>
                </div>
              </div>

              {/* Data Section */}
              <div className="md:w-3/5 p-8 sm:p-10 flex flex-col justify-center">
                <h2 className="text-3xl font-extrabold mb-6 text-white">{selectedRole}</h2>
                
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-5 h-5 text-yellow-500" />
                      <h3 className="text-lg font-semibold text-gray-200">Playstyle</h3>
                    </div>
                    <p className="text-gray-400 pl-7">{result.style}</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-5 h-5 text-yellow-500" />
                      <h3 className="text-lg font-semibold text-gray-200">Key Strengths</h3>
                    </div>
                    <div className="pl-7 flex flex-wrap gap-2">
                      {result.strengths.split(', ').map((str, i) => (
                        <span key={i} className="bg-gray-800 border border-yellow-500/30 text-yellow-100 px-3 py-1 rounded-full text-sm">
                          {str}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-5 h-5 text-yellow-500" />
                      <h3 className="text-lg font-semibold text-gray-200">Weaknesses</h3>
                    </div>
                    <p className="text-gray-400 pl-7">{result.weaknesses}</p>
                  </div>
                </div>

                <a 
                  href={result.video}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 flex items-center justify-center gap-3 bg-gray-950 hover:bg-black border border-yellow-500 hover:border-yellow-400 text-yellow-500 hover:text-yellow-400 font-bold py-3 px-6 rounded-xl transition-all shadow-[0_0_10px_rgba(234,179,8,0.2)] hover:shadow-[0_0_20px_rgba(234,179,8,0.4)] w-full"
                >
                  <AppleEmoji name="camera" className="w-6 h-6 inline-block drop-shadow-sm" />
                  Analyze the player
                </a>
                
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
