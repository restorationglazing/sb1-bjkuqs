import { type Ingredient, type Recipe } from '../types';

const RECIPE_DATABASE: Recipe[] = [
  {
    id: 1,
    name: 'Classic Spaghetti Carbonara',
    image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&q=80&w=800&h=600',
    cookTime: 25,
    servings: 4,
    ingredients: ['pasta', 'eggs', 'bacon', 'parmesan', 'black pepper', 'garlic'],
    matchingIngredients: [],
    totalIngredients: 6
  },
  {
    id: 2,
    name: 'Chicken Stir-Fry',
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&q=80&w=800&h=600',
    cookTime: 30,
    servings: 4,
    ingredients: ['chicken', 'bell pepper', 'broccoli', 'carrots', 'soy sauce', 'garlic', 'ginger'],
    matchingIngredients: [],
    totalIngredients: 7
  },
  {
    id: 3,
    name: 'Vegetarian Buddha Bowl',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800&h=600',
    cookTime: 35,
    servings: 2,
    ingredients: ['quinoa', 'chickpeas', 'sweet potato', 'kale', 'avocado', 'tahini'],
    matchingIngredients: [],
    totalIngredients: 6
  }
];

export const findRecipes = (userIngredients: Ingredient[]): Recipe[] => {
  const userIngredientNames = userIngredients.map(ing => ing.name.toLowerCase());
  
  return RECIPE_DATABASE.map(recipe => ({
    ...recipe,
    matchingIngredients: recipe.ingredients.filter(ing => 
      userIngredientNames.some(userIng => userIng.includes(ing) || ing.includes(userIng))
    )
  })).filter(recipe => recipe.matchingIngredients.length > 0)
  .sort((a, b) => b.matchingIngredients.length - a.matchingIngredients.length);
};