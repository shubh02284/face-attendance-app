import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  UserPlus,
  Users,
  Trash2,
  Camera,
  X,
  Loader2,
  ScanFace,
} from "lucide-react";
import apiRequest from "../utils/api";

function Students() {
  const fileInputRef = useRef(null);

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [branch, setBranch] = useState("");
  const [semester, setSemester] = useState("");

  const [faceImage, setFaceImage] = useState("");
  const [faceDescriptor, setFaceDescriptor] = useState([]);
  const [faceMessage, setFaceMessage] = useState("");
  const [error, setError] = useState("");

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await apiRequest("/students");
      setStudents(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const resetForm = () => {
    setName("");
    setRollNo("");
    setBranch("");
    setSemester("");
    setFaceImage("");
    setFaceDescriptor([]);
    setFaceMessage("");
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCloseForm = () => {
    resetForm();
    setShowForm(false);
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setFaceMessage("");
    setError("");
    setFaceDescriptor([]);

    const reader = new FileReader();

    reader.onloadend = () => {
      setFaceImage(reader.result);
    };

    reader.readAsDataURL(file);

    try {
      setFaceMessage("Detecting face and generating AI embedding...");

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        "https://face-attendance-ai.onrender.com/get-face-embedding",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!data.success) {
        setFaceMessage(data.message || "Face detection failed");
        return;
      }

      if (
        !Array.isArray(data.embedding) ||
        data.embedding.length !== 512
      ) {
        setFaceMessage("Invalid AI face embedding generated");
        return;
      }

      setFaceDescriptor(data.embedding);

      setFaceMessage(
        `Face enrolled successfully • ${Math.round(
          (data.confidence || 0) * 100
        )}% confidence`
      );
    } catch (error) {
      setFaceMessage("AI face service is not running");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!name.trim() || !rollNo.trim() || !branch || !semester) {
      setError("Please fill all student details");
      return;
    }

    if (faceDescriptor.length !== 512) {
      setError(
        "Please upload a clear photo with exactly one face before saving"
      );
      return;
    }

    try {
      setSubmitting(true);

      const data = await apiRequest("/students", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          rollNo: rollNo.trim(),
          branch,
          semester,
          faceImage,
          faceDescriptor,
        }),
      });

      setStudents((prev) => [data.student, ...prev]);

      resetForm();
      setShowForm(false);
    } catch (error) {
      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this student?"
    );

    if (!confirmed) return;

    try {
      setError("");

      await apiRequest(`/students/${id}`, {
        method: "DELETE",
      });

      setStudents((prev) =>
        prev.filter((student) => student._id !== id)
      );
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mx-auto w-full max-w-7xl"
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold tracking-wider text-slate-400">
            STUDENT MANAGEMENT
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Students
          </h1>

          <p className="mt-2 text-slate-500">
            Add students and enroll their faces for AI recognition.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-800"
        >
          <UserPlus size={19} />
          Add Student
        </button>
      </div>

      {error && !showForm && (
        <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <Users size={21} />
            </div>

            <div>
              <h2 className="font-bold text-slate-900">
                All Students
              </h2>

              <p className="text-sm text-slate-500">
                {students.length} student
                {students.length !== 1 ? "s" : ""} registered
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-3 p-12 text-slate-500">
            <Loader2 size={22} className="animate-spin" />
            Loading students...
          </div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center">
            <Users
              size={42}
              className="mx-auto text-slate-300"
            />

            <h3 className="mt-4 font-bold text-slate-800">
              No students found
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Add your first student to start using face recognition.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Roll No</th>
                  <th className="px-6 py-4">Branch</th>
                  <th className="px-6 py-4">Semester</th>
                  <th className="px-6 py-4">Face Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>

              <tbody>
                {students.map((student) => (
                  <tr
                    key={student._id}
                    className="border-t border-slate-100"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {student.faceImage ? (
                          <img
                            src={student.faceImage}
                            alt={student.name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-500">
                            {student.name?.charAt(0)?.toUpperCase()}
                          </div>
                        )}

                        <p className="font-semibold text-slate-800">
                          {student.name}
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm font-medium text-slate-600">
                      {student.rollNo}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {student.branch}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {student.semester}
                    </td>

                    <td className="px-6 py-4">
                      {student.faceEnrolled ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                          <ScanFace size={14} />
                          Enrolled
                        </span>
                      ) : (
                        <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-500">
                          Not Enrolled
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(student._id)}
                        className="rounded-lg p-2 text-red-500 transition hover:bg-red-50"
                        title="Delete Student"
                      >
                        <Trash2 size={19} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Add Student
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Upload one clear face photo for AI enrollment.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseForm}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={21} />
              </button>
            </div>

            {error && (
              <div className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-600">
                {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2"
            >
              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Student Name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter student name"
                  required
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Roll Number
                </label>

                <input
                  type="text"
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
                  placeholder="Enter roll number"
                  required
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Branch
                </label>

                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  required
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-slate-900"
                >
                  <option value="">Select Branch</option>
                  <option value="MCA">MCA</option>
                  <option value="CSE">CSE</option>
                  <option value="IT">IT</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Semester
                </label>

                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  required
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-slate-900"
                >
                  <option value="">Select Semester</option>
                  <option value="Semester 1">Semester 1</option>
                  <option value="Semester 2">Semester 2</option>
                  <option value="Semester 3">Semester 3</option>
                  <option value="Semester 4">Semester 4</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-sm font-semibold text-slate-700">
                  Face Photo
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  required
                  className="mt-2 block w-full rounded-xl border border-slate-200 p-3 text-sm"
                />

                {faceImage && (
                  <div className="mt-4 flex items-center gap-4 rounded-xl bg-slate-50 p-4">
                    <img
                      src={faceImage}
                      alt="Preview"
                      className="h-20 w-20 rounded-xl object-cover"
                    />

                    <div>
                      <p className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <Camera size={17} />
                        Photo selected
                      </p>

                      {faceMessage && (
                        <p className="mt-1 text-sm text-slate-500">
                          {faceMessage}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 sm:col-span-2">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white disabled:opacity-60"
                >
                  {submitting && (
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                  )}

                  {submitting
                    ? "Saving..."
                    : "Save Student"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default Students;