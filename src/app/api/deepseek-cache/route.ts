import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import clientPromise from '@/lib/db/clientPromise';
import { promises as fs } from 'fs';
import path from 'path';

interface CacheData {
  [key: string]: {
    timestamp: number;
    data: unknown;
  };
}

// Helper function to read cache data
async function readCacheData(): Promise<CacheData> {
  try {
    const filePath = path.join(process.cwd(), 'data', 'deepseek-cache.json');
    const fileContents = await fs.readFile(filePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.error('Error reading cache data:', error);
    return {};
  }
}

// Helper function to write cache data
async function writeCacheData(cache: CacheData): Promise<void> {
  try {
    const filePath = path.join(process.cwd(), 'data', 'deepseek-cache.json');
    await fs.writeFile(filePath, JSON.stringify(cache, null, 2));
  } catch (error) {
    console.error('Error writing cache data:', error);
    throw error;
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = session?.user && (session.user as any).id;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const client = await clientPromise;
    const collection = client.db().collection('deepseekResponses');
    const doc = await collection.findOne({ userId }, { sort: { createdAt: -1 } });
    if (!doc) {
      return NextResponse.json({ found: false });
    }
    return NextResponse.json({ found: true, response: doc.response, recipes: doc.recipes, createdAt: doc.createdAt });
  } catch (error) {
    return NextResponse.json({ error: error?.toString() }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user && (session.user as any).id;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { response, recipes } = await req.json();
    const client = await clientPromise;
    const collection = client.db().collection('deepseekResponses');
    // Delete any existing response for this user
    await collection.deleteMany({ userId });
    const doc = {
      userId,
      response,
      recipes,
      createdAt: new Date()
    };
    await collection.insertOne(doc);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error?.toString() }, { status: 500 });
  }
} 