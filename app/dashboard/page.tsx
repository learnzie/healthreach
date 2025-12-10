"use client";

import React, { useState } from "react";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
} from "recharts";
import {
  BarChart3,
  Filter,
  X,
  TrendingUp,
  Users,
  Activity,
  Thermometer,
} from "lucide-react";

interface StatsData {
  totalEntries: number;
  genderDistribution: { gender: string; count: number }[];
  diagnosisDistribution: { diagnosis: string; count: number }[];
  treatmentDistribution: { treatment: string; count: number }[];
  averageWeight: number | null;
  averageTemp: number | null;
}

interface AnalyticsData {
  ageDistribution: { ageGroup: string; count: number }[];
  genderDistribution: { gender: string; count: number }[];
  maritalStatusDistribution: { status: string; count: number }[];
  religionDistribution: { religion: string; count: number }[];
  diagnosisDistribution: { diagnosis: string; count: number }[];
  treatmentDistribution: { treatment: string; count: number }[];
  bpVsAge: { age: number; systolic: number; bp: string }[];
  weightVsAge: { age: number; weight: number }[];
  weightByAgeGroup: {
    ageGroup: string;
    weights: number[];
    average: number;
  }[];
  crossTabulations: {
    diagnosisByGender: Record<string, Record<string, number>>;
    treatmentByAgeGroup: Record<string, Record<string, number>>;
  };
}

const COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#06b6d4",
  "#f43f5e",
];

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    gender: "",
    diagnosis: "",
    treatment: "",
  });

  // Build query params for filters
  const queryParams = new URLSearchParams();
  if (filters.gender) queryParams.append("gender", filters.gender);
  if (filters.diagnosis) queryParams.append("diagnosis", filters.diagnosis);
  if (filters.treatment) queryParams.append("treatment", filters.treatment);

  // SWR fetcher
  const fetcher = (url: string) =>
    fetch(url).then((r) => {
      if (!r.ok) throw new Error("Failed to fetch data");
      return r.json();
    });

  const {
    data: stats,
    error: statsError,
    isLoading: statsLoading,
    mutate: mutateStats,
  } = useSWR<StatsData>(
    session ? `/api/entries/stats?${queryParams.toString()}` : null,
    fetcher
  );
  const {
    data: analytics,
    error: analyticsError,
    isLoading: analyticsLoading,
    mutate: mutateAnalytics,
  } = useSWR<AnalyticsData>(
    session ? `/api/entries/analytics?${queryParams.toString()}` : null,
    fetcher
  );

  const loading = statsLoading || analyticsLoading;
  const swrError = statsError || analyticsError;

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-linear-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-linear-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-8 h-8 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">
            Authentication Required
          </h2>
          <p className="text-gray-600 text-center">
            Please log in to view the analytics dashboard
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (swrError || error) {
    return (
      <div className="min-h-screen bg-linear-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md border-l-4 border-red-500">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-700">{swrError?.message || error}</p>
          <button
            onClick={() => {
              mutateStats();
              mutateAnalytics();
              setError(null);
            }}
            className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-50 via-white to-purple-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-linear-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Analytics Dashboard
                </h1>
              </div>
              <p className="text-gray-600 ml-15">
                Comprehensive insights and visualizations from outreach data
              </p>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 shadow-lg ${
                showFilters
                  ? "bg-white text-indigo-600 border-2 border-indigo-600"
                  : "bg-linear-to-r from-indigo-600 to-purple-600 text-white hover:shadow-xl hover:scale-105"
              }`}
            >
              <Filter className="w-5 h-5" />
              {showFilters ? "Hide Filters" : "Show Filters"}
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-indigo-100 animate-in slide-in-from-top duration-300">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-indigo-600" />
                <h2 className="text-xl font-bold text-gray-800">Filter Data</h2>
              </div>
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-400 hover:text-gray-600 transition p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Gender
                </label>
                <select
                  value={filters.gender}
                  onChange={(e) =>
                    setFilters({ ...filters, gender: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                >
                  <option value="">All Genders</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Diagnosis
                </label>
                <input
                  type="text"
                  value={filters.diagnosis}
                  onChange={(e) =>
                    setFilters({ ...filters, diagnosis: e.target.value })
                  }
                  placeholder="Filter by diagnosis..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Treatment
                </label>
                <input
                  type="text"
                  value={filters.treatment}
                  onChange={(e) =>
                    setFilters({ ...filters, treatment: e.target.value })
                  }
                  placeholder="Filter by treatment..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() =>
                  setFilters({ gender: "", diagnosis: "", treatment: "" })
                }
                className="px-6 py-2.5 border-2 border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition hover:border-gray-400"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}

        {/* Overview Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-indigo-600 hover:shadow-xl transition-all duration-200 hover:scale-105">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  Total Entries
                </h3>
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-indigo-600" />
                </div>
              </div>
              <p className="text-4xl font-bold text-gray-800">
                {stats.totalEntries}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Total patient records
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-600 hover:shadow-xl transition-all duration-200 hover:scale-105">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  Avg Weight
                </h3>
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              <p className="text-4xl font-bold text-gray-800">
                {stats.averageWeight
                  ? `${stats.averageWeight.toFixed(1)}`
                  : "N/A"}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {stats.averageWeight ? "kilograms" : "No data available"}
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-pink-600 hover:shadow-xl transition-all duration-200 hover:scale-105">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  Avg Temperature
                </h3>
                <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                  <Thermometer className="w-5 h-5 text-pink-600" />
                </div>
              </div>
              <p className="text-4xl font-bold text-gray-800">
                {stats.averageTemp ? `${stats.averageTemp.toFixed(1)}°` : "N/A"}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {stats.averageTemp ? "celsius" : "No data available"}
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-amber-600 hover:shadow-xl transition-all duration-200 hover:scale-105">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  Gender Split
                </h3>
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-amber-600" />
                </div>
              </div>
              <p className="text-4xl font-bold text-gray-800">
                {stats.genderDistribution.length > 0
                  ? `${stats.genderDistribution[0]?.count || 0} / ${
                      stats.genderDistribution[1]?.count || 0
                    }`
                  : "N/A"}
              </p>
              <p className="text-sm text-gray-500 mt-2">Male / Female ratio</p>
            </div>
          </div>
        )}

        {/* Charts Grid */}
        {analytics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Age Distribution */}
            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-2 h-8 bg-linear-to-b from-indigo-600 to-purple-600 rounded-full"></div>
                <h2 className="text-xl font-bold text-gray-800">
                  Age Distribution
                </h2>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.ageDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="ageGroup" tick={{ fill: "#666" }} />
                  <YAxis tick={{ fill: "#666" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "2px solid #e5e7eb",
                      borderRadius: "12px",
                      boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="count"
                    fill="url(#colorAge)"
                    radius={[8, 8, 0, 0]}
                  />
                  <defs>
                    <linearGradient id="colorAge" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Gender Distribution */}
            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-2 h-8 bg-linear-to-b from-purple-600 to-pink-600 rounded-full"></div>
                <h2 className="text-xl font-bold text-gray-800">
                  Gender Distribution
                </h2>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.genderDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ percent, payload }) =>
                      `${payload.gender}: ${
                        percent !== undefined ? (percent * 100).toFixed(0) : "0"
                      }%`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {analytics.genderDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "2px solid #e5e7eb",
                      borderRadius: "12px",
                      boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Diagnosis Distribution */}
            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-2 h-8 bg-linear-to-b from-pink-600 to-rose-600 rounded-full"></div>
                <h2 className="text-xl font-bold text-gray-800">
                  Diagnosis Distribution
                </h2>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.diagnosisDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="diagnosis"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    tick={{ fill: "#666", fontSize: 12 }}
                  />
                  <YAxis tick={{ fill: "#666" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "2px solid #e5e7eb",
                      borderRadius: "12px",
                      boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill="url(#colorDiagnosis)"
                    radius={[8, 8, 0, 0]}
                  />
                  <defs>
                    <linearGradient
                      id="colorDiagnosis"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#ec4899" />
                      <stop offset="100%" stopColor="#f43f5e" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Treatment Distribution */}
            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-2 h-8 bg-linear-to-b from-amber-600 to-orange-600 rounded-full"></div>
                <h2 className="text-xl font-bold text-gray-800">
                  Treatment Distribution
                </h2>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.treatmentDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="treatment"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    tick={{ fill: "#666", fontSize: 12 }}
                  />
                  <YAxis tick={{ fill: "#666" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "2px solid #e5e7eb",
                      borderRadius: "12px",
                      boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill="url(#colorTreatment)"
                    radius={[8, 8, 0, 0]}
                  />
                  <defs>
                    <linearGradient
                      id="colorTreatment"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#f97316" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Blood Pressure vs Age */}
            {analytics.bpVsAge.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-2 h-8 bg-linear-to-b from-emerald-600 to-teal-600 rounded-full"></div>
                  <h2 className="text-xl font-bold text-gray-800">
                    Blood Pressure vs Age
                  </h2>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      type="number"
                      dataKey="age"
                      name="Age"
                      label={{
                        value: "Age",
                        position: "insideBottom",
                        offset: -5,
                        fill: "#666",
                      }}
                      tick={{ fill: "#666" }}
                    />
                    <YAxis
                      type="number"
                      dataKey="systolic"
                      name="Systolic BP"
                      label={{
                        value: "Systolic BP",
                        angle: -90,
                        position: "insideLeft",
                        fill: "#666",
                      }}
                      tick={{ fill: "#666" }}
                    />
                    <Tooltip
                      cursor={{ strokeDasharray: "3 3" }}
                      content={({ active, payload }) => {
                        if (active && payload && payload[0]) {
                          const data = payload[0].payload as {
                            age: number;
                            systolic: number;
                            bp: string;
                          };
                          return (
                            <div className="bg-white p-4 border-2 border-gray-200 rounded-xl shadow-lg">
                              <p className="font-semibold text-gray-800">
                                Age: {data.age}
                              </p>
                              <p className="text-gray-600">BP: {data.bp}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Scatter dataKey="systolic" fill="#10b981" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Weight vs Age */}
            {analytics.weightVsAge.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-2 h-8 bg-linear-to-b from-cyan-600 to-blue-600 rounded-full"></div>
                  <h2 className="text-xl font-bold text-gray-800">
                    Weight vs Age
                  </h2>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      type="number"
                      dataKey="age"
                      name="Age"
                      label={{
                        value: "Age",
                        position: "insideBottom",
                        offset: -5,
                        fill: "#666",
                      }}
                      tick={{ fill: "#666" }}
                    />
                    <YAxis
                      type="number"
                      dataKey="weight"
                      name="Weight"
                      label={{
                        value: "Weight (kg)",
                        angle: -90,
                        position: "insideLeft",
                        fill: "#666",
                      }}
                      tick={{ fill: "#666" }}
                    />
                    <Tooltip
                      cursor={{ strokeDasharray: "3 3" }}
                      content={({ active, payload }) => {
                        if (active && payload && payload[0]) {
                          const data = payload[0].payload as {
                            age: number;
                            weight: number;
                          };
                          return (
                            <div className="bg-white p-4 border-2 border-gray-200 rounded-xl shadow-lg">
                              <p className="font-semibold text-gray-800">
                                Age: {data.age}
                              </p>
                              <p className="text-gray-600">
                                Weight: {data.weight} kg
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Scatter dataKey="weight" fill="#06b6d4" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Marital Status Distribution */}
            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-2 h-8 bg-linear-to-b from-violet-600 to-purple-600 rounded-full"></div>
                <h2 className="text-xl font-bold text-gray-800">
                  Marital Status Distribution
                </h2>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.maritalStatusDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="status" tick={{ fill: "#666" }} />
                  <YAxis tick={{ fill: "#666" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "2px solid #e5e7eb",
                      borderRadius: "12px",
                      boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill="url(#colorMarital)"
                    radius={[8, 8, 0, 0]}
                  />
                  <defs>
                    <linearGradient
                      id="colorMarital"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#a78bfa" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* Religion Distribution */}
            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-2 h-8 bg-linear-to-b from-rose-600 to-pink-600 rounded-full"></div>
                <h2 className="text-xl font-bold text-gray-800">
                  Religion Distribution
                </h2>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.religionDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="religion"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    tick={{ fill: "#666", fontSize: 12 }}
                  />
                  <YAxis tick={{ fill: "#666" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "2px solid #e5e7eb",
                      borderRadius: "12px",
                      boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill="url(#colorReligion)"
                    radius={[8, 8, 0, 0]}
                  />
                  <defs>
                    <linearGradient
                      id="colorReligion"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#f43f5e" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
