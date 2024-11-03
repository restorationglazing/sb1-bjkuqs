import React from 'react';
import { Trash2 } from 'lucide-react';
import { type Ingredient } from '../types';

interface Props {
  ingredients: Ingredient[];
  onRemove: (id: number) => void;
}

const IngredientList: React.FC<Props> = ({ ingredients, onRemove }) => {
  if (ingredients.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {ingredients.map((ingredient) => (
        <div
          key={ingredient.id}
          className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full group"
        >
          <span className="text-gray-700">{ingredient.name}</span>
          <button
            onClick={() => onRemove(ingredient.id)}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 className="w-4 h-4 text-gray-500 hover:text-red-500 transition-colors" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default IngredientList;