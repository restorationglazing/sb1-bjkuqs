import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ChefHat, Calendar, BookOpen, Wand2, User } from 'lucide-react';
import confetti from 'canvas-confetti';
import { handleSuccessfulPayment } from '../utils/stripe';
import { auth, getUserData, addPremiumUser, verifyPremiumStatus } from '../utils/firebase';
import PremiumUserBanner from './PremiumUserBanner';

const PremiumDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkPaymentAndUpdateStatus = async () => {
      if (sessionId && auth.currentUser) {
        setIsProcessing(true);
        try {
          // First, process the Stripe payment
          await handleSuccessfulPayment(sessionId);
          
          // Add user to premium users collection
          if (auth.currentUser.email) {
            await addPremiumUser(auth.currentUser.email);
          }

          // Verify premium status
          const verificationResult = await verifyPremiumStatus(auth.currentUser.uid);
          if (!verificationResult.isPremium) {
            throw new Error('Premium status verification failed');
          }

          // Force refresh user data
          await getUserData(auth.currentUser.uid, true);
          
          // Clear the session_id from URL
          navigate('/success', { replace: true });
          
          // Trigger confetti
          startConfetti();
        } catch (error) {
          console.error('Error processing payment:', error);
          setError('Failed to process premium upgrade. Please contact support.');
        } finally {
          setIsProcessing(false);
        }
      }
    };

    checkPaymentAndUpdateStatus();
  }, [sessionId, navigate]);

  const startConfetti = () => {
    const duration = 2000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#FF1461', '#18FF92', '#5A87FF', '#FBF38C']
      });
      
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#FF1461', '#18FF92', '#5A87FF', '#FBF38C']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  };

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Processing your premium upgrade...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-50 text-red-600 rounded-lg p-6 max-w-md w-full">
          <h2 className="text-lg font-semibold mb-2">Error Processing Payment</h2>
          <p className="mb-4">{error}</p>
          <Link
            to="/"
            className="inline-block w-full py-3 text-center bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <PremiumUserBanner />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-end mb-8">
          <Link
            to="/account"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
          >
            <User className="w-5 h-5" />
            My Account
          </Link>
        </div>

        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <ChefHat className="w-12 h-12 text-amber-500" />
            <h1 className="text-4xl font-bold text-gray-800">Premium Features</h1>
          </div>
          <p className="text-gray-600">Access your exclusive premium cooking tools</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/ai-chef"
            className="group bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all transform hover:-translate-y-1"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl">
                <Wand2 className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">AI Chef</h3>
              <p className="text-gray-600">Get personalized recipe suggestions and cooking tips from our AI chef</p>
              <span className="inline-flex items-center text-indigo-600 font-medium">
                Try Now
                <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </div>
          </Link>

          <Link
            to="/meal-planner"
            className="group bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all transform hover:-translate-y-1"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl">
                <Calendar className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">Meal Planner</h3>
              <p className="text-gray-600">Plan your weekly meals with smart suggestions and shopping lists</p>
              <span className="inline-flex items-center text-emerald-600 font-medium">
                Plan Meals
                <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </div>
          </Link>

          <Link
            to="/recipe-book"
            className="group bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all transform hover:-translate-y-1"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl">
                <BookOpen className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">Recipe Book</h3>
              <p className="text-gray-600">Access and organize your personal collection of saved recipes</p>
              <span className="inline-flex items-center text-amber-600 font-medium">
                View Recipes
                <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </div>
          </Link>
        </div>

        <div className="flex justify-center mt-12">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all transform hover:-translate-y-0.5"
          >
            <ChefHat className="w-5 h-5" />
            Return to Kitchen
          </Link>
        </div>
      </div>
    </>
  );
};

export default PremiumDashboard;