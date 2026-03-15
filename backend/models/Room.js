import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    // "dm" = direct message between two connected users
    // "community" = open group room for all verified members
    type: {
      type: String,
      enum: ["dm", "community"],
      required: true,
      index: true,
    },

    // Community room name (e.g. "Batch 2020", "CSE Alumni")
    name: {
      type: String,
      trim: true,
      maxlength: 100,
    },

    // Community room description
    description: {
      type: String,
      maxlength: 500,
    },

    // Community room avatar/cover image
    avatarUrl: {
      type: String,
    },

    // All members of this room
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Who created this room (relevant for community rooms)
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // Last message snapshot — used for room list preview
    lastMessage: {
      content: String,
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      type: {
        type: String,
        enum: ["text", "emoji", "file", "image"],
      },
      sentAt: Date,
    },

    // For DMs: a deterministic unique key so we never create duplicates
    // Format: "dm_<smallerUserId>_<largerUserId>"
    dmKey: {
      type: String,
      unique: true,
      sparse: true,
    },

    // Community rooms are visible to all; DM rooms are private
    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

roomSchema.index({ members: 1 });
roomSchema.index({ type: 1, isPublic: 1 });

export default mongoose.model("Room", roomSchema);
