import mongoose from "mongoose";

let ApplicationSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true 
    },

    email: { 
      type: String, 
      required: true, 
      unique: true 
    },

    phone: { 
      type: String, 
      required: true 
    },

    position: {
      type: String,
      required: true,
      enum: [
        'Delivery Partner', 
        'Kitchen Assistant', 
        'Customer Support'
      ]
    },

    resumeUrl: { 
      type: String, 
      required: true 
    },

    experience: { 
      type: String, 
      required: true 
    },

    submissionDate: { 
      type: Date, 
      default: Date.now 
    },

    status: {
      type: String,
      enum: [
        'pending', 
        'reviewed', 
        'accepted', 
        'rejected'
      ],
      default: 'pending'
    }
  }, 

  { timestamps: true }
);


let Application = mongoose.model("Application", ApplicationSchema);
export default Application;