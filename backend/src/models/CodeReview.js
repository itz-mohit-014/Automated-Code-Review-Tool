import mongoose from "mongoose";

const CodeReviewSchema = new mongoose.Schema(
  {
  repositoryUrl: {
     type: String,
      required: true
  },
  analysisResult: {
     type: String,
      required: true 
  },
}, {
  timestamps:true
});

export const CodeReview = mongoose.model('CodeReview', CodeReviewSchema);
