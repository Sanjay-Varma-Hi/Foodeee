import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  // Check if user is authenticated
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // In a real app, we'd process the image file here
    // 1. Get the FormData
    const formData = await request.formData();
    const imageFile = formData.get('image') as File | null;
    
    if (!imageFile) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    // 2. Check file type
    if (!imageFile.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File is not an image' },
        { status: 400 }
      );
    }

    // 3. In a real app, we would:
    //    - Upload the image to a storage service
    //    - Call a ML model API to process the image
    //    - Get back detected ingredients
    
    // For now, return mock data
    const mockDetectedIngredients = [
      {
        id: Math.random().toString(36).substring(2, 9),
        name: 'tomatoes',
        confidence: 0.92,
        addedAt: new Date()
      },
      {
        id: Math.random().toString(36).substring(2, 9),
        name: 'onions',
        confidence: 0.87,
        addedAt: new Date()
      },
      {
        id: Math.random().toString(36).substring(2, 9),
        name: 'bell peppers',
        confidence: 0.78,
        addedAt: new Date()
      }
    ];

    // Add a delay to simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));

    return NextResponse.json({
      ingredients: mockDetectedIngredients,
      message: 'Image processed successfully'
    });
  } catch (error) {
    console.error('Error processing image:', error);
    return NextResponse.json(
      { error: 'Failed to process image' },
      { status: 500 }
    );
  }
} 