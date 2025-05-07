import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { updateIngredient, deleteIngredient } from '@/lib/db/pantry';
import { connectDB } from '@/lib/db/connect';

// PATCH to update a specific pantry item
export async function PATCH(
  request: NextRequest,
  context: { params: { id: string } }
): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const { id } = context.params;
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
export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const { id } = context.params;
    const success = await deleteIngredient(id, session.user.id);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Ingredient not found or not owned by user' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Ingredient deleted successfully' 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting pantry item:', error);
    return NextResponse.json(
      { error: 'Failed to delete pantry item' },
      { status: 500 }
    );
  }
} 