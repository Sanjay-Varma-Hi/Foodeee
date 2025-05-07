# Foodeee - Smart Pantry Management System

A Next.js application that helps users manage their pantry inventory, track ingredients, and get recipe suggestions based on available items.

## 🚀 Features

- Google Authentication for secure user access
- MongoDB database for storing user data and pantry items
- Real-time pantry inventory management
- User profile management
- Custom instructions for personalized experience
- Modern UI with Tailwind CSS
- TypeScript for type safety
- React Query for efficient data fetching

## 🛠️ Tech Stack

- **Frontend Framework**: Next.js 15.3.1
- **Language**: TypeScript
- **Authentication**: NextAuth.js with Google Provider
- **Database**: MongoDB with Mongoose
- **Styling**: Tailwind CSS
- **State Management**: React Query
- **HTTP Client**: Axios
- **Development Tools**: ESLint, TypeScript

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB database
- Google Cloud Platform account (for OAuth)
- npm or yarn package manager

## 🔧 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# MongoDB
MONGODB_URI=your_mongodb_connection_string

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## 🚀 Getting Started

1. Clone the repository:
```bash
git clone <repository-url>
cd food_bot
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your credentials
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📁 Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── pantry/       # Pantry management endpoints
│   │   ├── user-profile/ # User profile endpoints
│   │   └── auth/         # Authentication endpoints
│   └── (routes)/         # Frontend routes
├── components/            # React components
├── lib/                   # Utility functions and configurations
│   ├── auth/             # Authentication setup
│   ├── db/               # Database configurations
│   └── utils/            # Helper functions
└── types/                # TypeScript type definitions
```

## 🔄 API Endpoints

### Authentication
- `POST /api/auth/signin` - Sign in with Google
- `POST /api/auth/signout` - Sign out

### Pantry Management
- `GET /api/pantry/items` - Get all pantry items
- `POST /api/pantry/items` - Add new pantry item
- `PATCH /api/pantry/items/[id]` - Update pantry item
- `DELETE /api/pantry/items/[id]` - Delete pantry item

### User Profile
- `GET /api/user-profile` - Get user profile
- `PATCH /api/user-profile` - Update user profile

## 🛠️ Development Commands

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linter
npm run lint
```

## 🔒 Security

- All API routes are protected with NextAuth.js
- MongoDB connection is secured with environment variables
- Google OAuth provides secure authentication
- TypeScript ensures type safety

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request