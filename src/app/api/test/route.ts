import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';

export async function GET() {
  try {
    await dbConnect();
    return NextResponse.json({ 
      status: 'success', 
      message: 'MongoDB connection successful' 
    });
  } catch (error) {
    return NextResponse.json({ 
      status: 'error', 
      message: 'MongoDB connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 