import React from 'react';
import { Brain } from 'lucide-react';

const AiLogo: React.FC<{ isPremium?: boolean }> = ({ isPremium }) => {
  return (
    <div className="relative">
      <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
      <div className={`relative flex items-center justify-center w-10 h-10 rounded-full ${
        isPremium 
          ? 'bg-gradient-to-r from-amber-500 to-amber-600'
          : 'bg-gradient-to-r from-purple-600 to-indigo-600'
      }`}>
        <Brain className="w-6 h-6 text-white animate-pulse" />
      </div>
    </div>
  );
};

export default AiLogo;