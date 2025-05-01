import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import clientPromise from '@/lib/db/clientPromise';

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
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
  const userId = session?.user?.id;
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