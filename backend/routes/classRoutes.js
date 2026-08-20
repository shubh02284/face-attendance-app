import express from "express";
import Class from "../models/Class.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", async (req, res) => {
  try {
    const classes = await Class.find({
      userId: req.user._id,
    }).sort({
      createdAt: -1,
    });

    res.json(classes);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch classes",
      error: error.message,
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const { branch, semester, section, students, subjects } = req.body;

    if (
      !branch ||
      !semester ||
      !section ||
      !students ||
      !Array.isArray(subjects) ||
      subjects.length === 0
    ) {
      return res.status(400).json({
        message: "Please provide all required class details",
      });
    }

    const existingClass = await Class.findOne({
      userId: req.user._id,
      branch,
      semester,
      section: section.toUpperCase(),
    });

    if (existingClass) {
      return res.status(400).json({
        message: "This class already exists",
      });
    }

    const newClass = await Class.create({
      userId: req.user._id,
      branch,
      semester,
      section,
      students: Number(students),
      subjects,
    });

    res.status(201).json({
      message: "Class added successfully",
      class: newClass,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add class",
      error: error.message,
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deletedClass = await Class.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!deletedClass) {
      return res.status(404).json({
        message: "Class not found",
      });
    }

    res.json({
      message: "Class deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete class",
      error: error.message,
    });
  }
});

export default router;