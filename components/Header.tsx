import React from 'react';
import { SparklesIcon } from './icons';

const Header: React.FC = () => {
  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 p-4 shadow-sm">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-teal-500 flex items-center justify-center gap-2">
          <SparklesIcon className="w-7 h-7" />
          <span>Gemini Creative Suite</span>
        </h1>
      </div>
    </header>
  );
};

export default Header;