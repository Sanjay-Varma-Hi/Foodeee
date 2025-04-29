import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request: Request) {
  // Check if user is authenticated
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // In a real app, this would:
    // 1. Retrieve user's pantry items from database
    // 2. Call ML microservice for personalized recommendations
    // 3. Return the recommendations
    
    // For now, return mock data
    const mockRecipes = [
      {
        id: '1',
        title: 'Tomato and Onion Pasta',
        description: 'A simple and delicious pasta dish with fresh tomatoes and sautéed onions.',
        image: 'https://images.unsplash.com/photo-1455279032140-49a7b5f69a7a?q=80&w=500',
        ingredients: ['Pasta', 'Tomatoes', 'Onions', 'Garlic', 'Olive oil', 'Basil'],
        cookTime: 25,
        difficulty: 'easy',
        matchScore: 92,
        instructions: [
          {
            timestamp: '00:00',
            step: 'Bring a large pot of salted water to boil and cook pasta according to package instructions.'
          },
          {
            timestamp: '00:02',
            step: 'While pasta cooks, heat olive oil in a large pan over medium heat.'
          },
          {
            timestamp: '00:04',
            step: 'Add chopped onions and sauté until translucent, about 5 minutes.'
          },
          {
            timestamp: '00:09',
            step: 'Add minced garlic and cook for 1 minute until fragrant.'
          },
          {
            timestamp: '00:10',
            step: 'Add diced tomatoes and cook for 5-7 minutes until softened.'
          },
          {
            timestamp: '00:17',
            step: 'Season with salt and pepper to taste.'
          },
          {
            timestamp: '00:18',
            step: 'Drain pasta and add to the pan with the sauce.'
          },
          {
            timestamp: '00:20',
            step: 'Toss everything together and garnish with fresh basil leaves.'
          },
          {
            timestamp: '00:22',
            step: 'Serve hot with grated parmesan cheese if desired.'
          }
        ]
      },
      {
        id: '2',
        title: 'Bell Pepper Stir Fry',
        description: 'A colorful stir fry loaded with bell peppers and your choice of protein.',
        image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=500',
        ingredients: ['Bell peppers', 'Onions', 'Garlic', 'Soy sauce', 'Rice'],
        cookTime: 20,
        difficulty: 'easy',
        matchScore: 85,
        instructions: [
          {
            timestamp: '00:00',
            step: 'Cook rice according to package instructions and set aside.'
          },
          {
            timestamp: '00:02',
            step: 'Heat oil in a wok or large pan over high heat.'
          },
          {
            timestamp: '00:04',
            step: 'Add sliced onions and stir fry for 2 minutes.'
          },
          {
            timestamp: '00:06',
            step: 'Add minced garlic and cook for 30 seconds.'
          },
          {
            timestamp: '00:07',
            step: 'Add sliced bell peppers and stir fry for 3-4 minutes until slightly softened.'
          },
          {
            timestamp: '00:11',
            step: 'Add soy sauce and any other desired seasonings.'
          },
          {
            timestamp: '00:12',
            step: 'If using protein, add it now and cook until done.'
          },
          {
            timestamp: '00:17',
            step: 'Serve the stir fry over the cooked rice.'
          },
          {
            timestamp: '00:18',
            step: 'Garnish with green onions or sesame seeds if desired.'
          }
        ]
      },
      {
        id: '3',
        title: 'Vegetable Curry',
        description: 'A flavorful and spicy vegetable curry that comes together in under 30 minutes.',
        image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=500',
        ingredients: ['Tomatoes', 'Onions', 'Bell peppers', 'Curry powder', 'Coconut milk', 'Rice'],
        cookTime: 30,
        difficulty: 'medium',
        matchScore: 78,
        instructions: [
          {
            timestamp: '00:00',
            step: 'Cook rice according to package instructions and set aside.'
          },
          {
            timestamp: '00:02',
            step: 'Heat oil in a large pot over medium heat.'
          },
          {
            timestamp: '00:04',
            step: 'Add chopped onions and sauté until golden brown.'
          },
          {
            timestamp: '00:09',
            step: 'Add curry powder and stir for 1 minute to release flavors.'
          },
          {
            timestamp: '00:10',
            step: 'Add diced tomatoes and cook until they break down.'
          },
          {
            timestamp: '00:15',
            step: 'Add sliced bell peppers and cook for 3-4 minutes.'
          },
          {
            timestamp: '00:19',
            step: 'Pour in coconut milk and bring to a simmer.'
          },
          {
            timestamp: '00:22',
            step: 'Season with salt and let the curry simmer for 10-15 minutes.'
          },
          {
            timestamp: '00:27',
            step: 'Adjust seasoning if needed and serve hot over rice.'
          },
          {
            timestamp: '00:28',
            step: 'Garnish with fresh cilantro if desired.'
          }
        ]
      },
      {
        id: '4',
        title: 'Mediterranean Salad',
        description: 'A refreshing salad with tomatoes, cucumbers, and feta cheese.',
        image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=500',
        ingredients: ['Tomatoes', 'Cucumber', 'Red onion', 'Feta cheese', 'Olive oil', 'Lemon juice'],
        cookTime: 15,
        difficulty: 'easy',
        matchScore: 75,
        instructions: [
          {
            timestamp: '00:00',
            step: 'Wash and chop all vegetables into bite-sized pieces.'
          },
          {
            timestamp: '00:05',
            step: 'Thinly slice the red onion.'
          },
          {
            timestamp: '00:07',
            step: 'In a large bowl, combine tomatoes, cucumber, and red onion.'
          },
          {
            timestamp: '00:08',
            step: 'Crumble feta cheese over the vegetables.'
          },
          {
            timestamp: '00:09',
            step: 'In a small bowl, whisk together olive oil and lemon juice.'
          },
          {
            timestamp: '00:10',
            step: 'Season the dressing with salt and pepper to taste.'
          },
          {
            timestamp: '00:11',
            step: 'Pour the dressing over the salad and gently toss to combine.'
          },
          {
            timestamp: '00:12',
            step: 'Let the salad sit for 5-10 minutes to allow flavors to meld.'
          },
          {
            timestamp: '00:13',
            step: 'Serve chilled with a sprinkle of fresh herbs if desired.'
          }
        ]
      }
    ];

    // Add a delay to simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));

    return NextResponse.json({
      recipes: mockRecipes,
      message: 'Recipe recommendations generated successfully'
    });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
} 