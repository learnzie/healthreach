"use client";

import React, { useState, useEffect } from "react";
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
  LineChart,
  Line,
} from "recharts";
import { BarChart3, Filter, X } from "lucide-react";

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

const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    gender: "",
    diagnosis: "",
    treatment: "",
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      if (filters.gender) queryParams.append("gender", filters.gender);
      if (filters.diagnosis) queryParams.append("diagnosis", filters.diagnosis);
      if (filters.treatment) queryParams.append("treatment", filters.treatment);

      const [statsRes, analyticsRes] = await Promise.all([
        fetch(`/api/entries/stats?${queryParams.toString()}`),
        fetch(`/api/entries/analytics?${queryParams.toString()}`),
      ]);

      if (!statsRes.ok || !analyticsRes.ok) {
        throw new Error("Failed to fetch data");
      }

      const [statsData, analyticsData] = await Promise.all([
        statsRes.json(),
        analyticsRes.json(),
      ]);

      setStats(statsData);
      setAnalytics(analyticsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchData();
    }
  }, [session, filters]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Please log in to view the dashboard</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading dashboard data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Insights and visualizations from outreach data
            </p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
          >
            <Filter className="w-5 h-5" />
            Filters
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Filter Data</h2>
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender
                </label>
                <select
                  value={filters.gender}
                  onChange={(e) =>
                    setFilters({ ...filters, gender: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                >
                  <option value="">All</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Diagnosis
                </label>
                <input
                  type="text"
                  value={filters.diagnosis}
                  onChange={(e) =>
                    setFilters({ ...filters, diagnosis: e.target.value })
                  }
                  placeholder="Filter by diagnosis..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Treatment
                </label>
                <input
                  type="text"
                  value={filters.treatment}
                  onChange={(e) =>
                    setFilters({ ...filters, treatment: e.target.value })
                  }
                  placeholder="Filter by treatment..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setFilters({ gender: "", diagnosis: "", treatment: "" })}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}

        {/* Overview Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">
                Total Entries
              </h3>
              <p className="text-3xl font-bold text-gray-800">{stats.totalEntries}</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">
                Avg Weight
              </h3>
              <p className="text-3xl font-bold text-gray-800">
                {stats.averageWeight
                  ? `${stats.averageWeight.toFixed(1)} kg`
                  : "N/A"}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">
                Avg Temperature
              </h3>
              <p className="text-3xl font-bold text-gray-800">
                {stats.averageTemp
                  ? `${stats.averageTemp.toFixed(1)}°C`
                  : "N/A"}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">
                Gender Split
              </h3>
              <p className="text-3xl font-bold text-gray-800">
                {stats.genderDistribution.length > 0
                  ? `${stats.genderDistribution[0]?.count || 0} / ${
                      stats.genderDistribution[1]?.count || 0
                    }`
                  : "N/A"}
              </p>
            </div>
          </div>
        )}

        {/* Charts Grid */}
        {analytics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Age Distribution */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Age Distribution
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.ageDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="ageGroup" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#6366f1" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Gender Distribution */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Gender Distribution
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.genderDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ gender, percent }) =>
                      `${gender}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
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
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Diagnosis Distribution */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Diagnosis Distribution
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.diagnosisDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="diagnosis"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Treatment Distribution */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Treatment Distribution
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.treatmentDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="treatment"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#ec4899" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Blood Pressure vs Age */}
            {analytics.bpVsAge.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Blood Pressure vs Age
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      type="number"
                      dataKey="age"
                      name="Age"
                      label={{ value: "Age", position: "insideBottom", offset: -5 }}
                    />
                    <YAxis
                      type="number"
                      dataKey="systolic"
                      name="Systolic BP"
                      label={{ value: "Systolic BP", angle: -90, position: "insideLeft" }}
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
                            <div className="bg-white p-3 border border-gray-300 rounded shadow">
                              <p>Age: {data.age}</p>
                              <p>BP: {data.bp}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Scatter dataKey="systolic" fill="#f59e0b" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Weight vs Age */}
            {analytics.weightVsAge.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Weight vs Age
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      type="number"
                      dataKey="age"
                      name="Age"
                      label={{ value: "Age", position: "insideBottom", offset: -5 }}
                    />
                    <YAxis
                      type="number"
                      dataKey="weight"
                      name="Weight"
                      label={{ value: "Weight (kg)", angle: -90, position: "insideLeft" }}
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
                            <div className="bg-white p-3 border border-gray-300 rounded shadow">
                              <p>Age: {data.age}</p>
                              <p>Weight: {data.weight} kg</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Scatter dataKey="weight" fill="#10b981" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Marital Status Distribution */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Marital Status Distribution
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.maritalStatusDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#6366f1" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Religion Distribution */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Religion Distribution
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.religionDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="religion"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

