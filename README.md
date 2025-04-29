# Food Bot Project

## Overview
This project is a web application that helps users manage their pantry and get recipe recommendations based on available ingredients. It uses Next.js, NextAuth for authentication, and integrates with various API endpoints for pantry management and recipe suggestions.

## Features
- **User Authentication**: Secure sign-in using NextAuth.
- **Pantry Management**: Add, update, and delete pantry items.
- **Recipe Recommendations**: Get recipe suggestions based on pantry items.
- **API Integration**: Various endpoints for pantry, user instructions, and recipe data.

## Project Structure
- **Frontend**: Next.js app with components for UI.
- **Backend**: API routes for pantry, user instructions, and recipe recommendations.
- **Authentication**: NextAuth integration for user sessions.

## Setup Instructions
1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd food_bot
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env.local` file in the root directory with the following variables:
   ```
   NEXTAUTH_SECRET=your_secret_here
   NEXTAUTH_URL=http://localhost:3000
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Access the application**:
   Open your browser and navigate to `http://localhost:3000`.

## API Endpoints
- **Pantry Management**:
  - `GET /api/pantry/items`: Retrieve pantry items.
  - `POST /api/pantry/items`: Add a new pantry item.
  - `PUT /api/pantry/items/[id]`: Update a pantry item.
  - `DELETE /api/pantry/items/[id]`: Delete a pantry item.

- **User Instructions**:
  - `GET /api/user-instructions`: Retrieve user instructions.

- **Recipe Recommendations**:
  - `GET /api/recommend`: Get recipe recommendations based on pantry items.

## Troubleshooting
- **Dashboard Issues**: If the dashboard is not working, check the browser console for errors. Ensure all API endpoints are functioning correctly.
- **Missing Files**: If you encounter errors related to missing files (e.g., `recipes/recipe_data.json`), ensure all required data files are present or update the API code to handle their absence.

## Contributing
Feel free to submit issues and pull requests. For major changes, please open an issue first to discuss what you would like to change.

## License
This project is licensed under the MIT License - see the LICENSE file for details.
