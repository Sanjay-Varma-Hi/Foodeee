import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { promises as fs } from 'fs';
import path from 'path';

// Define the type for recipe recommendations
interface RecipeRecommendation {
  id: string;
  title: string;
  ingredients: string[];
  instructions: string[];
  imageUrl?: string;
  sourceUrl?: string;
}

// Helper function to read recipe data
async function readRecipeData(): Promise<RecipeRecommendation[]> {
  try {
    const filePath = path.join(process.cwd(), 'data', 'recipes.json');
    const fileContents = await fs.readFile(filePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.error('Error reading recipe data:', error);
    return [];
  }
}

// Helper function to read pantry data
async function readPantryData(): Promise<{ name: string }[]> {
  try {
    const filePath = path.join(process.cwd(), 'data', 'pantry.json');
    const fileContents = await fs.readFile(filePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.error('Error reading pantry data:', error);
    return [];
  }
}

// GET: Get recipe recommendations based on pantry items
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [recipes, pantryItems] = await Promise.all([
      readRecipeData(),
      readPantryData()
    ]);

    // Get unique ingredients from pantry
    const pantryIngredients = new Set(pantryItems.map(item => item.name.toLowerCase()));

    // Filter recipes based on pantry ingredients
    const recommendedRecipes = recipes.filter(recipe => {
      const recipeIngredients = new Set(recipe.ingredients.map(ing => ing.toLowerCase()));
      const matchingIngredients = Array.from(recipeIngredients).filter(ing => 
        pantryIngredients.has(ing)
      );
      return matchingIngredients.length >= Math.ceil(recipeIngredients.size * 0.5);
    });

    return NextResponse.json(recommendedRecipes);
  } catch (error) {
    console.error('Error getting recipe recommendations:', error);
    return NextResponse.json({ error: 'Failed to get recipe recommendations' }, { status: 500 });
  }
} 