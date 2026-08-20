import express from "express";
import Student from "../models/Student.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
    const students = await Student.find({
      userId: req.user._id,
    }).sort({
      createdAt: -1,
    });

    res.json(students);
  } catch (error) {
    console.error("GET STUDENTS ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch students",
      error: error.message,
    });
  }
});

router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      name,
      rollNo,
      branch,
      semester,
      faceImage,
      faceDescriptor,
    } = req.body;

    if (!name || !rollNo || !branch || !semester) {
      return res.status(400).json({
        message: "Please provide all required student details",
      });
    }

    const existingStudent = await Student.findOne({
      userId: req.user._id,
      rollNo: rollNo.toUpperCase(),
    });

    if (existingStudent) {
      return res.status(400).json({
        message: "Student with this roll number already exists",
      });
    }

    if (
      !Array.isArray(faceDescriptor) ||
      faceDescriptor.length !== 512
    ) {
      return res.status(400).json({
        message: "Valid 512-dimensional AI face embedding is required",
      });
    }

    const student = await Student.create({
      userId: req.user._id,
      name,
      rollNo: rollNo.toUpperCase(),
      branch,
      semester,
      faceImage: faceImage || "",
      faceDescriptor,
      faceEnrolled: true,
    });

    res.status(201).json({
      message: "Student added successfully with AI face embedding",
      student,
    });
  } catch (error) {
    console.error("CREATE STUDENT ERROR:", error);

    res.status(500).json({
      message: "Failed to add student",
      error: error.message,
    });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const student = await Student.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    res.json({
      message: "Student deleted successfully",
    });
  } catch (error) {
    console.error("DELETE STUDENT ERROR:", error);

    res.status(500).json({
      message: "Failed to delete student",
      error: error.message,
    });
  }
});

export default router;