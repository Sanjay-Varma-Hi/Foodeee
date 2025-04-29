import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { promises as fs } from 'fs';
import path from 'path';

// Define the type for pantry items
interface PantryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  expiryDate?: string;
}

// Helper function to read pantry data
async function readPantryData(): Promise<PantryItem[]> {
  try {
    const filePath = path.join(process.cwd(), 'data', 'pantry.json');
    const fileContents = await fs.readFile(filePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.error('Error reading pantry data:', error);
    return [];
  }
}

// Helper function to write pantry data
async function writePantryData(items: PantryItem[]): Promise<void> {
  try {
    const filePath = path.join(process.cwd(), 'data', 'pantry.json');
    await fs.writeFile(filePath, JSON.stringify(items, null, 2));
  } catch (error) {
    console.error('Error writing pantry data:', error);
    throw error;
  }
}

// GET: Get all pantry items
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const items = await readPantryData();
    return NextResponse.json(items);
  } catch (error) {
    console.error('Error getting pantry items:', error);
    return NextResponse.json({ error: 'Failed to get pantry items' }, { status: 500 });
  }
}

// POST: Add a new pantry item
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const item = await request.json();
    const items = await readPantryData();
    
    // Generate a unique ID for the new item
    item.id = Date.now().toString();
    
    items.push(item);
    await writePantryData(items);
    
    return NextResponse.json(item);
  } catch (error) {
    console.error('Error adding pantry item:', error);
    return NextResponse.json({ error: 'Failed to add pantry item' }, { status: 500 });
  }
}

// PUT: Update an existing pantry item
export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const updatedItem = await request.json();
    const items = await readPantryData();
    
    const index = items.findIndex(item => item.id === updatedItem.id);
    if (index === -1) {
      return NextResponse.json({ error: 'Pantry item not found' }, { status: 404 });
    }
    
    items[index] = updatedItem;
    await writePantryData(items);
    
    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('Error updating pantry item:', error);
    return NextResponse.json({ error: 'Failed to update pantry item' }, { status: 500 });
  }
}

// DELETE: Remove a pantry item
export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await request.json();
    const items = await readPantryData();
    
    const filteredItems = items.filter(item => item.id !== id);
    if (filteredItems.length === items.length) {
      return NextResponse.json({ error: 'Pantry item not found' }, { status: 404 });
    }
    
    await writePantryData(filteredItems);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting pantry item:', error);
    return NextResponse.json({ error: 'Failed to delete pantry item' }, { status: 500 });
  }
} 