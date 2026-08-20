import express from "express";
import Attendance from "../models/Attendance.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", async (req, res) => {
  try {
    const attendance = await Attendance.find({
      userId: req.user._id,
    }).sort({
      createdAt: -1,
    });

    res.json(attendance);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch attendance",
      error: error.message,
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const {
      branch,
      semester,
      section,
      subject,
      date,
      presentStudents,
      absentStudents,
      totalStudents,
    } = req.body;

    if (
      !branch ||
      !semester ||
      !section ||
      !subject ||
      !date
    ) {
      return res.status(400).json({
        message: "Please provide all attendance details",
      });
    }

    const attendance = await Attendance.create({
      userId: req.user._id,
      branch,
      semester,
      section,
      subject,
      date,
      presentStudents: presentStudents || [],
      absentStudents: absentStudents || [],
      totalStudents: totalStudents || 0,
    });

    res.status(201).json({
      message: "Attendance saved successfully",
      attendance,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to save attendance",
      error: error.message,
    });
  }
});

router.get("/report", async (req, res) => {
  try {
    const attendanceRecords = await Attendance.find({
      userId: req.user._id,
    });

    const totalClasses = attendanceRecords.length;

    let totalPresent = 0;
    let totalAbsent = 0;

    attendanceRecords.forEach((record) => {
      totalPresent += record.presentStudents.length;
      totalAbsent += record.absentStudents.length;
    });

    const totalStudents = totalPresent + totalAbsent;

    const overallAttendance =
      totalStudents > 0
        ? Number(((totalPresent / totalStudents) * 100).toFixed(1))
        : 0;

    const classMap = {};

    attendanceRecords.forEach((record) => {
      const key = `${record.branch}-${record.semester}-${record.section}`;

      if (!classMap[key]) {
        classMap[key] = {
          id: key,
          className: `${record.branch} • Semester ${record.semester} • Section ${record.section}`,
          students: record.totalStudents,
          present: 0,
          total: 0,
        };
      }

      classMap[key].present += record.presentStudents.length;
      classMap[key].total +=
        record.presentStudents.length +
        record.absentStudents.length;
    });

    const classReports = Object.values(classMap).map((item) => ({
      id: item.id,
      className: item.className,
      students: item.students,
      attendance:
        item.total > 0
          ? Number(((item.present / item.total) * 100).toFixed(1))
          : 0,
    }));

    const subjectMap = {};

    attendanceRecords.forEach((record) => {
      const key = record.subject;

      if (!subjectMap[key]) {
        subjectMap[key] = {
          subject: record.subject,
          present: 0,
          total: 0,
          classes: 0,
        };
      }

      subjectMap[key].present += record.presentStudents.length;
      subjectMap[key].total +=
        record.presentStudents.length +
        record.absentStudents.length;
      subjectMap[key].classes += 1;
    });

    const subjectReports = Object.values(subjectMap).map((item) => ({
      subject: item.subject,
      attendance:
        item.total > 0
          ? Number(((item.present / item.total) * 100).toFixed(1))
          : 0,
      classes: item.classes,
    }));

    res.json({
      overallAttendance,
      totalClasses,
      totalPresent,
      totalAbsent,
      classReports,
      subjectReports,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to generate reports",
      error: error.message,
    });
  }
});

export default router;