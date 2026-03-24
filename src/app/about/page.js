export default function About() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 sm:p-24 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-yellow-500">About the Project</h1>
      <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl shadow-xl w-full">
        <h2 className="text-2xl font-semibold mb-4 text-white">Purpose</h2>
        <p className="text-gray-300 mb-6 leading-relaxed">
          The Football Player Analyzer is an interactive tool designed to provide detailed
          insights into different football player roles and styles. It helps users understand
          the key attributes, strengths, and playstyles of various positions such as Wingers, 
          Strikers, Midfielders, Fullbacks, and Center Backs.
        </p>
        
        <h2 className="text-2xl font-semibold mb-4 text-white">How it works</h2>
        <ul className="list-disc list-inside text-gray-300 space-y-2 leading-relaxed">
          <li>Navigate to the Analyzer page.</li>
          <li>Select a player position from the dropdown menu.</li>
          <li>Click the "Analyze" button to generate a detailed profile.</li>
          <li>View the interactive result card featuring styles, strengths, and a real-world player example.</li>
        </ul>
      </div>
    </main>
  );
}
