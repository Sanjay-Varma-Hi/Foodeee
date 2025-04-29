'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FaPlus, FaTrash, FaEdit } from 'react-icons/fa';

interface PantryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  expiryDate?: string;
  notes?: string;
}

// Units for the dropdown
const UNITS = ['count', 'kg', 'g', 'ml', 'l', 'cups', 'tbsp', 'tsp', 'oz', 'lb'];

export default function PantryManager() {
  const { data: session } = useSession();
  const [items, setItems] = useState<PantryItem[]>([]);
  const [newItem, setNewItem] = useState<Partial<PantryItem>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch pantry items when session is ready
  useEffect(() => {
    if (session?.user) {
      fetchItems();
    }
  }, [session]);

  // Function to fetch items from the API
  const fetchItems = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/pantry/items');
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch items');
      }
      
      const data = await response.json();
      setItems(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch items');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextInput = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newItem.name || !newItem.quantity || !newItem.unit) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // 1. Add the new item to the local state
      setItems(prev => [...prev, { ...newItem, id: (prev.length + 1).toString() } as PantryItem]);
      
      // 2. Send the new item to the API
      const response = await fetch('/api/pantry/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item: newItem }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add item');
      }
      
      // 3. Refresh the items list
      await fetchItems();
      setNewItem({});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add item');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const removeItem = async (id: string) => {
    try {
      const response = await fetch(`/api/pantry/items/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete item');
      }
      
      // Update local state to remove the item
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete item');
      console.error(err);
    }
  };

  const clearAllItems = async () => {
    if (window.confirm('Are you sure you want to clear all items from your pantry?')) {
      try {
        const response = await fetch('/api/pantry/items', {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to clear pantry');
        }
        
        // Update local state
        setItems([]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to clear pantry');
        console.error(err);
      }
    }
  };

  const updateItemQuantity = async (id: string, quantity: number) => {
    try {
      // First update the UI optimistically
      setItems(prev => 
        prev.map(item => {
          if (item.id === id) {
            // If updating quantity and there's no unit, set unit to 'count'
            if (quantity > 0 && !item.unit) {
              return { ...item, quantity, unit: 'count' };
            }
            return { ...item, quantity };
          }
          return item;
        })
      );
      
      // Determine the unit value to send
      const item = items.find(i => i.id === id);
      const unit = (quantity > 0 && !item?.unit) ? 'count' : item?.unit;
      
      // Then update the database
      const response = await fetch(`/api/pantry/items/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity, unit }),
      });
      
      if (!response.ok) {
        // If there's an error, refresh to get the current state
        await fetchItems();
        const error = await response.json();
        throw new Error(error.error || 'Failed to update item');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update item');
      console.error(err);
    }
  };

  const updateItemUnit = async (id: string, unit: string) => {
    try {
      // First update the UI optimistically
      setItems(prev => 
        prev.map(item => 
          item.id === id 
            ? { ...item, unit } 
            : item
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
        await fetchItems();
        const error = await response.json();
        throw new Error(error.error || 'Failed to update item');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update item');
      console.error(err);
    }
  };

  if (session === null) {
    return <div className="bg-white rounded-lg shadow p-6 mt-6">Loading pantry data...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mt-6" id="pantry-manager">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Pantry Manager</h2>
        {items.length > 0 && (
          <button
            onClick={clearAllItems}
            className="text-sm text-red-600 hover:text-red-800"
          >
            Clear All
          </button>
        )}
      </div>
      
      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}

      {/* Item Input Form */}
      <form onSubmit={handleTextInput} className="mb-6">
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            id="name"
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g. 2 tomatoes"
            value={newItem.name || ''}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            disabled={isLoading}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
            Quantity
          </label>
          <input
            id="quantity"
            type="number"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g. 2"
            value={newItem.quantity || ''}
            onChange={(e) => setNewItem({ ...newItem, quantity: parseFloat(e.target.value) || 0 })}
            disabled={isLoading}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-1">
            Unit
          </label>
          <select
            id="unit"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={newItem.unit || ''}
            onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
            disabled={isLoading}
          >
            <option value="">Select</option>
            {UNITS.map(unit => (
              <option key={unit} value={unit}>{unit.charAt(0).toUpperCase() + unit.slice(1)}</option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
            isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          disabled={isLoading}
        >
          {isLoading ? 'Adding...' : 'Add Item'}
        </button>
      </form>

      {/* Items List */}
      <div className="mt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Your Pantry Items ({items.length})</h3>
        {items.length === 0 ? (
          <p className="text-gray-500 text-sm">No items in your pantry yet. Add some above!</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {items.map((item) => (
              <li key={item.id} className="py-3 flex items-center">
                <div className="flex-1">
                  <span className="text-md font-medium text-gray-900 mr-2">
                    {item.name}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    {item.quantity} {item.unit}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Quantity Input */}
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={item.quantity || ''}
                    onChange={(e) => updateItemQuantity(item.id, parseFloat(e.target.value) || 0)}
                    className="w-20 h-8 px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Qty"
                  />
                  
                  {/* Unit Dropdown */}
                  <select
                    value={item.unit || ''}
                    onChange={(e) => updateItemUnit(item.id, e.target.value)}
                    className="w-24 h-8 px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select</option>
                    {UNITS.map(unit => (
                      <option key={unit} value={unit}>{unit.charAt(0).toUpperCase() + unit.slice(1)}</option>
                    ))}
                  </select>
                  
                  {/* Delete Button */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-500 hover:text-red-700"
                    title="Remove item"
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
    </div>
  );
} 