import React, { useState } from 'react';
import { Sparkles, ChefHat, Calendar, BookOpen, Crown, ArrowRight } from 'lucide-react';
import { handlePremiumCheckout } from '../utils/stripe';
import { useNavigate } from 'react-router-dom';
import AuthModal from './AuthModal';
import { auth } from '../utils/firebase';
import { usePremiumStatus } from '../hooks/usePremiumStatus';

const PremiumBanner: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { isPremium } = usePremiumStatus();
  const navigate = useNavigate();

  const handleUpgradeClick = async () => {
    if (isPremium) {
      navigate('/success');
      return;
    }

    if (!auth.currentUser) {
      setShowAuthModal(true);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      await handlePremiumCheckout();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed. Please try again.');
      console.error('Checkout error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthSuccess = async () => {
    setShowAuthModal(false);
    // Proceed with premium checkout after successful authentication
    await handleUpgradeClick();
  };

  if (isPremium) {
    return (
      <div className="relative overflow-hidden bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 rounded-2xl p-8 text-white mb-8 shadow-xl">
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Crown className="w-8 h-8 text-white animate-pulse" />
            <div>
              <h3 className="text-2xl font-bold mb-2">Premium Member</h3>
              <p className="text-amber-100">Access your exclusive premium features</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/success')}
            className="group px-6 py-3 bg-white text-amber-600 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
          >
            Visit Premium Section
            <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 rounded-2xl p-8 text-white mb-8 shadow-xl">
        {/* Animated background effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/50 to-indigo-600/50">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtNi42MjcgMC0xMiA1LjM3My0xMiAxMnM1LjM3MyAxMiAxMiAxMiAxMi01LjM3MyAxMi0xMi01LjM3My0xMi0xMi0xMnptMCAxOGMtMy4zMTQgMC02LTIuNjg2LTYtNnMyLjY4Ni02IDYtNiA2IDIuNjg2IDYgNi0yLjY4NiA2LTYgNnoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjEiLz48L2c+PC9zdmc+')] animate-[grain_8s_steps(10)_infinite]"></div>
        </div>

        <div className="relative">
          <div className="flex items-start justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Crown className="w-8 h-8 text-amber-300 animate-pulse" />
                <h3 className="text-2xl font-bold">Upgrade to Premium</h3>
              </div>
              <p className="text-lg text-purple-100 mb-6 max-w-xl">
                Unlock the full potential of your kitchen with AI-powered cooking assistance
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 justify-end">
                <span className="text-3xl font-bold">£4.99</span>
                <span className="text-purple-200">/month</span>
              </div>
              <div className="text-purple-200 text-sm">Cancel anytime</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 transform hover:scale-105 transition-transform">
              <ChefHat className="w-6 h-6 text-amber-300 mb-2" />
              <h4 className="font-semibold mb-2">AI Chef Assistant</h4>
              <p className="text-purple-100 text-sm">Get personalized recipe suggestions and cooking tips from our AI chef</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 transform hover:scale-105 transition-transform">
              <Calendar className="w-6 h-6 text-amber-300 mb-2" />
              <h4 className="font-semibold mb-2">Smart Meal Planning</h4>
              <p className="text-purple-100 text-sm">Generate weekly meal plans with automatic shopping lists</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 transform hover:scale-105 transition-transform">
              <BookOpen className="w-6 h-6 text-amber-300 mb-2" />
              <h4 className="font-semibold mb-2">Recipe Library</h4>
              <p className="text-purple-100 text-sm">Save and organize your favorite recipes with detailed instructions</p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/25 rounded-xl text-white text-sm">
              {error}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <button
              onClick={handleUpgradeClick}
              disabled={isLoading}
              className="group w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              <Sparkles className="w-5 h-5" />
              <span>{isLoading ? 'Processing...' : 'Start Premium'}</span>
              <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="text-purple-200 text-sm">
              7-day free trial • Cancel anytime • Monthly billing
            </p>
          </div>
        </div>
      </div>

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
      )}
    </>
  );
};

export default PremiumBanner;