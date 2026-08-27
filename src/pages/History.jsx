import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import apiRequest from "../utils/api";

import {
  CalendarDays,
  Users,
  UserCheck,
  UserX,
  Search,
  Eye,
  X,
  Clock,
  BookOpen,
  GraduationCap,
} from "lucide-react";


function History() {
  const [attendanceData, setAttendanceData] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await apiRequest("/attendance");

      const formattedData = data.map((record) => ({
        id: record._id,
        date: record.date,
        time: record.createdAt
          ? new Date(record.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "-",
        branch: record.branch,
        semester: record.semester,
        section: record.section,
        subject: record.subject,
        total: record.totalStudents || 0,
        present: record.presentStudents?.length || 0,
        absent: record.absentStudents?.length || 0,
        presentStudents: record.presentStudents || [],
        absentStudents: record.absentStudents || [],
      }));

      setAttendanceData(formattedData);
    } catch (error) {
      console.error(error);
      setError(error.message || "Failed to fetch attendance history");
    } finally {
      setLoading(false);
    }
  };

  const filteredData = attendanceData.filter((record) => {
    const value = search.toLowerCase();

    return (
      record.subject.toLowerCase().includes(value) ||
      record.branch.toLowerCase().includes(value) ||
      record.semester.toLowerCase().includes(value) ||
      record.section.toLowerCase().includes(value) ||
      record.date.toLowerCase().includes(value)
    );
  });

  const totalClasses = attendanceData.length;

  const totalPresent = attendanceData.reduce(
    (total, record) => total + record.present,
    0
  );

  const totalAbsent = attendanceData.reduce(
    (total, record) => total + record.absent,
    0
  );

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          Loading attendance history...
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
          onClick={fetchAttendance}
          className="mt-4 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
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
          ATTENDANCE RECORDS
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
          Attendance History
        </h1>

        <p className="mt-2 text-slate-500 dark:text-slate-400">
          View and manage previously recorded attendance sessions.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 p-6 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
            <CalendarDays size={22} />
          </div>

          <p className="mt-5 text-sm font-medium text-slate-500 dark:text-slate-400">
            Total Classes
          </p>

          <h2 className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
            {totalClasses}
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 p-6 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
            <UserCheck size={22} />
          </div>

          <p className="mt-5 text-sm font-medium text-slate-500 dark:text-slate-400">
            Total Present
          </p>

          <h2 className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
            {totalPresent.toLocaleString()}
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 p-6 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-500 dark:bg-red-950/40 dark:text-red-400">
            <UserX size={22} />
          </div>

          <p className="mt-5 text-sm font-medium text-slate-500 dark:text-slate-400">
            Total Absent
          </p>

          <h2 className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
            {totalAbsent.toLocaleString()}
          </h2>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 p-5 shadow-sm">
        <div className="relative">
          <Search
            size={19}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by subject, branch, semester, section or date..."
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder:text-slate-400 dark:focus:border-slate-500"
          />
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px]">
            <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Date & Time
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Class
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Subject
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Total
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Present
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Absent
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((record) => (
                  <tr
                    key={record.id}
                    className="border-b border-slate-100 dark:border-slate-700 last:border-0 transition hover:bg-slate-50 dark:hover:bg-slate-700"
                  >
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-800 dark:text-white">
                        {record.date}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {record.time}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-800 dark:text-white">
                        {record.branch} • Semester {record.semester}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Section {record.section}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                      {record.subject}
                    </td>

                    <td className="px-6 py-4 text-center font-semibold text-slate-700 dark:text-slate-300">
                      {record.total}
                    </td>

                    <td className="px-6 py-4 text-center">
                      <span className="rounded-lg bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                        {record.present}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <span className="rounded-lg bg-red-50 px-3 py-1.5 text-sm font-semibold text-red-600 dark:bg-red-950/40 dark:text-red-400">
                        {record.absent}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => setSelectedRecord(record)}
                        className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                      >
                        <Eye size={16} />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-12 text-center text-sm text-slate-400"
                  >
                    No attendance records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-slate-800"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 p-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Attendance Details
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Class attendance session information.
                </p>
              </div>

              <button
                onClick={() => setSelectedRecord(null)}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-700 dark:hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-slate-50 dark:bg-slate-700 p-4">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <CalendarDays size={16} />
                    <span className="text-xs font-medium">DATE</span>
                  </div>

                  <p className="mt-2 font-semibold text-slate-800 dark:text-white">
                    {selectedRecord.date}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 dark:bg-slate-700 p-4">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <Clock size={16} />
                    <span className="text-xs font-medium">TIME</span>
                  </div>

                  <p className="mt-2 font-semibold text-slate-800 dark:text-white">
                    {selectedRecord.time}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 dark:border-slate-700 p-4">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <GraduationCap size={17} />
                  <span className="text-sm font-medium">Class</span>
                </div>

                <p className="mt-2 font-semibold text-slate-800 dark:text-white">
                  {selectedRecord.branch} • Semester {selectedRecord.semester}
                </p>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Section {selectedRecord.section}
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 dark:border-slate-700 p-4">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <BookOpen size={17} />
                  <span className="text-sm font-medium">Subject</span>
                </div>

                <p className="mt-2 font-semibold text-slate-800 dark:text-white">
                  {selectedRecord.subject}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl bg-slate-50 dark:bg-slate-700 p-4 text-center">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Total</p>
                  <p className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
                    {selectedRecord.total}
                  </p>
                </div>

                <div className="rounded-xl bg-emerald-50 p-4 text-center">
                  <p className="text-xs text-emerald-600">Present</p>
                  <p className="mt-2 text-xl font-bold text-emerald-700 dark:text-emerald-400">
                    {selectedRecord.present}
                  </p>
                </div>

                <div className="rounded-xl bg-red-50 p-4 text-center">
                  <p className="text-xs text-red-500 dark:text-red-400">Absent</p>
                  <p className="mt-2 text-xl font-bold text-red-600 dark:text-red-400">
                    {selectedRecord.absent}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-emerald-100 dark:border-emerald-900/50">
                  <div className="border-b border-emerald-100 bg-emerald-50 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/40">
                    <p className="font-semibold text-emerald-700 dark:text-emerald-400">
                      Present Students ({selectedRecord.presentStudents.length})
                    </p>
                  </div>

                  <div className="max-h-52 overflow-y-auto p-3">
                    {selectedRecord.presentStudents.length > 0 ? (
                      selectedRecord.presentStudents.map((student, index) => (
                        <div
                          key={student.studentId || index}
                          className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 py-3 last:border-0"
                        >
                          <div>
                            <p className="text-sm font-semibold text-slate-800 dark:text-white">
                              {student.name}
                            </p>
                            <p className="text-xs text-slate-400">
                              {student.rollNo}
                            </p>
                          </div>

                          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                            {student.confidence ?? 0}% match
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="py-4 text-center text-sm text-slate-400">
                        No present students.
                      </p>
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-red-100 dark:border-red-900/50">
                  <div className="border-b border-red-100 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/40">
                    <p className="font-semibold text-red-600 dark:text-red-400">
                      Absent Students ({selectedRecord.absentStudents.length})
                    </p>
                  </div>

                  <div className="max-h-52 overflow-y-auto p-3">
                    {selectedRecord.absentStudents.length > 0 ? (
                      selectedRecord.absentStudents.map((student, index) => (
                        <div
                          key={student.studentId || index}
                          className="border-b border-slate-100 dark:border-slate-700 py-3 last:border-0"
                        >
                          <p className="text-sm font-semibold text-slate-800 dark:text-white">
                            {student.name}
                          </p>
                          <p className="text-xs text-slate-400">
                            {student.rollNo}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="py-4 text-center text-sm text-slate-400">
                        No absent students.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-700 p-6">
              <button
                onClick={() => setSelectedRecord(null)}
                className="w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Close Details
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

export default History;