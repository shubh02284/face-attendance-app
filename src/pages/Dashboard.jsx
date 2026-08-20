import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  UserCheck,
  Building2,
  Camera,
  ArrowUpRight,
  Clock3,
  ScanFace,
} from "lucide-react";
import { Link } from "react-router-dom";
import apiRequest from "../utils/api";

function Dashboard() {
  const [dashboardData, setDashboardData] = useState({
    totalStudents: 0,
    presentToday: 0,
    todayAttendance: 0,
    activeClasses: 0,
    recentAttendance: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const [studentsData, attendanceData] = await Promise.all([
        apiRequest("/students"),
        apiRequest("/attendance"),
      ]);

      const today = new Date().toISOString().split("T")[0];

      const todayRecords = attendanceData.filter(
        (record) => record.date === today
      );

      const presentToday = todayRecords.reduce(
        (total, record) =>
          total + (record.presentStudents?.length || 0),
        0
      );

      const totalTodayStudents = todayRecords.reduce(
        (total, record) =>
          total +
          (record.presentStudents?.length || 0) +
          (record.absentStudents?.length || 0),
        0
      );

      const todayAttendance =
        totalTodayStudents > 0
          ? Math.round(
              (presentToday / totalTodayStudents) * 100
            )
          : 0;

      const uniqueClasses = new Set(
        studentsData.map(
          (student) =>
            `${student.branch}-${student.semester}-${student.section || ""}`
        )
      );

      const recentAttendance = attendanceData
        .slice(0, 5)
        .map((record) => ({
          id: record._id,
          subject: record.subject,
          className: `${record.branch} - Semester ${record.semester}`,
          section: record.section,
          students: `${record.totalStudents || 0} Students`,
          present: record.presentStudents?.length || 0,
          absent: record.absentStudents?.length || 0,
          time: record.createdAt
            ? new Date(record.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "-",
          date: record.date,
        }));

      setDashboardData({
        totalStudents: studentsData.length,
        presentToday,
        todayAttendance,
        activeClasses: uniqueClasses.size,
        recentAttendance,
      });
    } catch (error) {
      console.error(error);
      setError(error.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const {
    totalStudents,
    presentToday,
    todayAttendance,
    activeClasses,
    recentAttendance,
  } = dashboardData;

  const stats = [
    {
      title: "Total Students",
      value: totalStudents.toLocaleString(),
      subtitle: "Registered students",
      icon: Users,
    },
    {
      title: "Present Today",
      value: presentToday.toLocaleString(),
      subtitle: `${todayAttendance}% attendance`,
      icon: UserCheck,
    },
    {
      title: "Active Classes",
      value: activeClasses.toLocaleString(),
      subtitle: "Across all branches",
      icon: Building2,
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-sm font-medium text-slate-500">
          Loading dashboard...
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
          onClick={fetchDashboardData}
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
      <section className="mb-8">
        <p className="text-sm font-semibold tracking-wider text-slate-400">
          OVERVIEW
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Attendance Dashboard
        </h1>

        <p className="mt-2 text-slate-500">
          Track your classes and manage attendance effortlessly.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="min-w-0 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="rounded-xl bg-slate-900 p-3 text-white">
                  <Icon size={22} />
                </div>

                <ArrowUpRight size={20} className="text-slate-400" />
              </div>

              <p className="mt-5 text-sm font-medium text-slate-500">
                {stat.title}
              </p>

              <h2 className="mt-1 text-3xl font-bold text-slate-900">
                {stat.value}
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                {stat.subtitle}
              </p>
            </div>
          );
        })}
      </section>

      <section className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="min-w-0 rounded-2xl bg-slate-900 p-8 text-white">
          <div className="flex h-full flex-col justify-between">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                <ScanFace size={25} />
              </div>

              <h2 className="mt-6 text-2xl font-bold">
                Ready to take attendance?
              </h2>

              <p className="mt-3 max-w-md text-sm leading-6 text-slate-300">
                Capture one class photo and let AI detect and recognize
                students automatically.
              </p>
            </div>

            <Link
              to="/attendance"
              className="mt-8 inline-flex w-fit items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:scale-105"
            >
              <Camera size={19} />
              Take Attendance
              <ArrowUpRight size={18} />
            </Link>
          </div>
        </div>

        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Today's Activity
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Latest attendance sessions
              </p>
            </div>

            <Clock3 className="text-slate-400" size={22} />
          </div>

          <div className="mt-6 space-y-5">
            {recentAttendance.filter(
              (item) =>
                item.date === new Date().toISOString().split("T")[0]
            ).length > 0 ? (
              recentAttendance
                .filter(
                  (item) =>
                    item.date === new Date().toISOString().split("T")[0]
                )
                .slice(0, 2)
                .map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between border-b border-slate-100 pb-4 last:border-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-800">
                        {item.subject}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {item.className} • Section {item.section}
                      </p>
                    </div>

                    <span className="ml-4 shrink-0 text-sm text-slate-400">
                      {item.time}
                    </span>
                  </div>
                ))
            ) : (
              <p className="py-8 text-center text-sm text-slate-400">
                No attendance taken today.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Recent Attendance
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Recently completed attendance sessions
            </p>
          </div>

          <Link
            to="/history"
            className="shrink-0 text-sm font-semibold text-slate-900 hover:underline"
          >
            View All
          </Link>
        </div>

        <div className="mt-6 space-y-3">
          {recentAttendance.length > 0 ? (
            recentAttendance.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-4 rounded-xl border border-slate-100 p-4 lg:flex-row lg:items-center lg:justify-between"
              >
                <div>
                  <h3 className="font-semibold text-slate-800">
                    {item.subject}
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    {item.className} • Section {item.section} •{" "}
                    {item.students}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-sm text-slate-400">
                    {item.date} • {item.time}
                  </span>

                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                    Completed
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="py-10 text-center text-sm text-slate-400">
              No attendance records available.
            </p>
          )}
        </div>
      </section>
    </motion.div>
  );
}

export default Dashboard;