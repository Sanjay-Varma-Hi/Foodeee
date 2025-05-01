import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { 
  getUserIngredients, 
  addIngredients, 
  clearAllIngredients 
} from '@/lib/db/pantry';
import { connectDB } from '@/lib/db/connect';

// GET all pantry items for the authenticated user
export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const ingredients = await getUserIngredients(session.user.id);
    return NextResponse.json({ ingredients });
  } catch (error) {
    console.error('Error fetching pantry items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pantry items' },
      { status: 500 }
    );
  }
}

// POST to add new ingredients to pantry
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const { ingredients } = await request.json();
    
    if (!ingredients || !Array.isArray(ingredients)) {
      return NextResponse.json(
        { error: 'Invalid input. Please provide an array of ingredients.' },
        { status: 400 }
      );
    }

    const insertedIds = await addIngredients(session.user.id, ingredients);
    
    return NextResponse.json({ 
      success: true, 
      message: `Added ${insertedIds.length} ingredients`,
      ids: insertedIds
    });
  } catch (error) {
    console.error('Error adding pantry items:', error);
    return NextResponse.json(
      { error: 'Failed to add pantry items' },
      { status: 500 }
    );
  }
}

// DELETE to clear all pantry items
export async function DELETE() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const count = await clearAllIngredients(session.user.id);
    
    return NextResponse.json({ 
      success: true, 
      message: `Removed ${count} ingredients` 
    });
  } catch (error) {
    console.error('Error clearing pantry:', error);
    return NextResponse.json(
      { error: 'Failed to clear pantry' },
      { status: 500 }
    );
  }
} 