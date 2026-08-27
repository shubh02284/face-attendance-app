import { Bell, Search, UserCircle } from "lucide-react";

function Topbar() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const hour = new Date().getHours();
  let greeting = "Good Morning";

  if (hour >= 12 && hour < 17) greeting = "Good Afternoon";
  else if (hour >= 17) greeting = "Good Evening";

  return (
    <header className="flex h-20 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div>
        <p className="text-sm text-slate-500">Welcome back,</p>
        <h2 className="text-xl font-bold text-slate-900">
          {greeting}, {user.name || "Professor"} 👋
        </h2>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 lg:flex">
          <Search size={18} className="text-slate-400" />

          <input
            type="text"
            placeholder="Search..."
            className="w-40 bg-transparent text-sm outline-none"
          />
        </div>

        <button className="rounded-xl p-2.5 text-slate-500 hover:bg-slate-100">
          <Bell size={21} />
        </button>

        <button className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2">
          <UserCircle size={24} className="text-slate-700" />

          <span className="hidden text-sm font-medium text-slate-700 xl:block">
            {user.name || "Professor"}
          </span>
        </button>
      </div>
    </header>
  );
}

export default Topbar;