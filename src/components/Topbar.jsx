import { Bell, Search, UserCircle, Menu } from "lucide-react";

function Topbar({ onMenuClick }) {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const hour = new Date().getHours();
  let greeting = "Good Morning";

  if (hour >= 12 && hour < 17) greeting = "Good Afternoon";
  else if (hour >= 17) greeting = "Good Evening";

  return (
    <header className="flex min-h-20 shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 sm:px-6 dark:border-slate-700 dark:bg-slate-800">
      <div className="flex min-w-0 items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 md:hidden dark:text-slate-300 dark:hover:bg-slate-700"
          aria-label="Open menu"
        >
          <Menu size={23} />
        </button>

        <div className="min-w-0">
          <p className="text-xs text-slate-500 sm:text-sm dark:text-slate-400">
            Welcome back,
          </p>

          <h2 className="truncate text-base font-bold text-slate-900 sm:text-xl dark:text-white">
            {greeting}, {user.name || "Professor"} 👋
          </h2>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
        <div className="hidden items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 lg:flex dark:bg-slate-700">
          <Search size={18} className="text-slate-400" />

          <input
            type="text"
            placeholder="Search..."
            className="w-40 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-400"
          />
        </div>

        <button
          className="rounded-xl p-2.5 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
          aria-label="Notifications"
        >
          <Bell size={21} />
        </button>

        <button className="flex items-center gap-2 rounded-xl border border-slate-200 px-2.5 py-2 sm:px-3 dark:border-slate-600">
          <UserCircle size={24} className="text-slate-700 dark:text-slate-200" />

          <span className="hidden text-sm font-medium text-slate-700 xl:block dark:text-slate-200">
            {user.name || "Professor"}
          </span>
        </button>
      </div>
    </header>
  );
}

export default Topbar;
