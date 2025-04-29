'use client';

import { signIn } from 'next-auth/react';

export default function SignInButton() {
  const handleSignIn = () => {
    signIn('google', {
      callbackUrl: '/dashboard',
      prompt: 'select_account',
    });
  };

  return (
    <button
      onClick={handleSignIn}
      className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
    >
      Sign in with Google
    </button>
  );
} 

