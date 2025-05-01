import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import SignInButton from '@/components/SignInButton';

interface PageProps {
  searchParams: {
    error?: string;
    callbackUrl?: string;
  };
}

export default async function SignIn({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to Foodeee
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Get personalized recipe recommendations based on your pantry
          </p>
        </div>
        
        {searchParams?.error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Authentication Error: </strong>
            <span className="block sm:inline">
              Please make sure you have:
              <ul className="list-disc pl-5 mt-2">
                <li>Selected a Google account</li>
                <li>Granted the required permissions</li>
                <li>Completed the consent screen</li>
              </ul>
            </span>
          </div>
        )}

        <div className="mt-8 space-y-6">
          <SignInButton />
        </div>
      </div>
    </div>
  );
} 