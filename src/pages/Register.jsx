import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  Building2,
  UserPlus,
  ScanFace,
} from "lucide-react";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");

    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "https://face-attendance-backend-f7e0.onrender.com/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password,
            department,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/dashboard");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-5">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
        <div className="flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white">
            <ScanFace size={28} />
          </div>
        </div>

        <div className="mt-6 text-center">
          <h1 className="text-3xl font-bold text-slate-900">
            Create Account
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Register as a professor to manage your attendance
          </p>
        </div>

        {message && (
          <div className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-600">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          <div>
            <label className="text-sm font-semibold text-slate-700">
              Professor Name
            </label>

            <div className="relative mt-2">
              <User
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
                className="w-full rounded-xl border border-slate-200 py-3 pl-12 pr-4 outline-none focus:border-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700">
              Email
            </label>

            <div className="relative mt-2">
              <Mail
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full rounded-xl border border-slate-200 py-3 pl-12 pr-4 outline-none focus:border-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700">
              Department
            </label>

            <div className="relative mt-2">
              <Building2
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Example: Computer Science"
                className="w-full rounded-xl border border-slate-200 py-3 pl-12 pr-4 outline-none focus:border-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700">
              Password
            </label>

            <div className="relative mt-2">
              <Lock
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                required
                className="w-full rounded-xl border border-slate-200 py-3 pl-12 pr-4 outline-none focus:border-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700">
              Confirm Password
            </label>

            <div className="relative mt-2">
              <Lock
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
                className="w-full rounded-xl border border-slate-200 py-3 pl-12 pr-4 outline-none focus:border-slate-900"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
          >
            <UserPlus size={19} />
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-slate-900 hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;