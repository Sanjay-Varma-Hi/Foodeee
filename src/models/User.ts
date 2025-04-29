import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    maxlength: [50, 'Name cannot be more than 50 characters'],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email',
    ],
  },
  image: {
    type: String,
  },
  preferences: {
    dietaryRestrictions: [String],
    favoriteCuisines: [String],
    cookingSkillLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
  },
  pantry: [{
    ingredient: String,
    quantity: Number,
    unit: String,
    lastUpdated: Date,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create the model if it doesn't exist, otherwise use the existing one
const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User; 