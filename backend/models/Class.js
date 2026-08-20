import mongoose from "mongoose";

const classSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    branch: {
      type: String,
      required: true,
      trim: true,
    },

    semester: {
      type: String,
      required: true,
      trim: true,
    },

    section: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    students: {
      type: Number,
      required: true,
      min: 1,
    },

    subjects: {
      type: [String],
      required: true,
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

classSchema.index(
  {
    userId: 1,
    branch: 1,
    semester: 1,
    section: 1,
  },
  {
    unique: true,
  }
);

const Class = mongoose.model("Class", classSchema);

export default Class;