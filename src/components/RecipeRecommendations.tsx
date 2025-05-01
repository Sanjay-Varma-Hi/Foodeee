'use client';
                                                                                  
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import React from 'react';
import Image from 'next/image';

interface Recipe {
  id: string;
  title: string;
  description: string;
  image: string;
  ingredients: Array<string | {
    name: string;
    quantity?: number;
    unit?: string;
  }>;
  cookTime: number;
  difficulty: 'easy' | 'medium' | 'hard';
  matchScore: number;
  instructions?: Array<{
    timestamp: string;
    step: string;
  }>;
}

interface Ingredient {
  id: string;
  name: string;
  quantity?: number;
  unit?: string;
  confidence?: number;
  addedAt: Date | string;
}

interface UserProfile {
  preferences?: {
    dietaryRestrictions?: string[];
    favoriteCuisines?: string[];
    cookingSkillLevel?: string;
  };
  pantry?: Ingredient[];
}

export default function RecipeRecommendations() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pantryIngredients, setPantryIngredients] = useState<Ingredient[]>([]);
  const [pantryChecked, setPantryChecked] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const userProfileRef = useRef<UserProfile | null>(null);
  const [deepseekHighlightsList, setDeepseekHighlightsList] = useState<string[]>([]);

  // Load pantry ingredients from localStorage
  useEffect(() => {
    const savedIngredients = localStorage.getItem('pantry-ingredients');
    if (savedIngredients) {
      try {
        const parsedIngredients = JSON.parse(savedIngredients);
        setPantryIngredients(parsedIngredients);
      } catch (err) {
        console.error('Failed to parse saved ingredients', err);
      }
    }
    setPantryChecked(true);
  }, []);

  // Add an effect to watch for changes in pantry storage
  useEffect(() => {
    const handleStorageChange = () => {
      const savedIngredients = localStorage.getItem('pantry-ingredients');
      if (savedIngredients) {
        try {
          setPantryIngredients(JSON.parse(savedIngredients));
        } catch (err) {
          console.error('Failed to parse saved ingredients', err);
        }
      } else {
        setPantryIngredients([]);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // On mount, only load cached data
  useEffect(() => {
    const loadCachedDeepseek = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/deepseek-cache');
        const data = await res.json();
        if (data.found) {
          // Extract only the bullet points under '**Highlights:**'
          const response = data.response || '';
          let highlightsList: string[] = [];
          const highlightsIdx = response.indexOf('**Highlights:**');
          if (highlightsIdx !== -1) {
            // Find the start of the bullet list
            const afterHighlights = response.slice(highlightsIdx + '**Highlights:**'.length);
            // Find the end of the highlights section (next code block, JSON, or double newline)
            let endIdx = afterHighlights.indexOf('```');
            if (endIdx === -1) {
              endIdx = afterHighlights.indexOf('\n\n');
            }
            if (endIdx === -1) {
              endIdx = afterHighlights.length;
            }
            const highlightsBlock = afterHighlights.substring(0, endIdx).trim();
            // Extract bullet points (lines starting with '-')
            highlightsList = highlightsBlock
              .split('\n')
              .map((line: string) => line.trim())
              .filter((line: string) => line.startsWith('-'))
              .map((line: string) => line.replace(/^[-•]\s*/, ''));
          }
          setDeepseekHighlightsList(highlightsList);
          setRecipes(Array.isArray(data.recipes) ? data.recipes : []);
        } else {
          setDeepseekHighlightsList([]);
          setRecipes([]);
        }
      } catch {
        setDeepseekHighlightsList([]);
        setRecipes([]);
        setError('Failed to load cached recommendations');
      } finally {
        setLoading(false);
      }
    };
    loadCachedDeepseek();
  }, []);

  // Fetch recipe recommendations from DeepSeek only on Refresh
  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);

    // Fetch user profile and store in ref
    try {
      const userProfileRes = await fetch('/api/user-profile');
      if (userProfileRes.ok) {
        const userProfileData = await userProfileRes.json();
        userProfileRef.current = userProfileData;
      } else {
        userProfileRef.current = null;
        setError('Failed to fetch user profile');
        setLoading(false);
        return;
      }
    } catch {
      userProfileRef.current = null;
      setError('Error fetching user profile');
      setLoading(false);
      return;
    }

    // Send user profile to DeepSeek for recommendations
    if (userProfileRef.current) {
      try {
        const prompt = `Given this user profile (including pantry, preferences, etc.):\n\n${JSON.stringify(userProfileRef.current)}\n\nRecommend the best dishes for the user. For each dish, provide a JSON object with: id, title, description, image, ingredients, cookTime, difficulty, matchScore, and instructions (array of {timestamp, step}). Each instructions array must have at least 10 steps. Return an array of such objects, like this: [ ...mockRecipes... ]. Only return valid JSON. Also include any key highlights or notes as plain text before the JSON.`;
        const res = await fetch('/api/deepseek-test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: prompt }),
        });
        const data = await res.json();
        if (data.success) {
          const content = data.data?.choices?.[0]?.message?.content;
          // Try to extract the JSON part if possible
          let recipesJson = content;
          const jsonStart = content.indexOf('[');
          const jsonEnd = content.lastIndexOf(']') + 1;
          if (jsonStart !== -1 && jsonEnd !== -1) {
            try {
              recipesJson = JSON.parse(content.slice(jsonStart, jsonEnd));
            } catch {
              // If parsing fails, keep as string
            }
          }
          // Store the new response in cache (delete old, insert new)
          await fetch('/api/deepseek-cache', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ response: content, recipes: Array.isArray(recipesJson) ? recipesJson : [] }),
          });
          // Now fetch the cached data and display it
          try {
            const cacheRes = await fetch('/api/deepseek-cache');
            const cacheData = await cacheRes.json();
            if (cacheData.found) {
              setRecipes(Array.isArray(cacheData.recipes) ? cacheData.recipes : []);
            } else {
              setRecipes([]);
            }
          } catch {
            setRecipes([]);
            setError('Failed to load cached recommendations');
          }
        } else {
          setRecipes([]);
          setError('DeepSeek error');
        }
      } catch {
        setRecipes([]);
        setError('Error calling DeepSeek');
      }
    } else {
      setRecipes([]);
    }
    setLoading(false);
  };

  // Fetch recommendations when component mounts or pantry ingredients change
  useEffect(() => {
    if (pantryChecked) {
      fetchRecommendations();
    }
  }, [pantryIngredients, pantryChecked]);

  const isPantryEmpty = pantryChecked && (!pantryIngredients || pantryIngredients.length === 0);

  return (
    <div className="bg-white rounded-lg shadow p-6 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Recipe Recommendations</h2>
        <button
          onClick={fetchRecommendations}
          disabled={loading}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
      
      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Display only the DeepSeek Highlights as a styled bullet list above recipe cards */}
      {deepseekHighlightsList.length > 0 && (
        <div className="mb-6 p-6 bg-yellow-50 border-l-4 border-yellow-400 rounded shadow-sm">
          <div className="flex items-center mb-3">
            <span className="text-yellow-500 text-xl mr-2">💡</span>
            <span className="font-bold text-lg text-yellow-800">Highlights</span>
          </div>
          <ul className="list-none pl-0 space-y-2">
            {deepseekHighlightsList.map((item, idx) => (
              <li key={idx} className="flex items-start text-yellow-900">
                <span className="mr-2 mt-1 text-yellow-400">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Empty State - No Pantry Ingredients */}
      {!loading && isPantryEmpty && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Your pantry is empty. Add ingredients to get personalized recipe recommendations!</p>
          <Link 
            href="#pantry-manager" 
            className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm transition-colors"
          >
            Add Ingredients
          </Link>
        </div>
      )}

      {/* Empty State - Has Ingredients but No Recipes */}
      {!loading && !isPantryEmpty && recipes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No recipe recommendations found for your current ingredients. Try adding more ingredients.</p>
        </div>
      )}

      {/* Recipe Cards */}
      {!loading && recipes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <div key={recipe.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white p-4 flex flex-col h-full">
              <div className="flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-gray-900 mb-1">{recipe.title}</h3>
                <p className="text-gray-700 text-sm mb-2">{recipe.description}</p>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-2">
                  <span>Cook time: <span className="font-semibold text-gray-900">{recipe.cookTime} mins</span></span>
                  <span>Difficulty: <span className={`font-semibold ${recipe.difficulty === 'easy' ? 'text-green-600' : recipe.difficulty === 'medium' ? 'text-yellow-600' : 'text-red-600'}`}>{recipe.difficulty.charAt(0).toUpperCase() + recipe.difficulty.slice(1)}</span></span>
                  <span className="bg-blue-100 text-blue-700 rounded-full px-2 py-1 text-xs font-bold">{recipe.matchScore}% Match</span>
                </div>
                <div className="mb-2">
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">Ingredients:</h4>
                  <ul className="list-disc list-inside text-gray-700 text-sm">
                    {Array.isArray(recipe.ingredients) && recipe.ingredients.map((ingredient, idx) => (
                      <li key={idx}>
                        {typeof ingredient === 'string' 
                          ? ingredient 
                          : `${ingredient.name}${ingredient.quantity ? ` (${ingredient.quantity}${ingredient.unit ? ' ' + ingredient.unit : ''})` : ''}`
                        }
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mb-2">
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">How to Cook:</h4>
                  <ol className="list-decimal list-inside text-gray-700 text-sm space-y-1">
                    {Array.isArray(recipe.instructions) && recipe.instructions.map((instruction, idx: number) => (
                      <li key={idx}>
                        <span className="font-mono text-blue-600 mr-2">{instruction.timestamp}</span>
                        <span>{instruction.step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Recipe Details */}
      {selectedRecipe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full p-6 relative animate-fadeIn max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold"
              onClick={() => setSelectedRecipe(null)}
              aria-label="Close"
            >
              &times;
            </button>
            <div className="mb-4 mt-6">
              <div className="relative w-full h-56 rounded overflow-hidden mb-4">
                <Image
                  src={selectedRecipe.image}
                  alt={selectedRecipe.title}
                  fill
                  className="object-cover"
                />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedRecipe.title}</h2>
              <p className="text-gray-600 mb-2">{selectedRecipe.description}</p>
              <div className="flex justify-between items-center text-sm text-gray-500 mb-2">
                <span>Cook time: {selectedRecipe.cookTime} mins</span>
                <span className={`font-semibold ${selectedRecipe.difficulty === 'easy' ? 'text-green-600' : selectedRecipe.difficulty === 'medium' ? 'text-yellow-600' : 'text-red-600'}`}>{selectedRecipe.difficulty.charAt(0).toUpperCase() + selectedRecipe.difficulty.slice(1)}</span>
                <span className="bg-blue-100 text-blue-700 rounded-full px-2 py-1 text-xs font-bold">{selectedRecipe.matchScore}% Match</span>
              </div>
              <h4 className="text-md font-semibold text-gray-900 mt-4 mb-1">Ingredients:</h4>
              <ul className="list-disc list-inside text-gray-700 mb-4">
                {selectedRecipe.ingredients.map((ingredient, idx) => (
                  <li key={idx}>
                    {typeof ingredient === 'string' 
                      ? ingredient 
                      : `${ingredient.name}${ingredient.quantity ? ` (${ingredient.quantity}${ingredient.unit ? ' ' + ingredient.unit : ''})` : ''}`
                    }
                  </li>
                ))}
              </ul>
              {/* Recipe Instructions */}
              {selectedRecipe.instructions && selectedRecipe.instructions.length > 0 && (
                <>
                  <h4 className="text-md font-semibold text-gray-900 mt-4 mb-1">How to Cook:</h4>
                  <div className="space-y-2 text-gray-700">
                    {selectedRecipe.instructions.map((instruction, idx: number) => (
                      <div key={idx} className="flex items-start">
                        <span className="inline-block w-16 flex-shrink-0 font-mono text-blue-600">
                          {instruction.timestamp}
                        </span>
                        <span className="flex-1">
                          {instruction.step}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
 