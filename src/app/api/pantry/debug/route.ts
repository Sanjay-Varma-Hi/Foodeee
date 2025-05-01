import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserIngredients } from '@/lib/db/pantry';

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const ingredients = await getUserIngredients(session.user.id);
    
    // Print to console in a formatted way
    console.log('\n=== User Pantry Items ===');
    console.log('User ID:', session.user.id);
    console.log('Total Items:', ingredients.length);
    console.log('\nItems:');
    console.log(JSON.stringify(ingredients, null, 2));
    console.log('========================\n');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Pantry items printed to console',
      count: ingredients.length,
      items: ingredients
    });
  } catch (error) {
    console.error('Error fetching pantry items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pantry items' },
      { status: 500 }
    );
  }
} 