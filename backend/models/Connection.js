import mongoose from "mongoose";

const connectionSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
      index: true,
    },

    message: {
      type: String,
      maxlength: 300,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate connection requests between same two users
connectionSchema.index({ sender: 1, receiver: 1 }, { unique: true });

// Fast lookup: all connections involving a user
connectionSchema.index({ receiver: 1, status: 1 });
connectionSchema.index({ sender: 1, status: 1 });

export default mongoose.model("Connection", connectionSchema);
