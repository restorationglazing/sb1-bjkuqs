import { useState, useEffect } from 'react';

export interface SavedRecipe {
  id: string;
  name: string;
  mealType: string;
  ingredients: string;
  instructions: string;
}

export function useSavedRecipes() {
  const [recipes, setRecipes] = useState<SavedRecipe[]>(() => {
    const saved = localStorage.getItem('savedRecipes');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('savedRecipes', JSON.stringify(recipes));
  }, [recipes]);

  const saveRecipe = (recipe: Omit<SavedRecipe, 'id'>) => {
    const newRecipe = {
      ...recipe,
      id: Date.now().toString(),
    };
    setRecipes(prev => [...prev, newRecipe]);
  };

  const removeRecipe = (id: string) => {
    setRecipes(prev => prev.filter(recipe => recipe.id !== id));
  };

  return { recipes, saveRecipe, removeRecipe };
};