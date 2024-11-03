import React, { useState } from 'react';
import { Calendar, ArrowLeft, Plus, Trash2, Save, RefreshCw, ChevronLeft, ChevronRight, BookOpen, Pin, ShoppingBag, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { generateMealPlan, generateCustomRecipe, generateShoppingList } from '../utils/openai';
import { useSavedRecipes } from '../hooks/useSavedRecipes';
import ShoppingListModal from './ShoppingListModal';
import ServingsModal from './ServingsModal';

interface Meal {
  id: string;
  day: string;
  type: 'breakfast' | 'lunch' | 'dinner';
  name: string;
  isPinned?: boolean;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEAL_TYPES = ['breakfast', 'lunch', 'dinner'] as const;

const MealPlanner: React.FC = () => {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [showServingsModal, setShowServingsModal] = useState(true);
  const [servings, setServings] = useState(2);
  const [shoppingList, setShoppingList] = useState<{ category: string; items: string[] }[]>([]);
  const [isGeneratingList, setIsGeneratingList] = useState(false);
  const navigate = useNavigate();
  const { saveRecipe } = useSavedRecipes();

  const handleGenerateShoppingList = async () => {
    if (meals.length === 0) return;
    
    setIsGeneratingList(true);
    try {
      const mealNames = meals.map(meal => `${meal.name} (for ${servings} people)`).filter(name => name.trim() !== '');
      const list = await generateShoppingList(mealNames);
      setShoppingList(list);
      setShowShoppingList(true);
    } catch (error) {
      console.error('Failed to generate shopping list:', error);
    } finally {
      setIsGeneratingList(false);
    }
  };

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const plan = await generateMealPlan();
      const newMeals = plan.flatMap((dayPlan, dayIndex) => {
        const existingDayMeals = meals.filter(m => m.day === DAYS[dayIndex] && m.isPinned);
        const dayMeals: Meal[] = [];

        MEAL_TYPES.forEach(type => {
          const existing = existingDayMeals.find(m => m.type === type);
          if (existing) {
            dayMeals.push(existing);
          } else {
            dayMeals.push({
              id: `${DAYS[dayIndex]}-${type}-${Date.now()}`,
              day: DAYS[dayIndex],
              type,
              name: dayPlan[type],
              isPinned: false
            });
          }
        });

        return dayMeals;
      });
      setMeals(newMeals);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to generate meal plan');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveRecipe = async (meal: Meal) => {
    setIsSaving(meal.id);
    try {
      const recipeDetails = await generateCustomRecipe(`Generate a detailed recipe for ${meal.name} to serve ${servings} people`);
      const [ingredients, instructions] = recipeDetails.split('\n\n');
      
      saveRecipe({
        name: meal.name,
        mealType: `${meal.day} - ${meal.type} (${servings} servings)`,
        ingredients,
        instructions
      });
    } catch (error) {
      console.error('Failed to save recipe:', error);
    } finally {
      setIsSaving(null);
    }
  };

  const handlePinMeal = (id: string) => {
    setMeals(meals.map(meal => 
      meal.id === id ? { ...meal, isPinned: !meal.isPinned } : meal
    ));
  };

  const handleAddMeal = (day: string, type: 'breakfast' | 'lunch' | 'dinner') => {
    const newMeal = {
      id: `${day}-${type}-${Date.now()}`,
      day,
      type,
      name: '',
      isPinned: false
    };
    setMeals([...meals, newMeal]);
  };

  const handleUpdateMeal = (id: string, name: string) => {
    setMeals(meals.map(meal => 
      meal.id === id ? { ...meal, name } : meal
    ));
  };

  const handleRemoveMeal = (id: string) => {
    setMeals(meals.filter(meal => meal.id !== id));
  };

  const getMealsForDay = (day: string) => {
    return MEAL_TYPES.map(type => {
      const meal = meals.find(m => m.day === day && m.type === type);
      return { type, meal };
    });
  };

  const handlePreviousDay = () => {
    setCurrentDayIndex((prev) => (prev === 0 ? DAYS.length - 1 : prev - 1));
  };

  const handleNextDay = () => {
    setCurrentDayIndex((prev) => (prev === DAYS.length - 1 ? 0 : prev + 1));
  };

  const hasUnpinnedMeals = meals.some(meal => !meal.isPinned);

  if (showServingsModal) {
    return (
      <ServingsModal
        servings={servings}
        onServingsChange={setServings}
        onClose={() => setShowServingsModal(false)}
      />
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/success')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-purple-600" />
            <h1 className="text-2xl font-bold text-gray-800">Weekly Meal Planner</h1>
          </div>
        </div>
        <button
          onClick={() => setShowServingsModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <Users className="w-5 h-5" />
          <span className="hidden sm:inline">{servings} {servings === 1 ? 'Person' : 'People'}</span>
          <span className="sm:hidden">{servings}</span>
        </button>
      </div>

      <div className="mb-6 space-y-4">
        <button
          onClick={handleGeneratePlan}
          disabled={isGenerating}
          className={`w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2 ${
            isGenerating ? 'opacity-75 cursor-not-allowed' : ''
          }`}
        >
          <RefreshCw className={`w-5 h-5 ${isGenerating ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">
            {isGenerating ? 'Generating Plan...' : hasUnpinnedMeals ? 'Re-generate Unselected Meals' : 'Generate Meal Plan'}
          </span>
          <span className="sm:hidden">
            {isGenerating ? 'Generating...' : 'Generate'}
          </span>
        </button>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={handleGenerateShoppingList}
            disabled={isGeneratingList || meals.length === 0}
            className={`w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 ${
              isGeneratingList || meals.length === 0 ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            <ShoppingBag className="w-5 h-5" />
            <span className="hidden sm:inline">
              {isGeneratingList ? 'Generating List...' : 'Shopping List'}
            </span>
            <span className="inline sm:hidden">List</span>
          </button>

          <button
            onClick={() => navigate('/recipe-book')}
            className="w-full px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center justify-center gap-2"
          >
            <BookOpen className="w-5 h-5" />
            <span className="hidden sm:inline">Recipe Book</span>
            <span className="inline sm:hidden">Book</span>
          </button>
        </div>
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handlePreviousDay}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            <h3 className="text-xl font-semibold text-white">{DAYS[currentDayIndex]}</h3>
            <button
              onClick={handleNextDay}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
        <div className="p-6 space-y-6">
          {getMealsForDay(DAYS[currentDayIndex]).map(({ type, meal }) => (
            <div key={type} className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-medium text-gray-700 capitalize">
                  {type}
                </h4>
                {!meal && (
                  <button
                    onClick={() => handleAddMeal(DAYS[currentDayIndex], type)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <Plus className="w-5 h-5 text-gray-400" />
                  </button>
                )}
              </div>
              {meal ? (
                <div className="flex items-start gap-2">
                  <input
                    type="text"
                    value={meal.name}
                    onChange={(e) => handleUpdateMeal(meal.id, e.target.value)}
                    placeholder="Enter meal..."
                    className={`flex-1 px-4 py-3 text-base border border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all ${
                      meal.isPinned ? 'bg-purple-50 border-purple-200' : ''
                    }`}
                  />
                  <button
                    onClick={() => handlePinMeal(meal.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      meal.isPinned 
                        ? 'bg-purple-100 text-purple-600' 
                        : 'hover:bg-purple-50 text-gray-400'
                    }`}
                    title={meal.isPinned ? 'Unpin from planner' : 'Pin to planner'}
                  >
                    <Pin className={`w-5 h-5 ${meal.isPinned ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    onClick={() => handleSaveRecipe(meal)}
                    disabled={isSaving === meal.id}
                    className={`p-2 hover:bg-green-50 rounded-lg transition-colors ${
                      isSaving === meal.id ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    title="Save to recipe book"
                  >
                    <Save className={`w-5 h-5 text-green-600 ${
                      isSaving === meal.id ? 'animate-pulse' : ''
                    }`} />
                  </button>
                  <button
                    onClick={() => handleRemoveMeal(meal.id)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove meal"
                  >
                    <Trash2 className="w-5 h-5 text-red-500" />
                  </button>
                </div>
              ) : (
                <div className="h-14 border border-dashed border-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                  No meal planned
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex justify-center gap-2">
        {DAYS.map((day, index) => (
          <button
            key={day}
            onClick={() => setCurrentDayIndex(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              currentDayIndex === index
                ? 'bg-purple-600 scale-125'
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
            aria-label={day}
          />
        ))}
      </div>

      {showShoppingList && (
        <ShoppingListModal
          shoppingList={shoppingList}
          servings={servings}
          onClose={() => setShowShoppingList(false)}
        />
      )}
    </div>
  );
};

export default MealPlanner;