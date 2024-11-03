import React from 'react';
import { usePremiumStatus } from '../hooks/usePremiumStatus';
import { AlertTriangle, CheckCircle, Loader } from 'lucide-react';

const PremiumStatus: React.FC = () => {
  const { isPremium, isLoading, error, lastVerified } = usePremiumStatus();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-gray-600">
        <Loader className="w-4 h-4 animate-spin" />
        <span>Verifying premium status...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-red-600">
        <AlertTriangle className="w-4 h-4" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {isPremium ? (
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle className="w-4 h-4" />
          <span>Premium Active</span>
        </div>
      ) : (
        <div className="text-gray-600">
          Free Account
        </div>
      )}
      {lastVerified && (
        <span className="text-xs text-gray-400">
          Last verified: {new Date(lastVerified).toLocaleTimeString()}
        </span>
      )}
    </div>
  );
};

export default PremiumStatus;