import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';

const FOOD_EMOJIS = [
  '🍕', '🍔', '🍣', '🍜', '🍩', '🍎', '🍟', '🍦', '🍉', '🥑', '🥗', '🍗', '🍞', '🍰', '🍇', '🍤', '🍪', '🍿', '🍔', '🍕',
];

function EmojiBackground() {
  // Responsive grid: more rows/cols for large screens
  const rows = 14;
  const cols = 28;
  const emojiGrid = [];
  for (let i = 0; i < rows; i++) {
    const row = [];
    for (let j = 0; j < cols; j++) {
      const emoji = FOOD_EMOJIS[(i * cols + j) % FOOD_EMOJIS.length];
      row.push(
        <span key={`${i}-${j}`} className="text-8xl opacity-60 select-none">
          {emoji}
        </span>
      );
    }
    emojiGrid.push(
      <div key={i} className="flex flex-row justify-center">
        {row}
      </div>
    );
  }
  return (
    <div className="absolute inset-0 z-0 w-full h-full flex flex-col items-center justify-center pointer-events-none">
      {emojiGrid}
    </div>
  );
}

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-100 via-orange-100 to-red-100 overflow-hidden">
      {/* Food emoji background pattern */}
      <EmojiBackground />
      {/* Gradient overlay for readability */}
      <div className="absolute inset-0 z-10 bg-gradient-to-br from-white/80 to-white/60" />

      <main className="relative z-20 flex flex-col items-center justify-center w-full px-4">
        <div className="w-full max-w-lg p-10 bg-white/90 rounded-3xl shadow-2xl flex flex-col items-center animate-fade-in-up">
          {/* Logo placeholder */}
          <div className="mb-4 flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-red-400 shadow-lg">
            <span className="text-4xl">🍲</span>
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-2 tracking-tight">
            Welcome to Foodeee
          </h1>
          <p className="text-lg text-gray-600 text-center mb-6">
            Discover recipes tailored to your pantry. Sign in to get personalized meal ideas and manage your kitchen like a pro!
          </p>

          {session ? (
            <div className="w-full space-y-4">
              <div className="bg-green-100 p-4 rounded-md text-center">
                <p className="text-green-700 font-medium">✓ Authenticated as {session.user?.email}</p>
              </div>
              <div className="flex flex-col gap-2">
                <Link 
                  href="/api/auth/signout"
                  className="py-2 px-4 rounded-lg text-white bg-red-600 hover:bg-red-700 font-semibold transition"
                >
                  Sign Out
                </Link>
                <Link 
                  href="/dashboard"
                  className="py-2 px-4 rounded-lg text-white bg-blue-600 hover:bg-blue-700 font-semibold transition"
                >
                  Go to Dashboard
                </Link>
              </div>
            </div>
          ) : (
            <div className="w-full space-y-4">
              <div className="bg-yellow-100 p-4 rounded-md text-center">
                <p className="text-yellow-700 font-medium">Not authenticated</p>
              </div>
              <Link 
                href="/auth/signin"
                className="w-full flex justify-center py-3 px-4 rounded-lg text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 font-bold text-lg shadow-md transition"
              >
                Sign In with Google
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
