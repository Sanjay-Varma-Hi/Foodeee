import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import clientPromise from '@/lib/db/clientPromise';

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  preferences: {
    dietaryRestrictions: string[];
    favoriteCuisines: string[];
    allergies: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

// GET all user data including pantry items and instructions
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const client = await clientPromise;
    const db = client.db('food_bot');
    const userProfile = await db.collection('user_profiles').findOne<UserProfile>({ email: session.user?.email });
    
    if (!userProfile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json(userProfile);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 });
  }
} 