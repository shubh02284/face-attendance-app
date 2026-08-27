import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Camera,
  Users,
  GraduationCap,
  History,
  BarChart3,
  Settings,
  ScanFace,
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Attendance", path: "/attendance", icon: Camera },
  { name: "Students", path: "/students", icon: Users },
  { name: "Classes", path: "/classes", icon: GraduationCap },
  { name: "History", path: "/history", icon: History },
  { name: "Reports", path: "/reports", icon: BarChart3 },
];

function Sidebar() {
  return (
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
          <ScanFace size={24} />
        </div>

        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">
            FaceAttend
          </h1>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Smart Attendance
          </p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-slate-900 text-white shadow-md"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
                }`
              }
            >
              <Icon size={20} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <NavLink
        to="/settings"
        className={({ isActive }) =>
          `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
            isActive
              ? "bg-slate-900 text-white"
              : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
          }`
        }
      >
        <Settings size={20} />
        <span>Settings</span>
      </NavLink>
    </aside>
  );
}

export default Sidebar;