import React from 'react';
import { Users, Minus, Plus } from 'lucide-react';

interface Props {
  servings: number;
  onServingsChange: (servings: number) => void;
  onClose: () => void;
}

const ServingsModal: React.FC<Props> = ({ servings, onServingsChange, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-purple-100 rounded-full">
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">How Many People?</h2>
          <p className="text-gray-600">
            Select the number of people you're cooking for to get personalized portions
          </p>
        </div>

        <div className="flex items-center justify-center gap-6 mb-8">
          <button
            onClick={() => onServingsChange(Math.max(1, servings - 1))}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Minus className="w-6 h-6 text-gray-600" />
          </button>
          
          <div className="text-4xl font-bold text-gray-800 w-16 text-center">
            {servings}
          </div>
          
          <button
            onClick={() => onServingsChange(Math.min(12, servings + 1))}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Plus className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default ServingsModal;