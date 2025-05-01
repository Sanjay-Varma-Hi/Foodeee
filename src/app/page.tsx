import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div>
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-4">
            Food Bot Authentication Test
          </h1>
          
          {session ? (
            <div className="space-y-4">
              <div className="bg-green-100 p-4 rounded-md">
                <p className="text-green-700">✓ Successfully authenticated as:</p>
                <p className="font-medium">{session.user?.email}</p>
              </div>
              <div className="flex flex-col space-y-2">
                <Link 
                  href="/api/auth/signout"
                  className="text-center py-2 px-4 border border-transparent rounded-md text-white bg-red-600 hover:bg-red-700"
                >
                  Sign Out
                </Link>
                <Link 
                  href="/dashboard"
                  className="text-center py-2 px-4 border border-transparent rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Go to Dashboard
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-yellow-100 p-4 rounded-md">
                <p className="text-yellow-700">Not authenticated</p>
              </div>
              <Link 
                href="/auth/signin"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Sign In with Google
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
