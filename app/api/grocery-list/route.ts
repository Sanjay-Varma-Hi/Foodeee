import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { promises as fs } from 'fs';
import path from 'path';

// Define the type for grocery list items
interface GroceryListItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  completed: boolean;
  notes?: string;
}

// Helper function to read grocery list data
async function readGroceryListData(): Promise<GroceryListItem[]> {
  try {
    const filePath = path.join(process.cwd(), 'data', 'grocery-list.json');
    const fileContents = await fs.readFile(filePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.error('Error reading grocery list data:', error);
    return [];
  }
}

// Helper function to write grocery list data
async function writeGroceryListData(groceryList: GroceryListItem[]): Promise<void> {
  try {
    const filePath = path.join(process.cwd(), 'data', 'grocery-list.json');
    await fs.writeFile(filePath, JSON.stringify(groceryList, null, 2));
  } catch (error) {
    console.error('Error writing grocery list data:', error);
    throw error;
  }
}

// GET: Get all grocery list items
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const groceryList = await readGroceryListData();
    return NextResponse.json(groceryList);
  } catch (error) {
    console.error('Error getting grocery list:', error);
    return NextResponse.json({ error: 'Failed to get grocery list' }, { status: 500 });
  }
}

// POST: Add a new grocery list item
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const groceryListItem = await request.json();
    const groceryList = await readGroceryListData();
    
    // Generate a unique ID for the new grocery list item
    groceryListItem.id = Date.now().toString();
    groceryListItem.completed = false;
    
    groceryList.push(groceryListItem);
    await writeGroceryListData(groceryList);
    
    return NextResponse.json(groceryListItem);
  } catch (error) {
    console.error('Error adding grocery list item:', error);
    return NextResponse.json({ error: 'Failed to add grocery list item' }, { status: 500 });
  }
}

// PUT: Update an existing grocery list item
export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const updatedGroceryListItem = await request.json();
    const groceryList = await readGroceryListData();
    
    const index = groceryList.findIndex(item => item.id === updatedGroceryListItem.id);
    if (index === -1) {
      return NextResponse.json({ error: 'Grocery list item not found' }, { status: 404 });
    }
    
    groceryList[index] = updatedGroceryListItem;
    await writeGroceryListData(groceryList);
    
    return NextResponse.json(updatedGroceryListItem);
  } catch (error) {
    console.error('Error updating grocery list item:', error);
    return NextResponse.json({ error: 'Failed to update grocery list item' }, { status: 500 });
  }
}

// DELETE: Remove a grocery list item
export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await request.json();
    const groceryList = await readGroceryListData();
    
    const filteredGroceryList = groceryList.filter(item => item.id !== id);
    if (filteredGroceryList.length === groceryList.length) {
      return NextResponse.json({ error: 'Grocery list item not found' }, { status: 404 });
    }
    
    await writeGroceryListData(filteredGroceryList);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting grocery list item:', error);
    return NextResponse.json({ error: 'Failed to delete grocery list item' }, { status: 500 });
  }
} 