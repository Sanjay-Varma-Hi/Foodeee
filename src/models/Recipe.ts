import mongoose from 'mongoose';

const recipeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    maxlength: [100, 'Title cannot be more than 100 characters'],
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
  },
  ingredients: [{
    name: String,
    quantity: Number,
    unit: String,
    notes: String,
  }],
  instructions: [{
    timestamp: {
      type: String,
      required: true,
      validate: {
        validator: function(v: string) {
          return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
        },
        message: 'Timestamp must be in HH:MM format'
      }
    },
    step: {
      type: String,
      required: true
    }
  }],
  prepTime: Number, // in minutes
  cookTime: Number, // in minutes
  servings: Number,
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true,
  },
  cuisine: String,
  dietaryTags: [String],
  image: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  ratings: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    score: {
      type: Number,
      min: 1,
      max: 5,
    },
    comment: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  averageRating: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create the model if it doesn't exist, otherwise use the existing one
const Recipe = mongoose.models.Recipe || mongoose.model('Recipe', recipeSchema);

export default Recipe; 