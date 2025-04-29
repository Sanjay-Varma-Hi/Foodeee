import { ObjectId } from 'mongodb';
import clientPromise from './clientPromise';

export interface Ingredient {
  id: string;
  userId: string;
  name: string;
  quantity?: number;
  unit?: string;
  confidence?: number;
  addedAt: Date;
}

export async function getUserIngredients(userId: string) {
  const client = await clientPromise;
  const collection = client.db().collection('pantryItems');
  
  const ingredients = await collection
    .find({ userId })
    .sort({ addedAt: -1 })
    .toArray();
  
  return ingredients.map(item => ({
    ...item,
    id: item._id.toString()
  }));
}

export async function addIngredients(userId: string, ingredients: Omit<Ingredient, 'id' | 'userId'>[]) {
  const client = await clientPromise;
  const collection = client.db().collection('pantryItems');
  
  const itemsToInsert = ingredients.map(ingredient => ({
    ...ingredient,
    userId,
    addedAt: new Date(ingredient.addedAt)
  }));
  
  const result = await collection.insertMany(itemsToInsert);
  
  return Object.values(result.insertedIds).map(id => id.toString());
}

export async function updateIngredient(id: string, userId: string, updates: Partial<Ingredient>) {
  const client = await clientPromise;
  const collection = client.db().collection('pantryItems');
  
  const { id: _, userId: __, ...updateData } = updates;
  
  const result = await collection.updateOne(
    { _id: new ObjectId(id), userId },
    { $set: updateData }
  );
  
  return result.modifiedCount > 0;
}

export async function deleteIngredient(id: string, userId: string) {
  const client = await clientPromise;
  const collection = client.db().collection('pantryItems');
  
  const result = await collection.deleteOne({
    _id: new ObjectId(id),
    userId
  });
  
  return result.deletedCount > 0;
}

export async function clearAllIngredients(userId: string) {
  const client = await clientPromise;
  const collection = client.db().collection('pantryItems');
  
  const result = await collection.deleteMany({ userId });
  
  return result.deletedCount;
}

interface PantryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  expiryDate?: string;
  notes?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function getPantryItems(userId: string): Promise<PantryItem[]> {
  const client = await clientPromise;
  const db = client.db('food_bot');
  return db.collection('pantry_items').find({ userId }).toArray();
}

export async function addPantryItem(item: Omit<PantryItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<PantryItem> {
  const client = await clientPromise;
  const db = client.db('food_bot');
  const result = await db.collection('pantry_items').insertOne({
    ...item,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  return { ...item, id: result.insertedId.toString(), createdAt: new Date(), updatedAt: new Date() };
}

export async function updatePantryItem(id: string, updates: Partial<PantryItem>): Promise<void> {
  const client = await clientPromise;
  const db = client.db('food_bot');
  await db.collection('pantry_items').updateOne(
    { _id: id },
    { $set: { ...updates, updatedAt: new Date() } }
  );
}

export async function deletePantryItem(id: string): Promise<void> {
  const client = await clientPromise;
  const db = client.db('food_bot');
  await db.collection('pantry_items').deleteOne({ _id: id });
}

export async function clearPantryItems(userId: string): Promise<void> {
  const client = await clientPromise;
  const db = client.db('food_bot');
  await db.collection('pantry_items').deleteMany({ userId });
} 