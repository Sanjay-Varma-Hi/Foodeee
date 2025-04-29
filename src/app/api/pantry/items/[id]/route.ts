import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { updateIngredient, deleteIngredient } from '@/lib/db/pantry';
import { connectDB } from '@/lib/db/connect';

interface RouteParams {
  params: {
    id: string;
  };
}

// PATCH to update a specific pantry item
export async function PATCH(request: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const { id } = params;
    const updates = await request.json();
    
    const success = await updateIngredient(id, session.user.id, updates);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Ingredient not found or not owned by user' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Ingredient updated successfully' 
    });
  } catch (error) {
    console.error('Error updating pantry item:', error);
    return NextResponse.json(
      { error: 'Failed to update pantry item' },
      { status: 500 }
    );
  }
}

// DELETE to remove a specific pantry item
export async function DELETE(_request: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const { id } = params;
    const success = await deleteIngredient(id, session.user.id);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Ingredient not found or not owned by user' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Ingredient deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting pantry item:', error);
    return NextResponse.json(
      { error: 'Failed to delete pantry item' },
      { status: 500 }
    );
  }
} 