"use client";
import React, { useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { Eye, EyeOff, Users, Search } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { EntrySearchSidebar } from "@/components/EntrySearchSidebar";
import {
  canEditDemographics,
  canEditHealth,
  canEditMedical,
} from "@/lib/auth-helpers";

// Types
interface AuthForm {
  email: string;
  password: string;
}

interface EntryForm {
  id?: string;
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
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchSidebarOpen, setSearchSidebarOpen] = useState(false);

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

  // Load entry into form
  const loadEntry = async (entryId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/entries/${entryId}`);
      if (!response.ok) throw new Error("Failed to fetch entry");
      const entry = await response.json();

      setEntryForm({
        id: entry.id,
        firstName: entry.firstName || "",
        middleName: entry.middleName || "",
        surname: entry.surname || "",
        gender: entry.gender || "male",
        maritalStatus: entry.maritalStatus || "",
        religion: entry.religion || "",
        dateOfBirth: entry.dateOfBirth
          ? new Date(entry.dateOfBirth).toISOString().split("T")[0]
          : "",
        phoneNumber: entry.phoneNumber || "",
        occupation: entry.occupation || "",
        bp: entry.bp || "",
        temp: entry.temp?.toString() || "",
        weight: entry.weight?.toString() || "",
        diagnosis: entry.diagnosis || "",
        treatment: entry.treatment || "",
      });
      setSuccess("Entry loaded successfully");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load entry");
    } finally {
      setLoading(false);
    }
  };

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
        setError(result.error);
      }
    } catch (err) {
      console.error("Login failed:", err);
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
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
      setSuccess(
        entryForm.id
          ? "Entry updated successfully!"
          : "Entry added successfully!"
      );

      // Clear form if new entry, keep if update
      if (!entryForm.id) {
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
      } else {
        // Update the id in case it was a new entry
        setEntryForm({ ...entryForm, id: newEntry.id });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add entry");
    } finally {
      setLoading(false);
    }
  };

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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition dark:text-black"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition dark:text-black"
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
  const userRole = session?.user?.role as
    | "admin"
    | "user"
    | "doctor"
    | "nurse"
    | undefined;
  const canEditDemo = canEditDemographics(userRole);
  const canEditHealthFields = canEditHealth(userRole);
  const canEditMedicalFields = canEditMedical(userRole);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <EntrySearchSidebar
        onSelectEntry={loadEntry}
        isOpen={searchSidebarOpen}
        onClose={() => {
          setSearchSidebarOpen(false);
          console.log(searchSidebarOpen);
        }}
      />

      <div className="flex-1 lg:ml-0 w-full">
        {/* Add Entry Form */}

        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white rounded-xl shadow-md p-8">
            <div className="flex sm:flex-row flex-col sm:justify-between gap-4 justify-start sm:items-center items-start mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {entryForm.id ? "Edit Entry" : "Add New Entry"}
              </h2>
              <button
                onClick={() => setSearchSidebarOpen(!searchSidebarOpen)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
              >
                <Search className="w-5 h-5" />
                {searchSidebarOpen ? "Hide Search" : "Search Entries"}
              </button>
            </div>

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
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-700">
                    Personal Information
                  </h3>
                  {!canEditDemo && (
                    <span className="text-xs text-gray-500 italic">
                      (Read-only - Entered by User role)
                    </span>
                  )}
                </div>
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
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none dark:text-black ${
                        !canEditDemo ? "bg-gray-100 cursor-not-allowed" : ""
                      }`}
                      disabled={!canEditDemo}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Middle Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required={canEditDemo}
                      value={entryForm.middleName}
                      onChange={(e) =>
                        setEntryForm({
                          ...entryForm,
                          middleName: e.target.value,
                        })
                      }
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none dark:text-black ${
                        !canEditDemo ? "bg-gray-100 cursor-not-allowed" : ""
                      }`}
                      disabled={!canEditDemo}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Surname <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required={canEditDemo}
                      value={entryForm.surname}
                      onChange={(e) =>
                        setEntryForm({
                          ...entryForm,
                          surname: e.target.value,
                        })
                      }
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none dark:text-black ${
                        !canEditDemo ? "bg-gray-100 cursor-not-allowed" : ""
                      }`}
                      disabled={!canEditDemo}
                    />
                  </div>
                </div>
              </div>

              {/* Demographics */}
              <div className="border-b border-gray-200 pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-700">
                    Demographics
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <select
                      required={canEditDemo}
                      value={entryForm.gender}
                      onChange={(e) =>
                        setEntryForm({ ...entryForm, gender: e.target.value })
                      }
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none dark:text-black ${
                        !canEditDemo ? "bg-gray-100 cursor-not-allowed" : ""
                      }`}
                      disabled={!canEditDemo}
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
                      required={canEditDemo}
                      value={entryForm.maritalStatus}
                      onChange={(e) =>
                        setEntryForm({
                          ...entryForm,
                          maritalStatus: e.target.value,
                        })
                      }
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none dark:text-black ${
                        !canEditDemo ? "bg-gray-100 cursor-not-allowed" : ""
                      }`}
                      disabled={!canEditDemo}
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
                      required={canEditDemo}
                      value={entryForm.religion}
                      onChange={(e) =>
                        setEntryForm({
                          ...entryForm,
                          religion: e.target.value,
                        })
                      }
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none dark:text-black ${
                        !canEditDemo ? "bg-gray-100 cursor-not-allowed" : ""
                      }`}
                      disabled={!canEditDemo}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required={canEditDemo}
                      value={entryForm.dateOfBirth}
                      onChange={(e) =>
                        setEntryForm({
                          ...entryForm,
                          dateOfBirth: e.target.value,
                        })
                      }
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none dark:text-black ${
                        !canEditDemo ? "bg-gray-100 cursor-not-allowed" : ""
                      }`}
                      disabled={!canEditDemo}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required={canEditDemo}
                      value={entryForm.phoneNumber}
                      onChange={(e) =>
                        setEntryForm({
                          ...entryForm,
                          phoneNumber: e.target.value,
                        })
                      }
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none dark:text-black ${
                        !canEditDemo ? "bg-gray-100 cursor-not-allowed" : ""
                      }`}
                      disabled={!canEditDemo}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Occupation <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required={canEditDemo}
                      value={entryForm.occupation}
                      onChange={(e) =>
                        setEntryForm({
                          ...entryForm,
                          occupation: e.target.value,
                        })
                      }
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none dark:text-black ${
                        !canEditDemo ? "bg-gray-100 cursor-not-allowed" : ""
                      }`}
                      disabled={!canEditDemo}
                    />
                  </div>
                </div>
              </div>

              {/* Health Metrics */}
              <div className="border-b border-gray-200 pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-700">
                    Health Metrics
                  </h3>
                  {!canEditHealthFields && (
                    <span className="text-xs text-gray-500 italic">
                      (Read-only - Entered by Nurse role)
                    </span>
                  )}
                </div>
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
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none dark:text-black ${
                        !canEditHealthFields
                          ? "bg-gray-100 cursor-not-allowed"
                          : ""
                      }`}
                      disabled={!canEditHealthFields}
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
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none dark:text-black ${
                        !canEditHealthFields
                          ? "bg-gray-100 cursor-not-allowed"
                          : ""
                      }`}
                      disabled={!canEditHealthFields}
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
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none dark:text-black ${
                        !canEditHealthFields
                          ? "bg-gray-100 cursor-not-allowed"
                          : ""
                      }`}
                      disabled={!canEditHealthFields}
                    />
                  </div>
                </div>
              </div>

              {/* Medical Information */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-700">
                    Medical Information
                  </h3>
                  {!canEditMedicalFields && (
                    <span className="text-xs text-gray-500 italic">
                      (Read-only - Entered by Doctor role)
                    </span>
                  )}
                </div>
                <div className="space-y-4">
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
                      rows={4}
                      placeholder="Enter diagnosis"
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none dark:text-black ${
                        !canEditMedicalFields
                          ? "bg-gray-100 cursor-not-allowed"
                          : ""
                      }`}
                      disabled={!canEditMedicalFields}
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
                      rows={4}
                      placeholder="Enter treatment"
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none dark:text-black ${
                        !canEditMedicalFields
                          ? "bg-gray-100 cursor-not-allowed"
                          : ""
                      }`}
                      disabled={!canEditMedicalFields}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
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
                    setSuccess(null);
                    setError(null);
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading
                    ? entryForm.id
                      ? "Updating..."
                      : "Adding..."
                    : entryForm.id
                    ? "Update Entry"
                    : "Add Entry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
