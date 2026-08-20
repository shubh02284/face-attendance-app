import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  GraduationCap,
  Users,
  BookOpen,
  X,
  Trash2,
  ChevronRight,
} from "lucide-react";
import apiRequest from "../utils/api";

function Classes() {
  const [classes, setClasses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    branch: "",
    semester: "",
    section: "",
    students: "",
    subjects: "",
  });

  const fetchClasses = async () => {
    try {
      setLoading(true);

      const data = await apiRequest("/classes");

      setClasses(data);
    } catch (error) {
      console.error(error);
      alert(error.message || "Failed to load classes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const resetForm = () => {
    setFormData({
      branch: "",
      semester: "",
      section: "",
      students: "",
      subjects: "",
    });
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleAddClass = async (event) => {
    event.preventDefault();

    const subjectList = formData.subjects
      .split(",")
      .map((subject) => subject.trim())
      .filter(Boolean);

    if (
      !formData.branch ||
      !formData.semester ||
      !formData.section ||
      !formData.students ||
      subjectList.length === 0
    ) {
      alert("Please fill all class details.");
      return;
    }

    try {
      setSaving(true);

      const data = await apiRequest("/classes", {
        method: "POST",
        body: JSON.stringify({
          branch: formData.branch,
          semester: formData.semester,
          section: formData.section,
          students: Number(formData.students),
          subjects: subjectList,
        }),
      });

      setClasses((previous) => [data.class, ...previous]);

      closeModal();
    } catch (error) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteClass = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this class?"
    );

    if (!confirmed) return;

    try {
      await apiRequest(`/classes/${id}`, {
        method: "DELETE",
      });

      setClasses((previous) =>
        previous.filter((item) => item._id !== id)
      );
    } catch (error) {
      alert(error.message);
    }
  };

  const totalStudents = classes.reduce(
    (total, item) => total + Number(item.students || 0),
    0
  );

  const totalSubjects = classes.reduce(
    (total, item) => total + (item.subjects?.length || 0),
    0
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mx-auto w-full max-w-7xl"
    >
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold tracking-wider text-slate-400">
            ACADEMIC MANAGEMENT
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Classes
          </h1>

          <p className="mt-2 text-slate-500">
            Manage branches, semesters, sections and subjects.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:scale-[1.02] hover:bg-slate-800"
        >
          <Plus size={19} />
          Add Class
        </button>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
            <GraduationCap size={22} />
          </div>

          <p className="mt-5 text-sm font-medium text-slate-500">
            Total Classes
          </p>

          <h2 className="mt-1 text-3xl font-bold text-slate-900">
            {classes.length}
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Users size={22} />
          </div>

          <p className="mt-5 text-sm font-medium text-slate-500">
            Total Students
          </p>

          <h2 className="mt-1 text-3xl font-bold text-slate-900">
            {totalStudents}
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
            <BookOpen size={22} />
          </div>

          <p className="mt-5 text-sm font-medium text-slate-500">
            Active Subjects
          </p>

          <h2 className="mt-1 text-3xl font-bold text-slate-900">
            {totalSubjects}
          </h2>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-sm text-slate-500">
          Loading classes...
        </div>
      ) : (
        <>
          <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
            {classes.map((item) => (
              <div
                key={item._id}
                className="group min-w-0 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-white">
                      <GraduationCap size={23} />
                    </div>

                    <div>
                      <h2 className="font-bold text-slate-900">
                        {item.branch}
                      </h2>

                      <p className="text-sm text-slate-500">
                        {item.semester} • Section {item.section}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteClass(item._id)}
                    className="rounded-lg p-2 text-slate-300 transition hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="mt-6 flex items-center justify-between rounded-xl bg-slate-50 p-4">
                  <div className="flex items-center gap-2">
                    <Users size={18} className="text-slate-500" />

                    <span className="text-sm font-medium text-slate-600">
                      Students
                    </span>
                  </div>

                  <span className="font-bold text-slate-900">
                    {item.students}
                  </span>
                </div>

                <div className="mt-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-800">
                      Subjects
                    </h3>

                    <span className="text-xs text-slate-400">
                      {item.subjects?.length || 0} subjects
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {item.subjects?.map((subject) => (
                      <span
                        key={subject}
                        className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-600"
                      >
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>

                <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                  View Class
                  <ChevronRight size={17} />
                </button>
              </div>
            ))}
          </div>

          {classes.length === 0 && (
            <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
              <GraduationCap
                size={40}
                className="mx-auto text-slate-300"
              />

              <h2 className="mt-4 font-bold text-slate-800">
                No classes yet
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Add your first class to get started.
              </p>
            </div>
          )}
        </>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 p-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Add New Class
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Create a class and assign its subjects.
                </p>
              </div>

              <button
                onClick={closeModal}
                disabled={saving}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddClass} className="p-6">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Branch
                  </label>

                  <select
                    name="branch"
                    value={formData.branch}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-900"
                  >
                    <option value="">Select Branch</option>
                    <option>MCA</option>
                    <option>CSE</option>
                    <option>IT</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Semester
                  </label>

                  <select
                    name="semester"
                    value={formData.semester}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-900"
                  >
                    <option value="">Select Semester</option>
                    <option>Semester 1</option>
                    <option>Semester 2</option>
                    <option>Semester 3</option>
                    <option>Semester 4</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Section
                  </label>

                  <input
                    name="section"
                    value={formData.section}
                    onChange={handleChange}
                    placeholder="e.g. A"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm uppercase outline-none focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Number of Students
                  </label>

                  <input
                    type="number"
                    min="1"
                    name="students"
                    value={formData.students}
                    onChange={handleChange}
                    placeholder="e.g. 45"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <div className="mt-5">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Subjects
                </label>

                <input
                  name="subjects"
                  value={formData.subjects}
                  onChange={handleChange}
                  placeholder="DBMS, Operating Systems, Data Structures"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-900"
                />

                <p className="mt-2 text-xs text-slate-400">
                  Separate multiple subjects using commas.
                </p>
              </div>

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Creating..." : "Create Class"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

export default Classes;