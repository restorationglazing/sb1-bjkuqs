import React from 'react';
import { ArrowLeft, BookOpen, Search, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSavedRecipes } from '../hooks/useSavedRecipes';

const RecipeBook: React.FC = () => {
  const navigate = useNavigate();
  const { recipes, removeRecipe } = useSavedRecipes();
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredRecipes = recipes.filter(recipe => 
    recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 flex items-center gap-4">
        <button
          onClick={() => navigate('/success')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-purple-600" />
          <h1 className="text-2xl font-bold text-gray-800">Recipe Book</h1>
        </div>
      </div>

      <div className="mb-6 relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search recipes..."
          className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
        />
        <Search className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRecipes.length > 0 ? (
          filteredRecipes.map((recipe) => (
            <div key={recipe.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{recipe.name}</h3>
                    <p className="text-sm text-gray-500">{recipe.mealType}</p>
                  </div>
                  <button
                    onClick={() => removeRecipe(recipe.id)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5 text-red-500" />
                  </button>
                </div>
                <div className="space-y-2">
                  <div>
                    <h4 className="font-medium text-gray-700">Ingredients:</h4>
                    <p className="text-gray-600">{recipe.ingredients}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700">Instructions:</h4>
                    <p className="text-gray-600">{recipe.instructions}</p>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-2 text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              {searchTerm ? 'No recipes found matching your search' : 'No saved recipes yet'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeBook;