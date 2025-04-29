import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { promises as fs } from 'fs';
import path from 'path';

// Define the type for recipe items
interface Recipe {
  id: string;
  name: string;
  description: string;
  ingredients: {
    name: string;
    quantity: number;
    unit: string;
  }[];
  instructions: string[];
  prepTime: number;
  cookTime: number;
  servings: number;
  category: string;
  tags: string[];
  imageUrl?: string;
}

// Helper function to read recipe data
async function readRecipeData(): Promise<Recipe[]> {
  try {
    const filePath = path.join(process.cwd(), 'data', 'recipes.json');
    const fileContents = await fs.readFile(filePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.error('Error reading recipe data:', error);
    return [];
  }
}

// Helper function to write recipe data
async function writeRecipeData(recipes: Recipe[]): Promise<void> {
  try {
    const filePath = path.join(process.cwd(), 'data', 'recipes.json');
    await fs.writeFile(filePath, JSON.stringify(recipes, null, 2));
  } catch (error) {
    console.error('Error writing recipe data:', error);
    throw error;
  }
}

// GET: Get all recipes
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const recipes = await readRecipeData();
    return NextResponse.json(recipes);
  } catch (error) {
    console.error('Error getting recipes:', error);
    return NextResponse.json({ error: 'Failed to get recipes' }, { status: 500 });
  }
}

// POST: Add a new recipe
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const recipe = await request.json();
    const recipes = await readRecipeData();
    
    // Generate a unique ID for the new recipe
    recipe.id = Date.now().toString();
    
    recipes.push(recipe);
    await writeRecipeData(recipes);
    
    return NextResponse.json(recipe);
  } catch (error) {
    console.error('Error adding recipe:', error);
    return NextResponse.json({ error: 'Failed to add recipe' }, { status: 500 });
  }
}

// PUT: Update an existing recipe
export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const updatedRecipe = await request.json();
    const recipes = await readRecipeData();
    
    const index = recipes.findIndex(recipe => recipe.id === updatedRecipe.id);
    if (index === -1) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }
    
    recipes[index] = updatedRecipe;
    await writeRecipeData(recipes);
    
    return NextResponse.json(updatedRecipe);
  } catch (error) {
    console.error('Error updating recipe:', error);
    return NextResponse.json({ error: 'Failed to update recipe' }, { status: 500 });
  }
}

// DELETE: Remove a recipe
export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await request.json();
    const recipes = await readRecipeData();
    
    const filteredRecipes = recipes.filter(recipe => recipe.id !== id);
    if (filteredRecipes.length === recipes.length) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }
    
    await writeRecipeData(filteredRecipes);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting recipe:', error);
    return NextResponse.json({ error: 'Failed to delete recipe' }, { status: 500 });
  }
} 