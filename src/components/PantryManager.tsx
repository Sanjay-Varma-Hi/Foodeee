'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface Ingredient {
  id: string;
  name: string;
  quantity?: number;
  unit?: string;
  confidence?: number;
  addedAt: Date | string;
}

interface UserInstructions {
  dietaryPreferences: string[];
  allergies: string[];
  healthGoals: string[];
  additionalNotes?: string;
}

// Units for the dropdown
const UNITS = ['count', 'kg', 'g', 'ml', 'l', 'cups', 'tbsp', 'tsp', 'oz', 'lb'];

export default function PantryManager() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<'text' | 'image'>('text');
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [instructions, setInstructions] = useState<UserInstructions>({
    dietaryPreferences: [],
    allergies: [],
    healthGoals: [],
    additionalNotes: ''
  });

  // Fetch pantry items when session is ready
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      fetchIngredients();
    }
  }, [session, status]);

  // Fetch user instructions when component mounts
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      fetchUserInstructions();
    }
  }, [session, status]);

  // Function to fetch ingredients from the API
  const fetchIngredients = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/pantry/items');
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch ingredients');
      }
      
      const data = await response.json();
      setIngredients(data.ingredients);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch ingredients');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserInstructions = async () => {
    try {
      const response = await fetch('/api/user-instructions');
      if (response.ok) {
        const data = await response.json();
        setInstructions(data);
      }
    } catch (err) {
      console.error('Failed to fetch user instructions:', err);
    }
  };

  const handleTextInput = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!textInput.trim()) {
      setError('Please enter some ingredients');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // 1. Parse the text input
      const parseResponse = await fetch('/api/pantry/parse-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textInput }),
      });
      
      if (!parseResponse.ok) {
        const errorData = await parseResponse.json();
        throw new Error(errorData.error || 'Failed to process ingredients');
      }
      
      const parseData = await parseResponse.json();
      
      // Set default unit to 'count' if quantity exists but unit is not specified
      const processedIngredients = parseData.ingredients.map((ingredient: Ingredient) => {
        if (ingredient.quantity && !ingredient.unit) {
          return { ...ingredient, unit: 'count' };
        }
        return ingredient;
      });
      
      // 2. Add the processed ingredients to the database
      const addResponse = await fetch('/api/pantry/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients: processedIngredients }),
      });
      
      if (!addResponse.ok) {
        const errorData = await addResponse.json();
        throw new Error(errorData.error || 'Failed to save ingredients');
      }
      
      // 3. Refresh the ingredients list
      await fetchIngredients();
      setTextInput('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process ingredients');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const removeIngredient = async (id: string) => {
    try {
      const response = await fetch(`/api/pantry/items/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete ingredient');
      }
      
      // Update local state to remove the ingredient
      setIngredients(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete ingredient');
      console.error(err);
    }
  };

  const clearAllIngredients = async () => {
    if (window.confirm('Are you sure you want to clear all ingredients from your pantry?')) {
      try {
        const response = await fetch('/api/pantry/items', {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to clear pantry');
        }
        
        // Update local state
        setIngredients([]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to clear pantry');
        console.error(err);
      }
    }
  };

  const updateIngredientQuantity = async (id: string, quantity: number) => {
    try {
      // First update the UI optimistically
      setIngredients(prev => 
        prev.map(ingredient => {
          if (ingredient.id === id) {
            // If updating quantity and there's no unit, set unit to 'count'
            if (quantity > 0 && !ingredient.unit) {
              return { ...ingredient, quantity, unit: 'count' };
            }
            return { ...ingredient, quantity };
          }
          return ingredient;
        })
      );
      
      // Determine the unit value to send
      const ingredient = ingredients.find(item => item.id === id);
      const unit = (quantity > 0 && !ingredient?.unit) ? 'count' : ingredient?.unit;
      
      // Then update the database
      const response = await fetch(`/api/pantry/items/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity, unit }),
      });
      
      if (!response.ok) {
        // If there's an error, refresh to get the current state
        await fetchIngredients();
        const error = await response.json();
        throw new Error(error.error || 'Failed to update ingredient');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update ingredient');
      console.error(err);
    }
  };

  const updateIngredientUnit = async (id: string, unit: string) => {
    try {
      // First update the UI optimistically
      setIngredients(prev => 
        prev.map(ingredient => 
          ingredient.id === id 
            ? { ...ingredient, unit } 
            : ingredient
        )
      );
      
      // Then update the database
      const response = await fetch(`/api/pantry/items/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ unit }),
      });
      
      if (!response.ok) {
        // If there's an error, refresh to get the current state
        await fetchIngredients();
        const error = await response.json();
        throw new Error(error.error || 'Failed to update ingredient');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update ingredient');
      console.error(err);
    }
  };

  const updateInstructions = async (updates: Partial<UserInstructions>) => {
    try {
      const response = await fetch('/api/user-instructions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      
      if (response.ok) {
        const data = await response.json();
        setInstructions(data.instructions);
      }
    } catch (err) {
      console.error('Failed to update user instructions:', err);
    }
  };

  if (status === 'loading') {
    return <div className="bg-white rounded-lg shadow p-6 mt-6">Loading pantry data...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mt-6" id="pantry-manager">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Pantry Manager</h2>
        {ingredients.length > 0 && (
          <button
            onClick={clearAllIngredients}
            className="text-sm text-red-600 hover:text-red-800"
          >
            Clear All
          </button>
        )}
      </div>
      
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-4">
        <button
          className={`py-2 px-4 font-medium text-sm ${
            activeTab === 'text' 
              ? 'text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('text')}
        >
          Enter Text
        </button>
        <button
          className={`py-2 px-4 font-medium text-sm ${
            activeTab === 'image' 
              ? 'text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('image')}
        >
          Upload Image
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}

      {/* Text Input Form */}
      {activeTab === 'text' && (
        <form onSubmit={handleTextInput} className="mb-6">
          <div className="mb-4">
            <label htmlFor="ingredients" className="block text-sm font-medium text-gray-700 mb-1">
              Enter ingredients (comma separated)
            </label>
            <textarea
              id="ingredients"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g. 2 tomatoes, 1 onion, 500g chicken, 2 cups rice"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Add Ingredients'}
          </button>
        </form>
      )}

      {/* Image Upload Form */}
      {activeTab === 'image' && (
        <div className="mb-6 flex flex-col items-center justify-center py-16 border-2 border-dashed border-gray-300 rounded-md bg-gray-50">
          <span className="text-lg font-semibold text-gray-700 mb-2">Image-based ingredient identification</span>
          <span className="text-blue-600 font-medium">Coming soon!</span>
        </div>
      )}

      {/* Ingredients List */}
      <div className="mt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Your Pantry Items ({ingredients.length})</h3>
        {ingredients.length === 0 ? (
          <p className="text-gray-500 text-sm">No ingredients in your pantry yet. Add some above!</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {ingredients.map((ingredient) => (
              <li key={ingredient.id} className="py-3 flex items-center">
                <div className="flex-1">
                  <span className="text-md font-medium text-gray-900 mr-2">
                    {ingredient.name}
                  </span>
                  {ingredient.confidence && (
                    <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {Math.round(ingredient.confidence * 100)}%
                    </span>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Added {new Date(ingredient.addedAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Quantity Input */}
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={ingredient.quantity || ''}
                    onChange={(e) => updateIngredientQuantity(ingredient.id, parseFloat(e.target.value) || 0)}
                    className="w-20 h-8 px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Qty"
                  />
                  
                  {/* Unit Dropdown */}
                  <select
                    value={ingredient.unit || ''}
                    onChange={(e) => updateIngredientUnit(ingredient.id, e.target.value)}
                    className="w-24 h-8 px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select</option>
                    {UNITS.map(unit => (
                      <option key={unit} value={unit}>{unit.charAt(0).toUpperCase() + unit.slice(1)}</option>
                    ))}
                  </select>
                  
                  {/* Delete Button */}
                  <button
                    onClick={() => removeIngredient(ingredient.id)}
                    className="text-red-500 hover:text-red-700"
                    title="Remove ingredient"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* User Instructions Section */}
      <div className="mt-8 border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Dietary Preferences & Health Goals</h3>
        
        {/* Dietary Preferences */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Dietary Preferences</h4>
          <div className="flex flex-wrap gap-2">
            {['vegetarian', 'vegan', 'pescatarian', 'keto', 'paleo', 'low-carb', 'low-fat', 'gluten-free', 'dairy-free'].map((pref) => (
              <button
                key={pref}
                onClick={() => {
                  const newPrefs = instructions.dietaryPreferences.includes(pref)
                    ? instructions.dietaryPreferences.filter(p => p !== pref)
                    : [...instructions.dietaryPreferences, pref];
                  updateInstructions({ dietaryPreferences: newPrefs });
                }}
                className={`px-3 py-1 rounded-full text-sm ${
                  instructions.dietaryPreferences.includes(pref)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {pref.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Health Goals */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Health Goals</h4>
          <div className="flex flex-wrap gap-2">
            {['weight-loss', 'muscle-gain', 'maintenance', 'heart-healthy', 'diabetes-friendly', 'energy-boost'].map((goal) => (
              <button
                key={goal}
                onClick={() => {
                  const newGoals = instructions.healthGoals.includes(goal)
                    ? instructions.healthGoals.filter(g => g !== goal)
                    : [...instructions.healthGoals, goal];
                  updateInstructions({ healthGoals: newGoals });
                }}
                className={`px-3 py-1 rounded-full text-sm ${
                  instructions.healthGoals.includes(goal)
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {goal.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Allergies */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Allergies</h4>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Add allergy (press Enter)"
              className="flex-1 px-3 py-2 border rounded-md"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                  const newAllergy = e.currentTarget.value.trim();
                  if (!instructions.allergies.includes(newAllergy)) {
                    updateInstructions({
                      allergies: [...instructions.allergies, newAllergy]
                    });
                  }
                  e.currentTarget.value = '';
                }
              }}
            />
          </div>
          {instructions.allergies.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {instructions.allergies.map((allergy) => (
                <span
                  key={allergy}
                  className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                >
                  {allergy}
                  <button
                    onClick={() => {
                      updateInstructions({
                        allergies: instructions.allergies.filter(a => a !== allergy)
                      });
                    }}
                    className="hover:text-red-900"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Additional Notes */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Additional Notes</h4>
          <textarea
            value={instructions.additionalNotes || ''}
            onChange={(e) => updateInstructions({ additionalNotes: e.target.value })}
            placeholder="Any other dietary restrictions or preferences..."
            className="w-full px-3 py-2 border rounded-md"
            rows={3}
          />
        </div>
      </div>
    </div>
  );
} 