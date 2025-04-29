import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '../api/auth/[...nextauth]/route';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import PantryManager from '@/components/PantryManager';
import RecipeRecommendations from '@/components/RecipeRecommendations';

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={session?.user} />
      
      <main className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-4">
              {session.user?.image && (
                <div className="relative h-12 w-12 rounded-full overflow-hidden">
                  <Image
                    src={session.user.image}
                    alt={session.user.name || 'User'}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome, {session.user?.name}!
                </h1>
                <p className="text-gray-500">{session.user?.email}</p>
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-lg font-semibold text-gray-900">
                Manage Your Ingredients
              </h2>
              <p className="mt-2 text-gray-600">
                Add ingredients to your pantry by uploading a photo or entering them manually.
                Get personalized recipe recommendations based on what you have.
              </p>
            </div>
          </div>

          {/* Pantry Manager Component */}
          <PantryManager />

          {/* Recipe Recommendations Component */}
          <RecipeRecommendations />
        </div>
      </main>
    </div>
  );
} 