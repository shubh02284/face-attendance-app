import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import apiRequest from "../utils/api";

import {
  BarChart3,
  CalendarDays,
  Users,
  UserCheck,
  TrendingUp,
  BookOpen,
} from "lucide-react";


function Reports() {
  const [reportData, setReportData] = useState({
    overallAttendance: 0,
    totalClasses: 0,
    totalPresent: 0,
    totalAbsent: 0,
    classReports: [],
    subjectReports: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await apiRequest("/attendance/report");

      setReportData(data);
    } catch (error) {
      console.error(error);
      setError(error.message || "Failed to fetch reports");
    } finally {
      setLoading(false);
    }
  };

  const {
    overallAttendance,
    totalClasses,
    totalPresent,
    totalAbsent,
    classReports,
    subjectReports,
  } = reportData;

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-sm font-medium text-slate-500">
          Loading attendance reports...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center">
        <p className="text-sm font-medium text-red-500">
          {error}
        </p>

        <button
          onClick={fetchReports}
          className="mt-4 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mx-auto w-full max-w-7xl"
    >
      <div>
        <p className="text-sm font-semibold tracking-wider text-slate-400">
          ANALYTICS & INSIGHTS
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Attendance Reports
        </h1>

        <p className="mt-2 text-slate-500">
          Analyze attendance performance across classes and subjects.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
            <TrendingUp size={22} />
          </div>

          <p className="mt-5 text-sm font-medium text-slate-500">
            Overall Attendance
          </p>

          <h2 className="mt-1 text-3xl font-bold text-slate-900">
            {overallAttendance}%
          </h2>

          <p className="mt-2 text-xs font-medium text-emerald-600">
            {overallAttendance >= 75
              ? "Good attendance rate"
              : "Attendance needs improvement"}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <CalendarDays size={22} />
          </div>

          <p className="mt-5 text-sm font-medium text-slate-500">
            Classes Conducted
          </p>

          <h2 className="mt-1 text-3xl font-bold text-slate-900">
            {totalClasses}
          </h2>

          <p className="mt-2 text-xs text-slate-400">
            Total recorded sessions
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <UserCheck size={22} />
          </div>

          <p className="mt-5 text-sm font-medium text-slate-500">
            Total Present
          </p>

          <h2 className="mt-1 text-3xl font-bold text-slate-900">
            {totalPresent.toLocaleString()}
          </h2>

          <p className="mt-2 text-xs text-slate-400">
            Across all attendance sessions
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-500">
            <Users size={22} />
          </div>

          <p className="mt-5 text-sm font-medium text-slate-500">
            Total Absent
          </p>

          <h2 className="mt-1 text-3xl font-bold text-slate-900">
            {totalAbsent.toLocaleString()}
          </h2>

          <p className="mt-2 text-xs text-slate-400">
            Across all attendance sessions
          </p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <BarChart3 size={20} />
            </div>

            <div>
              <h2 className="font-bold text-slate-900">
                Class-wise Attendance
              </h2>

              <p className="text-sm text-slate-500">
                Average attendance by class
              </p>
            </div>
          </div>

          <div className="mt-7 space-y-6">
            {classReports.length > 0 ? (
              classReports.map((item) => (
                <div key={item.id}>
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {item.className}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {item.students} students
                      </p>
                    </div>

                    <span className="shrink-0 text-sm font-bold text-slate-900">
                      {item.attendance}%
                    </span>
                  </div>

                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.attendance}%` }}
                      transition={{ duration: 0.7 }}
                      className="h-full rounded-full bg-slate-900"
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="py-8 text-center text-sm text-slate-400">
                No attendance records available.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <BookOpen size={20} />
            </div>

            <div>
              <h2 className="font-bold text-slate-900">
                Subject-wise Performance
              </h2>

              <p className="text-sm text-slate-500">
                Attendance percentage by subject
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {subjectReports.length > 0 ? (
              subjectReports.map((item) => (
                <div
                  key={item.subject}
                  className="flex items-center justify-between rounded-xl border border-slate-100 p-4 transition hover:bg-slate-50"
                >
                  <div>
                    <p className="font-semibold text-slate-800">
                      {item.subject}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {item.classes} classes conducted
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-bold text-slate-900">
                      {item.attendance}%
                    </p>

                    <p className="text-xs text-slate-400">
                      Attendance
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-8 text-center text-sm text-slate-400">
                No subject attendance data available.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-900 p-6 text-white shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-300">
              Attendance Insight
            </p>

            <h2 className="mt-2 text-xl font-bold">
              {overallAttendance >= 75
                ? "Overall attendance is performing well."
                : "Overall attendance needs improvement."}
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-300">
              {overallAttendance >= 75
                ? "Continue monitoring students with consistently low attendance."
                : "Monitor attendance closely and identify students requiring attention."}
            </p>
          </div>

          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10">
            <TrendingUp size={27} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default Reports;