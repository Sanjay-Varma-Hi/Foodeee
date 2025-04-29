import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/db/connect';
import { getUserIngredients } from '@/lib/db/pantry';
import UserInstruction from '@/models/UserInstruction';

// GET all user data including pantry items and instructions
export async function GET() {
  const session = await getServerSession(authOptions);

  const userId = session?.user && (session.user as any).id;
  const userEmail = session?.user?.email;
  const userName = session?.user?.name;
  const userImage = session?.user?.image;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const ingredients = await getUserIngredients(userId);

    // Get user instructions (preferences)
    let instructions = userEmail ? await UserInstruction.findOne({ userId: userEmail }) : null;
    
    // If no instructions exist, create default ones
    if (!instructions && userEmail) {
      instructions = await UserInstruction.create({ 
        userId: userEmail,
        dietaryPreferences: [],
        allergies: [],
        healthGoals: [],
        additionalNotes: ''
      });
    }

    // Format the response
    const userData = {
      user: {
        email: userEmail ?? null,
        name: userName ?? null,
        image: userImage ?? null
      },
      pantry: {
        items: ingredients,
        totalItems: ingredients.length,
        lastUpdated: ingredients.length > 0 && 'addedAt' in ingredients[0] && ingredients[0].addedAt
          ? ingredients[0].addedAt
          : null
      },
      preferences: instructions ? {
        dietary: instructions.dietaryPreferences,
        healthGoals: instructions.healthGoals,
        allergies: instructions.allergies,
        additionalNotes: instructions.additionalNotes,
        lastUpdated: instructions.updatedAt
      } : null
    };

    return NextResponse.json(userData);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
} 