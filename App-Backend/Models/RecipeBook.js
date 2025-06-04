import mongoose from "mongoose";

const recipeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  prepTime: {
    type: String,
    default: ""
  },
  ingredients: {
    type: [String],
    required: true
  },
  steps: {
    type: [String],
    required: true
  },
  media: [
    {
      url: {
        type: String,
        required: true
      },
      type: {
        type: String,
        enum: ["image", "video"],
        required: true
      },
      isFile: {
        type: Boolean,
        default: false
      }
    }
  ],
  user: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.model("RecipeBook", recipeSchema);