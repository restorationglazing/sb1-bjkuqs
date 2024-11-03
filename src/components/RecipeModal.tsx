import React from 'react';
import { X } from 'lucide-react';

interface Recipe {
  name: string;
  cookTime: number;
  servings: number;
  ingredients: string[];
  instructions: string[];
}

interface Props {
  recipe: Recipe | null;
  onClose: () => void;
  isPremium?: boolean;
}

const RecipeModal: React.FC<Props> = ({ recipe, onClose, isPremium }) => {
  if (!recipe) return null;

  // Helper function to safely convert potentially object values to strings
  const sanitizeText = (text: unknown): string => {
    if (typeof text === 'string') return text;
    if (typeof text === 'object' && text !== null) {
      // If it's an object, try to extract a meaningful string representation
      const obj = text as Record<string, unknown>;
      return Object.values(obj)[0]?.toString() || '';
    }
    return String(text || '');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className={`sticky top-0 bg-white p-4 border-b flex justify-between items-center ${
          isPremium ? 'bg-gradient-to-r from-amber-500 to-amber-600' : ''
        }`}>
          <h2 className={`text-2xl font-bold ${isPremium ? 'text-white' : 'text-gray-800'}`}>
            {sanitizeText(recipe.name)}
          </h2>
          <button
            onClick={onClose}
            className={`p-1 rounded-full transition-colors ${
              isPremium 
                ? 'hover:bg-white/10 text-white' 
                : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6">
          <div className="mb-6">
            <div className="flex gap-4 text-gray-600 mb-4">
              <span>🕒 {recipe.cookTime} minutes</span>
              <span>👥 {recipe.servings} servings</span>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Ingredients</h3>
            <ul className="list-disc list-inside space-y-2">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="text-gray-700">
                  {sanitizeText(ingredient)}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Instructions</h3>
            <ol className="list-decimal list-inside space-y-3">
              {recipe.instructions.map((step, index) => (
                <li key={index} className="text-gray-700">
                  {sanitizeText(step)}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeModal;