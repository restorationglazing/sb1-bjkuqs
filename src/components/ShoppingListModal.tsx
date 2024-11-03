import React from 'react';
import { X, Check, ShoppingBag } from 'lucide-react';

interface Props {
  shoppingList: {
    category: string;
    items: string[];
  }[];
  onClose: () => void;
}

const ShoppingListModal: React.FC<Props> = ({ shoppingList, onClose }) => {
  const [checkedItems, setCheckedItems] = React.useState<Set<string>>(new Set());

  const toggleItem = (item: string) => {
    const newCheckedItems = new Set(checkedItems);
    if (newCheckedItems.has(item)) {
      newCheckedItems.delete(item);
    } else {
      newCheckedItems.add(item);
    }
    setCheckedItems(newCheckedItems);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-6 h-6 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-800">Shopping List</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="overflow-y-auto flex-1 p-6">
          <div className="space-y-6">
            {shoppingList.map((category) => (
              <div key={category.category}>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">{category.category}</h3>
                <div className="space-y-2">
                  {category.items.map((item, index) => (
                    <div
                      key={`${category.category}-${index}`}
                      className="flex items-center gap-3"
                    >
                      <button
                        onClick={() => toggleItem(item)}
                        className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                          checkedItems.has(item)
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'border-gray-300 hover:border-green-500'
                        }`}
                      >
                        {checkedItems.has(item) && <Check className="w-4 h-4" />}
                      </button>
                      <span className={`text-gray-700 ${
                        checkedItems.has(item) ? 'line-through text-gray-400' : ''
                      }`}>
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoppingListModal;