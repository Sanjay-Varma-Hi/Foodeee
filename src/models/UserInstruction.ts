import mongoose from 'mongoose';

const userInstructionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: [true, 'User ID is required'],
    index: true
  },
  dietaryPreferences: [{
    type: String,
    enum: ['vegetarian', 'vegan', 'pescatarian', 'keto', 'paleo', 'low-carb', 'low-fat', 'gluten-free', 'dairy-free']
  }],
  allergies: [{
    type: String,
    trim: true
  }],
  healthGoals: [{
    type: String,
    enum: ['weight-loss', 'muscle-gain', 'maintenance', 'heart-healthy', 'diabetes-friendly', 'energy-boost']
  }],
  additionalNotes: {
    type: String,
    maxlength: [500, 'Additional notes cannot exceed 500 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
userInstructionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const UserInstruction = mongoose.models.UserInstruction || mongoose.model('UserInstruction', userInstructionSchema);

export default UserInstruction; 