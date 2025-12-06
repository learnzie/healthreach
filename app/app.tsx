"use client";
import React, { useState, useEffect } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  UserPlus,
  Users,
  LogOut,
  BarChart3,
  Search,
} from "lucide-react";

// Types
interface Entry {
  id: string;
  firstName: string;
  middleName: string;
  surname: string;
  gender: string;
  maritalStatus: string;
  religion: string;
  dateOfBirth: string;
  phoneNumber: string;
  occupation: string;
  bp?: string | null;
  temp?: number | null;
  weight?: number | null;
  diagnosis?: string | null;
  treatment?: string | null;
  createdBy?: {
    id: string;
    email: string;
    name?: string | null;
  };
  createdAt: string;
}

interface AuthForm {
  email: string;
  password: string;
}

interface EntryForm {
  firstName: string;
  middleName: string;
  surname: string;
  gender: string;
  maritalStatus: string;
  religion: string;
  dateOfBirth: string;
  phoneNumber: string;
  occupation: string;
  bp: string;
  temp: string;
  weight: string;
  diagnosis: string;
  treatment: string;
}

export const App: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentView, setCurrentView] = useState<
    "addEntry" | "viewEntries" | "dashboard"
  >("addEntry");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Auth form state
  const [authForm, setAuthForm] = useState<AuthForm>({
    email: "",
    password: "",
  });

  // Entry form state
  const [entryForm, setEntryForm] = useState<EntryForm>({
    firstName: "",
    middleName: "",
    surname: "",
    gender: "male",
    maritalStatus: "",
    religion: "",
    dateOfBirth: "",
    phoneNumber: "",
    occupation: "",
    bp: "",
    temp: "",
    weight: "",
    diagnosis: "",
    treatment: "",
  });

  // Fetch entries
  const fetchEntries = async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/entries?page=${page}&limit=20`);
      if (!response.ok) throw new Error("Failed to fetch entries");
      const data = await response.json();
      setEntries(data.entries || []);
      setPagination(data.pagination || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch entries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session && currentView === "viewEntries") {
      fetchEntries(currentPage);
    }
  }, [session, currentView, currentPage]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email: authForm.email,
        password: authForm.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        setCurrentView("addEntry");
      }
    } catch (err) {
      console.error("Login failed:", err);
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    setCurrentView("addEntry");
    setEntries([]);
  };

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await fetch("/api/entries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(entryForm),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create entry");
      }

      const newEntry = await response.json();
      console.log("New entry:", newEntry);
      setSuccess("Entry added successfully!");
      setEntryForm({
        firstName: "",
        middleName: "",
        surname: "",
        gender: "male",
        maritalStatus: "",
        religion: "",
        dateOfBirth: "",
        phoneNumber: "",
        occupation: "",
        bp: "",
        temp: "",
        weight: "",
        diagnosis: "",
        treatment: "",
      });

      // Refresh entries list if on that view
      if (currentView === "viewEntries") {
        fetchEntries();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add entry");
    } finally {
      setLoading(false);
    }
  };

  const filteredEntries = entries.filter((entry) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      entry.firstName.toLowerCase().includes(search) ||
      entry.middleName.toLowerCase().includes(search) ||
      entry.surname.toLowerCase().includes(search) ||
      entry.phoneNumber.includes(search) ||
      entry.occupation.toLowerCase().includes(search)
    );
  });

  // Show loading state while checking session
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  // Login Screen
  if (!session) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
              <Users className="w-8 h-8 text-indigo-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">HealthReach</h1>
            <p className="text-gray-600 mt-2">
              Sign in to access the outreach management system
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                value={authForm.email}
                onChange={(e) =>
                  setAuthForm({ ...authForm, email: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={authForm.password}
                  onChange={(e) =>
                    setAuthForm({ ...authForm, password: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Main Dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Users className="w-8 h-8 text-indigo-600" />
              <span className="text-xl font-bold text-gray-800">
                HealthReach
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {session.user?.email}
              </span>
              <button
                onClick={() => setCurrentView("addEntry")}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  currentView === "addEntry"
                    ? "bg-indigo-100 text-indigo-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <UserPlus className="w-5 h-5 inline mr-2" />
                Add Entry
              </button>
              <button
                onClick={() => {
                  setCurrentView("viewEntries");
                  fetchEntries();
                }}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  currentView === "viewEntries"
                    ? "bg-indigo-100 text-indigo-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Users className="w-5 h-5 inline mr-2" />
                View Entries ({entries.length})
              </button>
              <button
                onClick={() => router.push("/dashboard")}
                className="px-4 py-2 rounded-lg font-medium transition text-gray-600 hover:bg-gray-100"
              >
                <BarChart3 className="w-5 h-5 inline mr-2" />
                Dashboard
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium transition"
              >
                <LogOut className="w-5 h-5 inline mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Add Entry Form */}
      {currentView === "addEntry" && (
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Add New Entry
            </h2>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                {success}
              </div>
            )}

            <form onSubmit={handleAddEntry} className="space-y-6">
              {/* Personal Information */}
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={entryForm.firstName}
                      onChange={(e) =>
                        setEntryForm({
                          ...entryForm,
                          firstName: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Middle Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={entryForm.middleName}
                      onChange={(e) =>
                        setEntryForm({
                          ...entryForm,
                          middleName: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Surname <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={entryForm.surname}
                      onChange={(e) =>
                        setEntryForm({ ...entryForm, surname: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Demographics */}
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  Demographics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={entryForm.gender}
                      onChange={(e) =>
                        setEntryForm({ ...entryForm, gender: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Marital Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={entryForm.maritalStatus}
                      onChange={(e) =>
                        setEntryForm({
                          ...entryForm,
                          maritalStatus: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    >
                      <option value="">Select</option>
                      <option value="single">Single</option>
                      <option value="married">Married</option>
                      <option value="divorced">Divorced</option>
                      <option value="widowed">Widowed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Religion <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={entryForm.religion}
                      onChange={(e) =>
                        setEntryForm({ ...entryForm, religion: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={entryForm.dateOfBirth}
                      onChange={(e) =>
                        setEntryForm({
                          ...entryForm,
                          dateOfBirth: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={entryForm.phoneNumber}
                      onChange={(e) =>
                        setEntryForm({
                          ...entryForm,
                          phoneNumber: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Occupation <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={entryForm.occupation}
                      onChange={(e) =>
                        setEntryForm({
                          ...entryForm,
                          occupation: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Health Metrics */}
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  Health Metrics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Blood Pressure
                    </label>
                    <input
                      type="text"
                      value={entryForm.bp}
                      onChange={(e) =>
                        setEntryForm({ ...entryForm, bp: e.target.value })
                      }
                      placeholder="e.g., 120/80"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Temperature (°C)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={entryForm.temp}
                      onChange={(e) =>
                        setEntryForm({ ...entryForm, temp: e.target.value })
                      }
                      placeholder="e.g., 36.5"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={entryForm.weight}
                      onChange={(e) =>
                        setEntryForm({ ...entryForm, weight: e.target.value })
                      }
                      placeholder="e.g., 70.5"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Medical Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  Medical Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Diagnosis
                    </label>
                    <textarea
                      value={entryForm.diagnosis}
                      onChange={(e) =>
                        setEntryForm({
                          ...entryForm,
                          diagnosis: e.target.value,
                        })
                      }
                      rows={3}
                      placeholder="Enter diagnosis"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Treatment
                    </label>
                    <textarea
                      value={entryForm.treatment}
                      onChange={(e) =>
                        setEntryForm({
                          ...entryForm,
                          treatment: e.target.value,
                        })
                      }
                      rows={3}
                      placeholder="Enter treatment"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() =>
                    setEntryForm({
                      firstName: "",
                      middleName: "",
                      surname: "",
                      gender: "male",
                      maritalStatus: "",
                      religion: "",
                      dateOfBirth: "",
                      phoneNumber: "",
                      occupation: "",
                      bp: "",
                      temp: "",
                      weight: "",
                      diagnosis: "",
                      treatment: "",
                    })
                  }
                  className="px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Adding..." : "Add Entry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Entries */}
      {currentView === "viewEntries" && (
        <div className="max-w-7xl mx-auto p-6">
          <div className="bg-white rounded-xl shadow-md p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Registered Entries
              </h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search entries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12 text-gray-500">Loading...</div>
            ) : filteredEntries.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">
                  {searchTerm
                    ? "No entries match your search"
                    : "No entries registered yet"}
                </p>
                <button
                  onClick={() => setCurrentView("addEntry")}
                  className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  Add First Entry
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {filteredEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">
                            {entry.firstName} {entry.middleName} {entry.surname}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {entry.phoneNumber} • {entry.occupation}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {entry.gender} • {entry.maritalStatus} •{" "}
                            {entry.religion}
                          </p>
                          {entry.diagnosis && (
                            <p className="text-sm text-blue-600 mt-1">
                              Diagnosis: {entry.diagnosis}
                            </p>
                          )}
                          {entry.createdBy && (
                            <p className="text-xs text-gray-400 mt-2">
                              Created by:{" "}
                              {entry.createdBy.name || entry.createdBy.email}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {pagination && pagination.totalPages > 1 && (
                  <div className="mt-6 flex justify-center items-center gap-2">
                    <button
                      onClick={() => {
                        if (currentPage > 1) {
                          setCurrentPage(currentPage - 1);
                          setSearchTerm(""); // Clear search when paginating
                        }
                      }}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="text-gray-600">
                      Page {currentPage} of {pagination.totalPages} (
                      {pagination.total} total)
                    </span>
                    <button
                      onClick={() => {
                        if (currentPage < pagination.totalPages) {
                          setCurrentPage(currentPage + 1);
                          setSearchTerm(""); // Clear search when paginating
                        }
                      }}
                      disabled={currentPage === pagination.totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
