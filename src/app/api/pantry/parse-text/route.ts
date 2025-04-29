import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request: Request) {
  // Check if user is authenticated
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { text } = await request.json();
    
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Invalid input. Please provide a text string.' },
        { status: 400 }
      );
    }

    console.log("Parsing text:", text);

    // Basic parsing logic - in a real app, this would call a ML model API
    const parsedIngredients = text
      .split(',')
      .map(item => item.trim())
      .filter(Boolean)
      .map(rawName => {
        console.log("Processing ingredient:", rawName);
        
        // Parse the input text
        const rawText = rawName.toLowerCase();
        let quantity = undefined;
        let unit = undefined;
        let name = "";
        
        // Match patterns like:
        // "2 tomatoes", "500g flour", "1 cup sugar", "onions"
        const qtyUnitPattern = /^(\d+(\.\d+)?)\s*([a-zA-Z]+)?\s*(.*)/;
        const qtyMatch = rawText.match(qtyUnitPattern);
        
        if (qtyMatch) {
          // We have a quantity pattern
          quantity = parseFloat(qtyMatch[1]);
          
          if (qtyMatch[3] && qtyMatch[3].length > 1) {
            // There's a potential unit
            const potentialUnit = qtyMatch[3].toLowerCase();
            
            // Check if it's likely a unit or part of the ingredient name
            const commonUnits = ['g', 'kg', 'ml', 'l', 'cup', 'cups', 'tbsp', 'tsp', 'oz', 'lb'];
            if (commonUnits.includes(potentialUnit) || commonUnits.includes(potentialUnit.endsWith('s') ? potentialUnit.slice(0, -1) : potentialUnit + 's')) {
              unit = potentialUnit;
              // Handle plural units
              if (unit.endsWith('s') && unit.length > 1) {
                unit = unit.slice(0, -1);
              }
              
              // The rest is the ingredient name
              name = qtyMatch[4].trim();
            } else {
              // The unit is likely part of the name
              name = (qtyMatch[3] + ' ' + qtyMatch[4]).trim();
            }
          } else {
            // No unit, just quantity and name
            name = qtyMatch[4].trim();
            if (quantity > 0) {
              unit = 'count';
            }
          }
        } else {
          // No quantity pattern, it's just the ingredient name
          name = rawText.trim();
        }

        console.log(`Parsed: name="${name}", quantity=${quantity}, unit="${unit}"`);
        
        // Ensure the name is properly capitalized
        if (name) {
          name = name.charAt(0).toUpperCase() + name.slice(1);
        } else {
          console.log("Warning: Empty ingredient name detected, using fallback");
          name = rawName.trim() || "Ingredient";
        }
        
        // Handle plural ingredient names for better display
        if (name.endsWith('s') && quantity === 1) {
          name = name.slice(0, -1);
        }
        
        return {
          id: Math.random().toString(36).substring(2, 9),
          name,
          quantity,
          unit,
          addedAt: new Date()
        };
      });

    return NextResponse.json({ ingredients: parsedIngredients });
  } catch (error) {
    console.error('Error parsing ingredients:', error);
    return NextResponse.json(
      { error: 'Failed to process ingredients' },
      { status: 500 }
    );
  }
} 