import React, { useState } from 'react';
import { ChefHat, ArrowLeft, Wand2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { generateCustomRecipe } from '../utils/openai';

const AiChef: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleGetRecipe = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    try {
      const recipe = await generateCustomRecipe(prompt);
      setResponse(recipe);
    } catch (error) {
      console.error('Error:', error);
      setResponse('Failed to get recipe. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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
          <ChefHat className="w-8 h-8 text-purple-600" />
          <h1 className="text-2xl font-bold text-gray-800">AI Chef</h1>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="mb-6">
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
            What would you like to cook?
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="E.g., 'I have chicken, rice, and vegetables. What can I make?' or 'How do I make a perfect risotto?'"
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all min-h-[100px]"
          />
        </div>

        <button
          onClick={handleGetRecipe}
          disabled={isLoading || !prompt.trim()}
          className={`w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2 ${
            isLoading || !prompt.trim() ? 'opacity-75 cursor-not-allowed' : ''
          }`}
        >
          <Wand2 className="w-5 h-5" />
          {isLoading ? 'Getting Recipe...' : 'Get Recipe'}
        </button>

        {response && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Recipe Suggestion:</h3>
            <div className="bg-gray-50 rounded-lg p-4 whitespace-pre-wrap">
              {response}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AiChef;