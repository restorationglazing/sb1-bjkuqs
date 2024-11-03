import React, { useState, useEffect, useRef } from 'react';
import { ChefHat, PlusCircle, Search, Wand2, UtensilsCrossed, Crown, User } from 'lucide-react';
import { Routes, Route, useLocation, useNavigate, Link } from 'react-router-dom';
import { auth, getUserData, type UserData } from './utils/firebase';
import IngredientList from './components/IngredientList';
import RecipeSuggestions from './components/RecipeSuggestions';
import RecipeModal from './components/RecipeModal';
import PremiumBanner from './components/PremiumBanner';
import PremiumUserBanner from './components/PremiumUserBanner';
import PremiumDashboard from './components/PremiumDashboard';
import AccountPage from './components/AccountPage';
import AuthModal from './components/AuthModal';
import AiChef from './components/AiChef';
import MealPlanner from './components/MealPlanner';
import RecipeBook from './components/RecipeBook';
import AiLogo from './components/AiLogo';
import PremiumStatus from './components/PremiumStatus';
import { type Ingredient } from './types';
import { generateRecipe } from './utils/openai';
import { commonIngredients } from './utils/ingredients';

function App() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [newIngredient, setNewIngredient] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState<any>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState(auth.currentUser);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setIsLoadingUser(true);
      setUser(user);
      if (user) {
        try {
          const data = await getUserData(user.uid);
          setUserData(data);
          if (data.isPremium && location.pathname === '/') {
            navigate('/success');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        setUserData(null);
      }
      setIsLoadingUser(false);
    });

    return () => unsubscribe();
  }, [navigate, location.pathname]);

  useEffect(() => {
    const refreshUserData = async () => {
      if (user) {
        try {
          const data = await getUserData(user.uid);
          setUserData(data);
          if (data.isPremium && location.pathname === '/') {
            navigate('/success');
          }
        } catch (error) {
          console.error('Error refreshing user data:', error);
        }
      }
    };

    refreshUserData();
  }, [user, location.pathname, navigate]);

  useEffect(() => {
    const searchTerm = newIngredient.trim().toLowerCase();
    if (searchTerm) {
      const filtered = commonIngredients
        .filter(ingredient => 
          ingredient.toLowerCase().includes(searchTerm)
        )
        .slice(0, 5);
      setSuggestions(filtered);
      setSelectedSuggestionIndex(-1);
    } else {
      setSuggestions([]);
      setSelectedSuggestionIndex(-1);
    }
  }, [newIngredient]);

  const addIngredient = (ingredient: string = newIngredient) => {
    const trimmedIngredient = ingredient.trim();
    if (trimmedIngredient) {
      setIngredients(prev => {
        // Check if ingredient already exists
        if (prev.some(ing => ing.name.toLowerCase() === trimmedIngredient.toLowerCase())) {
          return prev;
        }
        return [...prev, { id: Date.now().toString(), name: trimmedIngredient }];
      });
      setNewIngredient('');
      setSuggestions([]);
      setSelectedSuggestionIndex(-1);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const removeIngredient = (id: string) => {
    setIngredients(prev => prev.filter(ing => ing.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => prev > -1 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          addIngredient(suggestions[selectedSuggestionIndex]);
        } else if (suggestions.length > 0) {
          addIngredient(suggestions[0]);
        } else {
          addIngredient();
        }
        break;
      case 'Escape':
        setSuggestions([]);
        setSelectedSuggestionIndex(-1);
        break;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewIngredient(e.target.value);
  };

  const handleDiscoverRecipe = async () => {
    if (ingredients.length === 0) return;
    
    setIsGenerating(true);
    try {
      const recipe = await generateRecipe(ingredients);
      setGeneratedRecipe(recipe);
    } catch (error) {
      console.error('Failed to generate recipe:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const HomePage = () => (
    <>
      {!isLoadingUser && userData?.isPremium && <PremiumUserBanner />}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <AiLogo isPremium={userData?.isPremium} />
          <div className="flex items-center gap-4">
            <PremiumStatus />
            {userData?.isPremium && (
              <Link
                to="/success"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all"
              >
                <Crown className="w-5 h-5" />
                Premium Dashboard
              </Link>
            )}
            {user ? (
              <Link
                to="/account"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
              >
                <User className="w-5 h-5" />
                My Account
              </Link>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
              >
                <User className="w-5 h-5" />
                Sign In
              </button>
            )}
          </div>
        </div>

        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <ChefHat className={`w-12 h-12 ${userData?.isPremium ? 'text-amber-500' : 'text-indigo-600'}`} />
            <h1 className="text-4xl font-bold text-gray-800">What Can I Cook?</h1>
          </div>
          <p className="text-gray-600">Discover delicious recipes with ingredients you already have</p>
        </header>

        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex gap-3 mb-6">
            <div className="relative flex-1">
              <input
                type="text"
                ref={inputRef}
                value={newIngredient}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Add an ingredient..."
                className={`w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 outline-none transition-all pl-10 ${
                  userData?.isPremium 
                    ? 'focus:border-amber-500 focus:ring-amber-200'
                    : 'focus:border-indigo-500 focus:ring-indigo-200'
                }`}
              />
              <Search className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
              {suggestions.length > 0 && (
                <ul className="absolute z-10 w-full bg-white mt-1 rounded-lg shadow-lg border border-gray-200">
                  {suggestions.map((suggestion, index) => (
                    <li
                      key={index}
                      className={`px-4 py-2 cursor-pointer ${
                        index === selectedSuggestionIndex 
                          ? 'bg-gray-100' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => addIngredient(suggestion)}
                    >
                      {suggestion}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <button
              onClick={() => addIngredient()}
              className={`px-6 py-3 text-white rounded-lg transition-colors flex items-center gap-2 ${
                userData?.isPremium
                  ? 'bg-amber-500 hover:bg-amber-600'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              <PlusCircle className="w-5 h-5" />
              Add
            </button>
          </div>

          <IngredientList ingredients={ingredients} onRemove={removeIngredient} />

          {ingredients.length > 0 && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={handleDiscoverRecipe}
                disabled={isGenerating}
                className={`px-6 py-3 text-white rounded-lg transition-all flex items-center gap-2 ${
                  isGenerating ? 'opacity-75 cursor-not-allowed' : ''
                } ${
                  userData?.isPremium
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700'
                }`}
              >
                <Wand2 className="w-5 h-5" />
                {isGenerating ? 'Discovering Recipe...' : 'Discover New Recipe'}
              </button>
            </div>
          )}
        </div>

        {!isLoadingUser && !userData?.isPremium && <PremiumBanner />}

        {ingredients.length > 0 ? (
          <RecipeSuggestions ingredients={ingredients} isPremium={userData?.isPremium} />
        ) : (
          <div className="text-center py-12">
            <UtensilsCrossed className={`w-16 h-16 mx-auto mb-4 ${
              userData?.isPremium ? 'text-amber-300' : 'text-gray-300'
            }`} />
            <p className="text-gray-500">Add some ingredients to get recipe suggestions!</p>
          </div>
        )}

        {generatedRecipe && (
          <RecipeModal
            recipe={generatedRecipe}
            onClose={() => setGeneratedRecipe(null)}
            isPremium={userData?.isPremium}
          />
        )}
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/success" element={<PremiumDashboard />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/ai-chef" element={<AiChef />} />
        <Route path="/meal-planner" element={<MealPlanner />} />
        <Route path="/recipe-book" element={<RecipeBook />} />
      </Routes>

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => {
            setShowAuthModal(false);
          }}
        />
      )}
    </div>
  );
}

export default App;