import React from 'react';
import { Clock, Users } from 'lucide-react';
import { type Ingredient } from '../types';
import { findRecipes } from '../utils/recipeMatch';

interface Props {
  ingredients: Ingredient[];
  isPremium?: boolean;
}

const RecipeSuggestions: React.FC<Props> = ({ ingredients, isPremium }) => {
  const recipes = findRecipes(ingredients);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {recipes.map((recipe) => (
        <div key={recipe.id} className="bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-xl transition-shadow">
          <div className="h-48 overflow-hidden">
            <img
              src={recipe.image}
              alt={recipe.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div className="p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{recipe.name}</h3>
            <div className="flex items-center gap-4 text-gray-600 mb-4">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{recipe.cookTime} mins</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{recipe.servings} servings</span>
              </div>
            </div>
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-600 mb-2">You have {recipe.matchingIngredients.length} of {recipe.totalIngredients} ingredients:</h4>
              <div className="flex flex-wrap gap-1">
                {recipe.matchingIngredients.map((ing, index) => (
                  <span key={index} className="text-sm px-2 py-1 bg-green-100 text-green-700 rounded-full">
                    {ing}
                  </span>
                ))}
              </div>
            </div>
            <button className={`w-full py-2 text-white rounded-lg transition-colors ${
              isPremium 
                ? 'bg-amber-500 hover:bg-amber-600'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}>
              View Recipe
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecipeSuggestions;