import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    rollNo: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    branch: {
      type: String,
      required: true,
      trim: true,
    },

    semester: {
      type: String,
      required: true,
    },

    faceImage: {
      type: String,
      default: "",
    },

    faceDescriptor: {
      type: [Number],
      default: [],
    },

    faceEnrolled: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

studentSchema.index(
  {
    userId: 1,
    rollNo: 1,
  },
  {
    unique: true,
  }
);

const Student = mongoose.model("Student", studentSchema);

export default Student;