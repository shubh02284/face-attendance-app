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
  X,
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Attendance", path: "/attendance", icon: Camera },
  { name: "Students", path: "/students", icon: Users },
  { name: "Classes", path: "/classes", icon: GraduationCap },
  { name: "History", path: "/history", icon: History },
  { name: "Reports", path: "/reports", icon: BarChart3 },
];

function Sidebar({ mobileOpen, setMobileOpen }) {
  const navigation = (
    <>
      {menuItems.map((item) => {
        const Icon = item.icon;

        return (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => setMobileOpen?.(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                isActive
                  ? "bg-slate-900 text-white shadow-md dark:bg-slate-700"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
              }`
            }
          >
            <Icon size={20} />
            <span>{item.name}</span>
          </NavLink>
        );
      })}
    </>
  );

  const settingsLink = (
    <NavLink
      to="/settings"
      onClick={() => setMobileOpen?.(false)}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
          isActive
            ? "bg-slate-900 text-white dark:bg-slate-700"
            : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
        }`
      }
    >
      <Settings size={20} />
      <span>Settings</span>
    </NavLink>
  );

  const content = (
    <>
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
          <ScanFace size={24} />
        </div>

        <div className="min-w-0">
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">
            FaceAttend
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Smart Attendance
          </p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1">{navigation}</nav>

      {settingsLink}
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white p-4 md:flex dark:border-slate-700 dark:bg-slate-800">
        {content}
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[280px] max-w-[85vw] flex-col border-r border-slate-200 bg-white p-4 shadow-2xl transition-transform duration-300 md:hidden dark:border-slate-700 dark:bg-slate-800 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-2 flex items-center justify-end">
          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
            aria-label="Close menu"
          >
            <X size={22} />
          </button>
        </div>

        {content}
      </aside>
    </>
  );
}

export default Sidebar;
