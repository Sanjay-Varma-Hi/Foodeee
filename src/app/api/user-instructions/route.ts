import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import UserInstruction from '@/models/UserInstruction';
import { connectDB } from '@/lib/db/connect';

// GET user instructions
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ensure DB connection
    await connectDB();

    let instructions = await UserInstruction.findOne({ userId: session.user.email });
    
    if (!instructions) {
      instructions = await UserInstruction.create({ 
        userId: session.user.email,
        dietaryPreferences: [],
        allergies: [],
        healthGoals: [],
        additionalNotes: ''
      });
    }
    
    return NextResponse.json(instructions);
  } catch (error) {
    console.error('Error in GET /api/user-instructions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user instructions' },
      { status: 500 }
    );
  }
}

// POST to update user instructions
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ensure DB connection
    await connectDB();

    const updates = await request.json();
    
    const instructions = await UserInstruction.findOneAndUpdate(
      { userId: session.user.email },
      { 
        $set: {
          ...updates,
          updatedAt: new Date()
        }
      },
      { 
        new: true, 
        upsert: true,
        runValidators: true 
      }
    );
    
    return NextResponse.json({
      success: true,
      message: 'Instructions updated successfully',
      instructions
    });
  } catch (error) {
    console.error('Error in POST /api/user-instructions:', error);
    return NextResponse.json(
      { error: 'Failed to update user instructions' },
      { status: 500 }
    );
  }
} 