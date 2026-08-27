import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Building2,
  LogOut,
  Moon,
  Bell,
  ShieldCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function Settings() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [notifications, setNotifications] = useState(
    localStorage.getItem("notifications") !== "false"
  );

  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode") === "true";

    setDarkMode(savedMode);
    document.documentElement.classList.toggle("dark", savedMode);
  }, []);

  const toggleNotifications = () => {
    const newValue = !notifications;

    setNotifications(newValue);
    localStorage.setItem("notifications", newValue);
  };

  const toggleDarkMode = () => {
  const newValue = !darkMode;

  setDarkMode(newValue);
  localStorage.setItem("darkMode", newValue);

  document.documentElement.classList.toggle("dark", newValue);
};

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login", { replace: true });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mx-auto w-full max-w-5xl"
    >
      <div className="mb-8">
        <p className="text-sm font-semibold tracking-wider text-slate-400">
          ACCOUNT SETTINGS
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
          Settings
        </h1>

        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Manage your profile and application preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
              <User size={21} />
            </div>

            <div>
              <h2 className="font-bold text-slate-900 dark:text-white">
                Professor Profile
              </h2>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                Your account information
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-700">
              <div className="flex items-center gap-3">
                <User size={18} className="text-slate-400" />

                <div>
                  <p className="text-xs text-slate-400">Name</p>

                  <p className="mt-1 font-semibold text-slate-800 dark:text-white">
                    {user.name || "Professor"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-700">
              <div className="flex items-center gap-3">
                <Mail size={18} className="text-slate-400" />

                <div>
                  <p className="text-xs text-slate-400">Email</p>

                  <p className="mt-1 font-semibold text-slate-800 dark:text-white">
                    {user.email || "Not available"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-700">
              <div className="flex items-center gap-3">
                <Building2 size={18} className="text-slate-400" />

                <div>
                  <p className="text-xs text-slate-400">Department</p>

                  <p className="mt-1 font-semibold text-slate-800 dark:text-white">
                    {user.department || "Not specified"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-white">
              <ShieldCheck size={21} />
            </div>

            <div>
              <h2 className="font-bold text-slate-900 dark:text-white">
                Preferences
              </h2>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                Customize your experience
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {/* Notifications */}
            <div className="flex items-center justify-between rounded-xl border border-slate-100 p-4 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <Bell size={19} className="text-slate-500" />

                <div>
                  <p className="font-semibold text-slate-800 dark:text-white">
                    Notifications
                  </p>

                  <p className="text-xs text-slate-400">
                    Attendance alerts and updates
                  </p>
                </div>
              </div>

              <button
                onClick={toggleNotifications}
                className={`relative h-6 w-11 rounded-full transition ${
                  notifications ? "bg-slate-900" : "bg-slate-200"
                }`}
              >
                <span
                  className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                    notifications ? "left-6" : "left-1"
                  }`}
                />
              </button>
            </div>

            {/* Dark Mode */}
            <div className="flex items-center justify-between rounded-xl border border-slate-100 p-4 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <Moon size={19} className="text-slate-500" />

                <div>
                  <p className="font-semibold text-slate-800 dark:text-white">
                    Dark Mode
                  </p>

                  <p className="text-xs text-slate-400">
                    Change application appearance
                  </p>
                </div>
              </div>

              <button
                onClick={toggleDarkMode}
                className={`relative h-6 w-11 rounded-full transition ${
                  darkMode ? "bg-slate-900" : "bg-slate-200"
                }`}
              >
                <span
                  className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                    darkMode ? "left-6" : "left-1"
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="mt-8 border-t border-slate-100 pt-6 dark:border-slate-700">
            <button
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100"
            >
              <LogOut size={19} />
              Logout
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default Settings;