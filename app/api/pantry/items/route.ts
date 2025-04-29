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
async function writePantryData(data: PantryItem[]): Promise<void> {
  try {
    const filePath = path.join(process.cwd(), 'data', 'pantry.json');
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing pantry data:', error);
    throw new Error('Failed to save pantry data');
  }
}

// GET: Retrieve all pantry items
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const pantryItems = await readPantryData();
    return NextResponse.json(pantryItems);
  } catch (error) {
    console.error('Error retrieving pantry items:', error);
    return NextResponse.json({ error: 'Failed to retrieve pantry items' }, { status: 500 });
  }
}

// POST: Add a new pantry item
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const newItem: PantryItem = await request.json();
    const pantryItems = await readPantryData();
    pantryItems.push(newItem);
    await writePantryData(pantryItems);
    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error('Error adding pantry item:', error);
    return NextResponse.json({ error: 'Failed to add pantry item' }, { status: 500 });
  }
}

// PUT: Update a pantry item
export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const updatedItem: PantryItem = await request.json();
    const pantryItems = await readPantryData();
    const index = pantryItems.findIndex(item => item.id === updatedItem.id);
    if (index === -1) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }
    pantryItems[index] = updatedItem;
    await writePantryData(pantryItems);
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
    const pantryItems = await readPantryData();
    const filteredItems = pantryItems.filter(item => item.id !== id);
    await writePantryData(filteredItems);
    return NextResponse.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting pantry item:', error);
    return NextResponse.json({ error: 'Failed to delete pantry item' }, { status: 500 });
  }
} 