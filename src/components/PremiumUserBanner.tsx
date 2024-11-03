import React from 'react';
import { Crown, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const PremiumUserBanner: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <Link 
          to="/success" 
          className="flex items-center justify-between hover:opacity-90 transition-opacity"
        >
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5" />
            <span className="font-medium">Premium Member</span>
          </div>
          <div className="flex items-center gap-1 text-amber-100">
            <span className="text-sm">Access Premium Features</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </Link>
      </div>
    </div>
  );
};

export default PremiumUserBanner;