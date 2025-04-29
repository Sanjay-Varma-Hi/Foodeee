import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { promises as fs } from 'fs';
import path from 'path';

// Define the type for shopping list items
interface ShoppingListItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  completed: boolean;
}

// Helper function to read shopping list data
async function readShoppingListData(): Promise<ShoppingListItem[]> {
  try {
    const filePath = path.join(process.cwd(), 'data', 'shopping-list.json');
    const fileContents = await fs.readFile(filePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.error('Error reading shopping list data:', error);
    return [];
  }
}

// Helper function to write shopping list data
async function writeShoppingListData(items: ShoppingListItem[]): Promise<void> {
  try {
    const filePath = path.join(process.cwd(), 'data', 'shopping-list.json');
    await fs.writeFile(filePath, JSON.stringify(items, null, 2));
  } catch (error) {
    console.error('Error writing shopping list data:', error);
    throw error;
  }
}

// GET: Get all shopping list items
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const items = await readShoppingListData();
    return NextResponse.json(items);
  } catch (error) {
    console.error('Error getting shopping list items:', error);
    return NextResponse.json({ error: 'Failed to get shopping list items' }, { status: 500 });
  }
}

// POST: Add a new shopping list item
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const item = await request.json();
    const items = await readShoppingListData();
    
    // Generate a unique ID for the new item
    item.id = Date.now().toString();
    item.completed = false;
    
    items.push(item);
    await writeShoppingListData(items);
    
    return NextResponse.json(item);
  } catch (error) {
    console.error('Error adding shopping list item:', error);
    return NextResponse.json({ error: 'Failed to add shopping list item' }, { status: 500 });
  }
}

// PUT: Update an existing shopping list item
export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const updatedItem = await request.json();
    const items = await readShoppingListData();
    
    const index = items.findIndex(item => item.id === updatedItem.id);
    if (index === -1) {
      return NextResponse.json({ error: 'Shopping list item not found' }, { status: 404 });
    }
    
    items[index] = updatedItem;
    await writeShoppingListData(items);
    
    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('Error updating shopping list item:', error);
    return NextResponse.json({ error: 'Failed to update shopping list item' }, { status: 500 });
  }
}

// DELETE: Remove a shopping list item
export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await request.json();
    const items = await readShoppingListData();
    
    const filteredItems = items.filter(item => item.id !== id);
    if (filteredItems.length === items.length) {
      return NextResponse.json({ error: 'Shopping list item not found' }, { status: 404 });
    }
    
    await writeShoppingListData(filteredItems);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting shopping list item:', error);
    return NextResponse.json({ error: 'Failed to delete shopping list item' }, { status: 500 });
  }
} 