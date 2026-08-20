import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Upload,
  ScanFace,
  CheckCircle2,
  Image as ImageIcon,
  X,
  Users,
  UserCheck,
  UserX,
  ArrowLeft,
  Save,
  RotateCcw,
  AlertTriangle,
} from "lucide-react";
import apiRequest from "../utils/api";

const AI_API = "http://localhost:8000";
const MATCH_THRESHOLD = 0.45;

function Attendance() {
  const fileInputRef = useRef(null);

  const [classes, setClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(true);

  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [saved, setSaved] = useState(false);

  const [branch, setBranch] = useState("");
  const [semester, setSemester] = useState("");
  const [section, setSection] = useState("");
  const [subject, setSubject] = useState("");

  const [results, setResults] = useState([]);
  const [absentStudents, setAbsentStudents] = useState([]);
  const [totalFaces, setTotalFaces] = useState(0);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoadingClasses(true);

        const data = await apiRequest("/classes");

        setClasses(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
        alert(error.message || "Failed to load classes.");
      } finally {
        setLoadingClasses(false);
      }
    };

    fetchClasses();
  }, []);

  const branchOptions = [...new Set(classes.map((item) => item.branch))];

  const semesterOptions = [
    ...new Set(
      classes
        .filter((item) => item.branch === branch)
        .map((item) => item.semester)
    ),
  ];

  const sectionOptions = [
    ...new Set(
      classes
        .filter(
          (item) =>
            item.branch === branch &&
            item.semester === semester
        )
        .map((item) => item.section)
    ),
  ];

  const selectedClass = classes.find(
    (item) =>
      item.branch === branch &&
      item.semester === semester &&
      item.section === section
  );

  const subjectOptions = selectedClass?.subjects || [];

  const handleBranchChange = (value) => {
    setBranch(value);
    setSemester("");
    setSection("");
    setSubject("");
  };

  const handleSemesterChange = (value) => {
    setSemester(value);
    setSection("");
    setSubject("");
  };

  const handleSectionChange = (value) => {
    setSection(value);
    setSubject("");
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const imageUrl = URL.createObjectURL(file);

    setImage(imageUrl);
    setImageFile(file);
    setShowResults(false);
    setSaved(false);
    setResults([]);
    setAbsentStudents([]);
    setTotalFaces(0);
    setStatusMessage("");
  };

  const removeImage = () => {
    if (image) {
      URL.revokeObjectURL(image);
    }

    setImage(null);
    setImageFile(null);
    setShowResults(false);
    setSaved(false);
    setResults([]);
    setAbsentStudents([]);
    setTotalFaces(0);
    setStatusMessage("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const cosineSimilarity = (embedding1, embedding2) => {
    let dotProduct = 0;
    let magnitude1 = 0;
    let magnitude2 = 0;

    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i];
      magnitude1 += embedding1[i] * embedding1[i];
      magnitude2 += embedding2[i] * embedding2[i];
    }

    magnitude1 = Math.sqrt(magnitude1);
    magnitude2 = Math.sqrt(magnitude2);

    if (magnitude1 === 0 || magnitude2 === 0) {
      return 0;
    }

    return dotProduct / (magnitude1 * magnitude2);
  };

  const handleAttendance = async () => {
    if (
      !imageFile ||
      !branch ||
      !semester ||
      !section ||
      !subject
    ) {
      alert(
        "Please select Branch, Semester, Section, Subject and upload a photo."
      );
      return;
    }

    try {
      setProcessing(true);

      setStatusMessage("Fetching enrolled students...");

      const studentsData = await apiRequest("/students");

      const enrolledStudents = studentsData.filter(
        (student) =>
          student.faceEnrolled &&
          Array.isArray(student.faceDescriptor) &&
          student.faceDescriptor.length === 512 &&
          student.branch === branch &&
          student.semester === semester
      );

      if (enrolledStudents.length === 0) {
        throw new Error(
          "No AI face-enrolled students found for the selected class."
        );
      }

      setStatusMessage("InsightFace AI is detecting classroom faces...");

      const formData = new FormData();
      formData.append("file", imageFile);

      const aiResponse = await fetch(
        `${AI_API}/detect-faces`,
        {
          method: "POST",
          body: formData,
        }
      );

      const aiData = await aiResponse.json();

      if (!aiResponse.ok || !aiData.success) {
        throw new Error(
          aiData.message || "AI face detection failed."
        );
      }

      const detectedFaces = aiData.faces || [];

      if (detectedFaces.length === 0) {
        throw new Error(
          "No faces detected. Please upload a clearer classroom photo."
        );
      }

      setTotalFaces(detectedFaces.length);

      setStatusMessage(
        `AI detected ${detectedFaces.length} faces. Matching with enrolled students...`
      );

      const matchedStudentIds = new Set();
      const recognitionResults = [];

      detectedFaces.forEach((face, index) => {
        if (
          !Array.isArray(face.embedding) ||
          face.embedding.length !== 512
        ) {
          recognitionResults.push({
            id: `unknown-${index}`,
            name: "Unknown Face",
            rollNo: "Not Recognized",
            status: "Unknown",
            confidence: 0,
          });

          return;
        }

        let bestStudent = null;
        let bestSimilarity = -1;

        enrolledStudents.forEach((student) => {
          if (matchedStudentIds.has(student._id)) return;

          const similarity = cosineSimilarity(
            face.embedding,
            student.faceDescriptor
          );

          if (similarity > bestSimilarity) {
            bestSimilarity = similarity;
            bestStudent = student;
          }
        });

        if (
          bestStudent &&
          bestSimilarity >= MATCH_THRESHOLD
        ) {
          matchedStudentIds.add(bestStudent._id);

          recognitionResults.push({
            id: bestStudent._id,
            name: bestStudent.name,
            rollNo: bestStudent.rollNo,
            status: "Present",
            similarity: Number(bestSimilarity.toFixed(3)),
            confidence: Math.round(bestSimilarity * 100),
          });
        } else {
          recognitionResults.push({
            id: `unknown-${index}`,
            name: "Unknown Face",
            rollNo: "Not Recognized",
            status: "Unknown",
            similarity: Number(
              Math.max(0, bestSimilarity).toFixed(3)
            ),
            confidence: Math.max(
              0,
              Math.round(bestSimilarity * 100)
            ),
          });
        }
      });

      const absent = enrolledStudents
        .filter(
          (student) => !matchedStudentIds.has(student._id)
        )
        .map((student) => ({
          id: student._id,
          name: student.name,
          rollNo: student.rollNo,
        }));

      setResults(recognitionResults);
      setAbsentStudents(absent);
      setShowResults(true);
      setStatusMessage("");
    } catch (error) {
      console.error(error);
      alert(error.message || "AI face recognition failed.");
      setStatusMessage("");
    } finally {
      setProcessing(false);
    }
  };

  const handleSaveAttendance = async () => {
    try {
      setSaving(true);

      const presentStudents = results
        .filter((student) => student.status === "Present")
        .map((student) => ({
          studentId: student.id,
          name: student.name,
          rollNo: student.rollNo,
          confidence: student.confidence,
        }));

      const absentData = absentStudents.map((student) => ({
        studentId: student.id,
        name: student.name,
        rollNo: student.rollNo,
      }));

      const today = new Date().toISOString().split("T")[0];

      await apiRequest("/attendance", {
        method: "POST",
        body: JSON.stringify({
          branch,
          semester,
          section,
          subject,
          date: today,
          presentStudents,
          absentStudents: absentData,
          totalStudents:
            presentStudents.length + absentData.length,
        }),
      });

      setSaved(true);
    } catch (error) {
      alert(error.message || "Failed to save attendance.");
    } finally {
      setSaving(false);
    }
  };

  const resetAttendance = () => {
    if (image) {
      URL.revokeObjectURL(image);
    }

    setImage(null);
    setImageFile(null);
    setProcessing(false);
    setShowResults(false);
    setSaved(false);
    setBranch("");
    setSemester("");
    setSection("");
    setSubject("");
    setResults([]);
    setAbsentStudents([]);
    setTotalFaces(0);
    setStatusMessage("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const recognizedStudents = results.filter(
    (student) => student.status === "Present"
  );

  const unknownFaces = results.filter(
    (student) => student.status === "Unknown"
  );

  if (showResults) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mx-auto w-full max-w-6xl"
      >
        <button
          onClick={() => setShowResults(false)}
          disabled={saving || saved}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900 disabled:opacity-50"
        >
          <ArrowLeft size={18} />
          Back to Attendance
        </button>

        <div className="mb-8">
          <p className="text-sm font-semibold tracking-wider text-slate-400">
            AI RECOGNITION RESULTS
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Attendance Results
          </h1>

          <p className="mt-2 text-slate-500">
            AI recognized students from the classroom photo.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
              <Users size={22} />
            </div>

            <p className="mt-5 text-sm font-medium text-slate-500">
              Faces Detected
            </p>

            <h2 className="mt-1 text-3xl font-bold text-slate-900">
              {totalFaces}
            </h2>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <UserCheck size={22} />
            </div>

            <p className="mt-5 text-sm font-medium text-slate-500">
              Present
            </p>

            <h2 className="mt-1 text-3xl font-bold text-slate-900">
              {recognizedStudents.length}
            </h2>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-500">
              <UserX size={22} />
            </div>

            <p className="mt-5 text-sm font-medium text-slate-500">
              Unknown Faces
            </p>

            <h2 className="mt-1 text-3xl font-bold text-slate-900">
              {unknownFaces.length}
            </h2>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">
              Class Photo
            </h2>

            <div className="mt-5 overflow-hidden rounded-xl">
              <img
                src={image}
                alt="Classroom"
                className="h-[350px] w-full object-cover"
              />
            </div>

            <div className="mt-5 rounded-xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-800">
                {branch} • {semester} • Section {section}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {subject}
              </p>
            </div>

            <div className="mt-4 rounded-xl bg-red-50 p-4">
              <p className="text-sm font-semibold text-red-600">
                Absent Students: {absentStudents.length}
              </p>

              {absentStudents.length > 0 && (
                <div className="mt-3 space-y-2">
                  {absentStudents.map((student) => (
                    <p
                      key={student.id}
                      className="text-sm text-slate-600"
                    >
                      {student.name} — {student.rollNo}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Recognition Results
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  AI matched detected faces with enrolled students.
                </p>
              </div>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {totalFaces} Faces
              </span>
            </div>

            <div className="mt-6 space-y-3">
              {results.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between rounded-xl border border-slate-100 p-4"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-800">
                      {student.name}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {student.rollNo}
                      {student.similarity !== undefined &&
                        ` • Match: ${student.similarity}`}
                    </p>
                  </div>

                  <span
                    className={`ml-4 shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                      student.status === "Present"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-red-50 text-red-500"
                    }`}
                  >
                    {student.status}
                  </span>
                </div>
              ))}
            </div>

            {!saved ? (
              <button
                onClick={handleSaveAttendance}
                disabled={saving}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
              >
                <Save size={20} />
                {saving
                  ? "Saving Attendance..."
                  : "Confirm & Save Attendance"}
              </button>
            ) : (
              <div className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-600">
                <CheckCircle2 size={20} />
                Attendance Saved Successfully
              </div>
            )}

            {saved && (
              <button
                onClick={resetAttendance}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <RotateCcw size={18} />
                Take New Attendance
              </button>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mx-auto w-full max-w-6xl"
    >
      <div className="mb-8">
        <p className="text-sm font-semibold tracking-wider text-slate-400">
          AI ATTENDANCE
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Take Attendance
        </h1>

        <p className="mt-2 text-slate-500">
          Select class details and upload a classroom photo.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">
            Class Details
          </h2>

          <div className="mt-6 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Branch
              </label>

              <select
                value={branch}
                onChange={(e) => handleBranchChange(e.target.value)}
                disabled={loadingClasses}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-900 disabled:opacity-60"
              >
                <option value="">
                  {loadingClasses
                    ? "Loading classes..."
                    : "Select Branch"}
                </option>

                {branchOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Semester
              </label>

              <select
                value={semester}
                onChange={(e) =>
                  handleSemesterChange(e.target.value)
                }
                disabled={!branch}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-900 disabled:opacity-60"
              >
                <option value="">Select Semester</option>

                {semesterOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Section
              </label>

              <select
                value={section}
                onChange={(e) =>
                  handleSectionChange(e.target.value)
                }
                disabled={!semester}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-900 disabled:opacity-60"
              >
                <option value="">Select Section</option>

                {sectionOptions.map((item) => (
                  <option key={item} value={item}>
                    Section {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Subject
              </label>

              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={!section}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-900 disabled:opacity-60"
              >
                <option value="">Select Subject</option>

                {subjectOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-8 rounded-xl bg-slate-50 p-4">
            <div className="flex gap-3">
              <div className="rounded-lg bg-white p-2 shadow-sm">
                <ScanFace size={20} />
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-800">
                  AI Face Recognition
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Students are recognized automatically using their
                  enrolled AI face embeddings.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Class Photo
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Upload a clear classroom photo.
              </p>
            </div>

            {image && (
              <button
                onClick={removeImage}
                disabled={processing}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-red-500 disabled:opacity-50"
              >
                <X size={20} />
              </button>
            )}
          </div>

          {!image ? (
            <div className="mt-6 flex min-h-[380px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm">
                <ImageIcon size={28} />
              </div>

              <h3 className="mt-5 text-lg font-bold text-slate-800">
                Upload Class Photo
              </h3>

              <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                Make sure student faces are clearly visible.
              </p>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-6 flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
              >
                <Upload size={18} />
                Upload Photo
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
          ) : (
            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
              <img
                src={image}
                alt="Classroom preview"
                className="h-[380px] w-full object-cover"
              />
            </div>
          )}

          {image && (
            <>
              {statusMessage && (
                <div className="mt-4 rounded-xl bg-blue-50 px-4 py-3 text-sm font-medium text-blue-600">
                  {statusMessage}
                </div>
              )}

              <button
                onClick={handleAttendance}
                disabled={processing}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-4 text-sm font-semibold text-white disabled:opacity-70"
              >
                {processing ? (
                  <>
                    <ScanFace className="animate-pulse" size={20} />
                    AI is Recognizing Faces...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={20} />
                    Detect & Mark Attendance
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default Attendance;