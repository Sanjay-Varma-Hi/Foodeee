import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { promises as fs } from 'fs';
import path from 'path';

// Define the type for meal plan items
interface MealPlanItem {
  id: string;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  recipeId: string;
  servings: number;
  notes?: string;
}

// Helper function to read meal plan data
async function readMealPlanData(): Promise<MealPlanItem[]> {
  try {
    const filePath = path.join(process.cwd(), 'data', 'meal-plan.json');
    const fileContents = await fs.readFile(filePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.error('Error reading meal plan data:', error);
    return [];
  }
}

// Helper function to write meal plan data
async function writeMealPlanData(mealPlan: MealPlanItem[]): Promise<void> {
  try {
    const filePath = path.join(process.cwd(), 'data', 'meal-plan.json');
    await fs.writeFile(filePath, JSON.stringify(mealPlan, null, 2));
  } catch (error) {
    console.error('Error writing meal plan data:', error);
    throw error;
  }
}

// GET: Get all meal plan items
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const mealPlan = await readMealPlanData();
    return NextResponse.json(mealPlan);
  } catch (error) {
    console.error('Error getting meal plan:', error);
    return NextResponse.json({ error: 'Failed to get meal plan' }, { status: 500 });
  }
}

// POST: Add a new meal plan item
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const mealPlanItem = await request.json();
    const mealPlan = await readMealPlanData();
    
    // Generate a unique ID for the new meal plan item
    mealPlanItem.id = Date.now().toString();
    
    mealPlan.push(mealPlanItem);
    await writeMealPlanData(mealPlan);
    
    return NextResponse.json(mealPlanItem);
  } catch (error) {
    console.error('Error adding meal plan item:', error);
    return NextResponse.json({ error: 'Failed to add meal plan item' }, { status: 500 });
  }
}

// PUT: Update an existing meal plan item
export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const updatedMealPlanItem = await request.json();
    const mealPlan = await readMealPlanData();
    
    const index = mealPlan.findIndex(item => item.id === updatedMealPlanItem.id);
    if (index === -1) {
      return NextResponse.json({ error: 'Meal plan item not found' }, { status: 404 });
    }
    
    mealPlan[index] = updatedMealPlanItem;
    await writeMealPlanData(mealPlan);
    
    return NextResponse.json(updatedMealPlanItem);
  } catch (error) {
    console.error('Error updating meal plan item:', error);
    return NextResponse.json({ error: 'Failed to update meal plan item' }, { status: 500 });
  }
}

// DELETE: Remove a meal plan item
export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await request.json();
    const mealPlan = await readMealPlanData();
    
    const filteredMealPlan = mealPlan.filter(item => item.id !== id);
    if (filteredMealPlan.length === mealPlan.length) {
      return NextResponse.json({ error: 'Meal plan item not found' }, { status: 404 });
    }
    
    await writeMealPlanData(filteredMealPlan);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting meal plan item:', error);
    return NextResponse.json({ error: 'Failed to delete meal plan item' }, { status: 500 });
  }
} 