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